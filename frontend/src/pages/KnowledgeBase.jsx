import { useState } from 'react';

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 1. New state for the filter buttons

  // Updated data to match your UI mockup (Ashwagandha, Manjistha, etc.)
  const libraryData = [
    {
      id: 1,
      name: "Aloe Vera",
      category: "Vata", // Categorized for the filter
      description: "Hydration, soothing dry & sensitive skin. Excellent for reducing redness.",
      useCase: "Sunburn, sensitive skin"
    },
    {
      id: 2,
      name: "Ashwagandha",
      category: "Vata",
      description: "Stress relief, anti-aging & barrier repair. Highly grounding.",
      useCase: "Stress-induced breakouts"
    },
    {
      id: 3,
      name: "Manjistha",
      category: "All",
      description: "Blood purification, pigmentation & overall glow.",
      useCase: "Uneven skin tone"
    },
    {
      id: 4,
      name: "Sandalwood",
      category: "Pitta",
      description: "Known for its highly cooling properties. Calms inflammation and heat.",
      useCase: "Acne, blemishes, excess heat"
    },
    {
      id: 5,
      name: "Jojoba Oil",
      category: "Kapha",
      description: "A light oil that mimics the skin's natural sebum, perfect for balancing oily skin.",
      useCase: "Oily skin, clogged pores"
    }
  ];

  // 2. The logic to filter by BOTH the search bar and the clicked button
  const filteredData = libraryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    // If "All" is selected, show everything. Otherwise, match the category (or show herbs good for "All" doshas)
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter || item.category === 'All';
    
    return matchesSearch && matchesFilter;
  });

  const filterOptions = ['All', 'Vata', 'Pitta', 'Kapha'];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Herb Library</h1>
        <p className="text-gray-600 mb-8">
          Explore natural remedies tailored for your Ayurvedic profile.
        </p>

        {/* Search Bar */}
        <div className="mb-6 w-full">
          <input 
            type="text" 
            placeholder="Search for herbs..." 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 3. The Pill-Shaped Filter Buttons */}
        <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                activeFilter === option 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2 text-green-600">🌿</span> {item.name}
                </h2>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
              <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 w-max px-3 py-1 rounded-full">
                ✦ {item.category} Type
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">No herbs found for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}