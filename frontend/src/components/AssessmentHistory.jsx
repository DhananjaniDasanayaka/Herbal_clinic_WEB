import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QUESTIONNAIRE_QUESTIONS, QUESTIONNAIRE_SECTIONS } from '../config/questionnaireConfig';

// Uses the existing authenticated Express endpoints. No new backend route is needed.
const API_BASE = 'http://localhost:5000/api/assessments';
const PREVIEW_LIMIT = 5;
const DOSHAS = [
    { key: 'vata', name: 'Vata', bar: 'bg-sky-600' },
    { key: 'pitta', name: 'Pitta', bar: 'bg-rose-500' },
    { key: 'kapha', name: 'Kapha', bar: 'bg-emerald-600' }
];

function displayDate(value) {
    if (!value) return 'Date unavailable';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Date unavailable'
        : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function displayConfidence(value) {
    const n = Number(value);
    return Number.isFinite(n) ? `${n.toFixed(2)}%` : 'Not available';
}

function getAnswer(answers, key) {
    if (!answers) return null;
    if (answers instanceof Map) return answers.get(key);
    return Object.prototype.hasOwnProperty.call(answers, key) ? answers[key] : null;
}

async function apiError(response, fallback) {
    try {
        const result = await response.json();
        return result.message || fallback;
    } catch {
        return fallback;
    }
}

function ScoreBars({ scores }) {
    const percentages = scores?.percentages;
    if (!percentages) return <p className="text-sm text-gray-500">No questionnaire scores were saved for this assessment.</p>;

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {DOSHAS.map(({ key, name, bar }) => {
                const number = Number(percentages[key]);
                const percentage = Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
                const raw = Number(scores?.[key]);
                return (
                    <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-800">{name}</span>
                            <span className="text-gray-600">{percentage}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${percentage}%` }} />
                        </div>
                        {Number.isFinite(raw) && <p className="mt-1.5 text-[11px] text-gray-500">{raw} indicator points</p>}
                    </div>
                );
            })}
        </div>
    );
}

function AnswerHistory({ answers, skipped }) {
    if (skipped) {
        return <p className="text-sm text-gray-500">The questionnaire was skipped for this assessment.</p>;
    }
    if (!answers || (answers instanceof Map ? answers.size === 0 : Object.keys(answers).length === 0)) {
        return <p className="text-sm text-gray-500">Questionnaire answers are unavailable for this record.</p>;
    }
    return (
        <div className="space-y-4">
            {QUESTIONNAIRE_SECTIONS.map((section) => (
                <div key={section.id} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
                    <h4 className="mb-3 text-sm font-bold text-[#5C7A4E]">{section.title}</h4>
                    <div className="space-y-3">
                        {QUESTIONNAIRE_QUESTIONS.filter((q) => q.sectionId === section.id).map((q) => {
                            const id = getAnswer(answers, q.id);
                            const option = q.options.find((o) => o.id === id);
                            return (
                                <div key={q.id} className="border-b border-gray-200/70 pb-2 last:border-b-0 last:pb-0">
                                    <p className="text-xs font-semibold text-gray-800">{q.title}</p>
                                    <p className="mt-0.5 text-xs text-gray-600">{option?.label || (id ? 'Response unavailable in current questionnaire version' : 'Not answered')}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function RecommendationHistory({ recommendations }) {
    const groups = [
        { key: 'ayurvedic', title: 'Traditional Ayurvedic care' },
        { key: 'evidenceBased', title: 'General evidence-based skincare' },
        { key: 'lifestyle', title: 'Lifestyle and wellness' }
    ];
    return (
        <div className="space-y-3">
            {groups.map(({ key, title }) => {
                const recommendationsForGroup = recommendations?.[key] || [];
                return (
                    <div key={key} className="rounded-xl border border-gray-100 p-3">
                        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                        {Array.isArray(recommendationsForGroup) && recommendationsForGroup.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-gray-700">
                                {recommendationsForGroup.map((entry, index) => <li key={`${key}-${index}`}>{entry}</li>)}
                            </ul>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500">No suggestions recorded.</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function AssessmentHistory({ history = [], onDeleted, loading = false, error = '' }) {
    const [showAll, setShowAll] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const closeButtonRef = useRef(null);

    const visibleHistory = showAll ? history : history.slice(0, PREVIEW_LIMIT);

    useEffect(() => {
        if (!selectedId || pendingDelete) return undefined;
        const controller = new AbortController();
        setSelectedAssessment(null);
        setDetailsError('');
        setDetailsLoading(true);

        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Please log in again to view saved assessments.');
                const response = await fetch(`${API_BASE}/${encodeURIComponent(selectedId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                    cache: 'no-store'
                });
                if (!response.ok) throw new Error(await apiError(response, 'Unable to open this assessment.'));
                const assessment = await response.json();
                if (!controller.signal.aborted) setSelectedAssessment(assessment);
            } catch (err) {
                if (!controller.signal.aborted) setDetailsError(err.message || 'Unable to load assessment details.');
            } finally {
                if (!controller.signal.aborted) setDetailsLoading(false);
            }
        };
        fetchDetails();
        return () => controller.abort();
    }, [selectedId, pendingDelete]);

    useEffect(() => {
        const modalOpen = Boolean(selectedId || pendingDelete);
        if (!modalOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && !deleting) {
                if (pendingDelete) {
                    setPendingDelete(null);
                    setDeleteError('');
                } else {
                    setSelectedId(null);
                    setSelectedAssessment(null);
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        const id = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.cancelAnimationFrame(id);
        };
    }, [selectedId, pendingDelete, deleting]);

    const openDetails = (id) => {
        setSelectedId(id);
        setDetailsError('');
    };

    const closeDetails = () => {
        if (deleting) return;
        setSelectedId(null);
        setSelectedAssessment(null);
        setDetailsError('');
    };

    const confirmDelete = async () => {
        if (!pendingDelete || deleting) return;
        setDeleting(true);
        setDeleteError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Please log in again before deleting an assessment.');
            const response = await fetch(`${API_BASE}/${encodeURIComponent(pendingDelete._id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(await apiError(response, 'Unable to delete this assessment.'));
            onDeleted?.(pendingDelete._id);
            setPendingDelete(null);
            setSelectedId(null);
            setSelectedAssessment(null);
            setDetailsError('');
        } catch (err) {
            setDeleteError(err.message || 'Deletion failed. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <section className="border-t border-gray-100 pt-8" aria-label="Assessment history">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 font-serif">Assessment History ({history.length})</h3>
                    <p className="mt-1 text-xs text-gray-500">Review your saved results and questionnaire answers.</p>
                </div>
                {history.length > PREVIEW_LIMIT && (
                    <button
                        type="button"
                        onClick={() => setShowAll((old) => !old)}
                        className="rounded-lg border border-[#5C7A4E]/30 px-3 py-2 text-xs font-semibold text-[#5C7A4E] hover:bg-[#EFF4EB]"
                    >
                        {showAll ? 'Show Recent 5' : `View All (${history.length})`}
                    </button>
                )}
            </div>

            {loading && <p role="status" className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Loading saved assessments...</p>}
            {!loading && error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {!loading && !error && history.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-600">
                    No saved assessments yet. <Link className="font-semibold text-[#5C7A4E] underline" to="/assessment">Start an assessment</Link> and choose Save to History when you're ready.
                </div>
            )}
            {!loading && !error && history.length > 0 && (
                <div className="space-y-3">
                    {visibleHistory.map((item) => (
                        <div key={item._id} className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 text-xs transition-colors hover:bg-gray-50/60 sm:flex-row sm:items-center sm:text-sm">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-900">{displayDate(item.createdAt)}</span>
                                    <span className="rounded-full bg-[#EFF4EB] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#5C7A4E]">{item.agreementStatus || 'Uncompared'}</span>
                                </div>
                                <p className="mt-1 text-gray-600">
                                    Vision: <strong>{item.imagePrediction || 'Unknown'}</strong> ({displayConfidence(item.imageConfidence)})
                                    <span className="mx-1.5 text-gray-300">|</span>
                                    Questionnaire: <strong>{item.questionnaireOutcome || 'Unavailable'}</strong>
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openDetails(item._id)}
                                    className="rounded-lg bg-[#5C7A4E] px-3 py-2 text-xs font-semibold text-white hover:bg-[#48633E]"
                                >
                                    View Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDeleteError(''); setPendingDelete(item); }}
                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                    aria-label={`Delete assessment from ${displayDate(item.createdAt)}`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {Boolean(selectedId || pendingDelete) && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !deleting) {
                            if (pendingDelete) { setPendingDelete(null); setDeleteError(''); }
                            else closeDetails();
                        }
                    }}
                >
                    {pendingDelete ? (
                        <div role="alertdialog" aria-modal="true" aria-labelledby="assessment-delete-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <h3 id="assessment-delete-title" className="text-lg font-bold text-gray-900">Delete this assessment?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                The saved assessment from {displayDate(pendingDelete.createdAt)} will be permanently removed from your history. This cannot be undone.
                            </p>
                            {deleteError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
                            <div className="mt-6 flex justify-end gap-3">
                                <button ref={closeButtonRef} type="button" disabled={deleting} onClick={() => { setPendingDelete(null); setDeleteError(''); }} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Cancel</button>
                                <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">
                                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div role="dialog" aria-modal="true" aria-labelledby="assessment-detail-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
                                <div>
                                    <h3 id="assessment-detail-title" className="text-lg font-bold text-gray-900 font-serif">Saved Assessment Details</h3>
                                    <p className="text-xs text-gray-500">{displayDate(selectedAssessment?.createdAt)}</p>
                                </div>
                                <button ref={closeButtonRef} type="button" onClick={closeDetails} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Close ✕</button>
                            </div>
                            <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
                                {detailsLoading && <p role="status" className="text-sm text-gray-600">Loading full assessment details...</p>}
                                {detailsError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{detailsError}</p>}
                                {selectedAssessment && !detailsLoading && (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border border-gray-100 bg-[#EFF4EB] p-4">
                                                <p className="text-[11px] font-semibold uppercase text-[#5C7A4E]">Vision Prediction</p>
                                                <p className="mt-1 text-xl font-bold text-gray-900">{selectedAssessment.imagePrediction}</p>
                                                <p className="text-xs text-gray-600">Model score: {displayConfidence(selectedAssessment.imageConfidence)}</p>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                <p className="text-[11px] font-semibold uppercase text-gray-500">Questionnaire</p>
                                                <p className="mt-1 text-base font-bold text-gray-900">{selectedAssessment.questionnaireOutcome || 'Unavailable'}</p>
                                            </div>
                                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                <p className="text-[11px] font-semibold uppercase text-gray-500">Comparison</p>
                                                <p className="mt-1 text-base font-bold capitalize text-gray-900">{selectedAssessment.agreementStatus || 'Uncompared'}</p>
                                            </div>
                                        </div>
                                        {selectedAssessment.agreementSummary && (
                                            <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{selectedAssessment.agreementSummary}</p>
                                        )}
                                        <section className="space-y-3">
                                            <h4 className="font-serif text-base font-bold text-gray-800">Questionnaire Indicator Shares</h4>
                                            <ScoreBars scores={selectedAssessment.questionnaireScores} />
                                        </section>
                                        <section className="space-y-3">
                                            <h4 className="font-serif text-base font-bold text-gray-800">Your Saved Answers</h4>
                                            <AnswerHistory answers={selectedAssessment.questionnaireResponses} skipped={selectedAssessment.isSkippedQuestionnaire} />
                                        </section>
                                        <section className="space-y-3">
                                            <h4 className="font-serif text-base font-bold text-gray-800">Recommendations at Time of Assessment</h4>
                                            <RecommendationHistory recommendations={selectedAssessment.recommendations} />
                                        </section>
                                        {(selectedAssessment.uncertaintyNotes || selectedAssessment.modelVersion) && (
                                            <section className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700">
                                                <h4 className="mb-2 font-semibold text-gray-900">Assessment limitations</h4>
                                                {selectedAssessment.uncertaintyNotes && <p>{selectedAssessment.uncertaintyNotes}</p>}
                                                <p className="mt-2">Image model: {selectedAssessment.modelVersion || 'Not recorded'}; this is an exploratory wellness tool, not a medical diagnosis. Model score is not a calibrated probability.</p>
                                            </section>
                                        )}
                                    </>
                                )}
                            </div>
                            {selectedAssessment && !detailsLoading && (
                                <div className="flex shrink-0 justify-end border-t border-gray-100 px-5 py-3 sm:px-6">
                                    <button type="button" onClick={() => { setDeleteError(''); setPendingDelete(selectedAssessment); }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">
                                        Delete This Assessment
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
