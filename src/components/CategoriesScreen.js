import React from 'react';
import { ArrowRight, Coffee, Map, MessageCircle, CreditCard, Briefcase, Check } from 'lucide-react';

const CategoriesScreen = ({ setCurrentScreen, selectedCategories, setSelectedCategories }) => {
  const toggleCategory = (category) => {
    setSelectedCategories({
      ...selectedCategories,
      [category]: !selectedCategories[category]
    });
  };
  
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
      {/* Header with rainbow border */}
      <div className="p-4 flex items-center border-b border-gray-800 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <h2 className="text-lg font-semibold text-white">Select Categories</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="bg-gray-900 p-3 rounded-lg mb-3 border border-gray-800">
          <p className="text-xs text-gray-300">
            Choose categories to include in your Financial Story.
          </p>
        </div>
        
        <div className="space-y-2 mb-3">
          <div 
            className={`p-3 rounded-lg ${selectedCategories.coffee ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-pink-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => toggleCategory('coffee')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${selectedCategories.coffee ? 'bg-pink-500' : 'bg-gray-700'}`}>
                {selectedCategories.coffee && <Check size={10} color="white" />}
              </div>
              <Coffee size={16} className="mr-2 text-pink-400" />
              <h3 className="text-sm font-medium text-white">Coffee & Cafés</h3>
            </div>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${selectedCategories.travel ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-purple-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => toggleCategory('travel')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${selectedCategories.travel ? 'bg-purple-500' : 'bg-gray-700'}`}>
                {selectedCategories.travel && <Check size={10} color="white" />}
              </div>
              <Map size={16} className="mr-2 text-purple-400" />
              <h3 className="text-sm font-medium text-white">Travel & Transportation</h3>
            </div>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${selectedCategories.dining ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-cyan-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => toggleCategory('dining')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${selectedCategories.dining ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                {selectedCategories.dining && <Check size={10} color="white" />}
              </div>
              <MessageCircle size={16} className="mr-2 text-cyan-400" />
              <h3 className="text-sm font-medium text-white">Dining & Social</h3>
            </div>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${selectedCategories.shopping ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-green-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => toggleCategory('shopping')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${selectedCategories.shopping ? 'bg-green-500' : 'bg-gray-700'}`}>
                {selectedCategories.shopping && <Check size={10} color="white" />}
              </div>
              <CreditCard size={16} className="mr-2 text-green-400" />
              <h3 className="text-sm font-medium text-white">Shopping</h3>
            </div>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${selectedCategories.business ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-yellow-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => toggleCategory('business')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded flex items-center justify-center mr-2 ${selectedCategories.business ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                {selectedCategories.business && <Check size={10} color="white" />}
              </div>
              <Briefcase size={16} className="mr-2 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">Business Expenses</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7)' }}
          onClick={() => setCurrentScreen('insights')}
        >
          Generate Story <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesScreen;