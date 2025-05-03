import React from 'react';
import { ArrowRight, Shield, TrendingUp, Share2, Award, Sword } from 'lucide-react';

const LandingScreen = ({ setCurrentScreen }) => {
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
      {/* Header with rainbow border */}
      <div className="p-4 text-center relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <h1 className="text-2xl font-bold text-white">buniq</h1>
        <p className="text-gray-400 text-sm">Your journey with bunq over the past year</p>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4">
          <div className="flex items-center mb-2">
            <Award size={20} className="mr-2 text-pink-500" />
            <h2 className="text-lg font-semibold text-white">Meet your buniq Self</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Discover your unique financial identity and spending patterns.
          </p>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center p-3 rounded-lg bg-gray-900 border border-gray-800">
            <Shield size={18} className="mr-2 text-green-400" />
            <span className="text-sm text-white">Privacy First Design</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg bg-gray-900 border border-gray-800">
            <TrendingUp size={18} className="mr-2 text-blue-400" />
            <span className="text-sm text-white">Smart Financial Insights</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg bg-gray-900 border border-gray-800">
            <Share2 size={18} className="mr-2 text-purple-400" />
            <span className="text-sm text-white">Optional Shareable Cards</span>
          </div>
          
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-800">
            <Sword size={18} className="mr-2 text-white" />
            <span className="text-sm text-white">Financial Battle Arena</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all text-white mb-2"
          style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7)' }}
          onClick={() => setCurrentScreen('privacySettings')}
        >
          Get Started <ArrowRight size={16} className="ml-2" />
        </button>
        
        <button 
          className="w-full py-2 rounded-lg border border-gray-700 font-medium flex items-center justify-center bg-gray-900 text-white text-sm"
          onClick={() => setCurrentScreen('battleArena')}
        >
          <Sword size={14} className="mr-1 text-purple-400" /> Go to Battle Arena
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;