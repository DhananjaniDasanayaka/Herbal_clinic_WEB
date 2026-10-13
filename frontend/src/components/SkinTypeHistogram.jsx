
import { useEffect, useState } from 'react';

const skinTypes = [
    { name: 'Vata', color: 'bg-purple-500' },
    { name: 'Pitta', color: 'bg-orange-500' },
    { name: 'Kapha', color: 'bg-blue-500' },
    { name: 'Balanced', color: 'bg-green-600' }
];

export default function SkinTypeHistogram() {
    const [counts, setCounts] = useState({
        Vata: 0,
        Pitta: 0,
        Kapha: 0,
        Balanced: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const token = localStorage.getItem('token');

        async function fetchStatistics() {
            try {
                const response = await fetch(
                    'http://localhost:5000/api/assessments/stats/skin-types',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to load statistics');
                }

                const data = await response.json();
                setCounts(data.counts);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('Could not load skin type statistics.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchStatistics();

        return () => controller.abort();
    }, []);

    const maxCount = Math.max(
        1,
        ...skinTypes.map(type => counts[type.name] || 0)
    );

    const totalUsers = skinTypes.reduce(
        (sum, type) => sum + (counts[type.name] || 0),
        0
    );

    return (
        <div className="mb-8 p-6 bg-white border border-green-100 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold font-serif text-[#5C7A4E]">
                Skin Type Distribution
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                Distribution of users by their latest saved AI assessment
            </p>

            {loading ? (
                <p className="mt-6 text-gray-500">Loading statistics...</p>
            ) : error ? (
                <p className="mt-6 text-red-600">{error}</p>
            ) : (
                <>
                    <p className="mt-4 text-sm text-gray-700">
                        Total assessed users: <strong>{totalUsers}</strong>
                    </p>

                    <div className="grid grid-cols-4 gap-3 mt-8">
                        {skinTypes.map(type => {
                            const count = counts[type.name] || 0;
                            const height = (count / maxCount) * 100;

                            return (
                                <div
                                    key={type.name}
                                    className="flex flex-col items-center"
                                >
                                    <span className="font-bold text-gray-800 mb-2">
                                        {count}
                                    </span>

                                    <div className="h-44 w-full flex items-end justify-center border-b border-gray-300">
                                        <div
                                            className={`w-12 max-w-full rounded-t-lg ${type.color}`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>

                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 mt-3">
                                        {type.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {totalUsers === 0 && (
                        <p className="text-center text-sm text-gray-500 mt-5">
                            No saved assessments available yet.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
