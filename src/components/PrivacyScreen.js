import React from 'react';
import { ArrowRight, Shield, Eye, EyeOff, Check } from 'lucide-react';

const PrivacyScreen = ({ setCurrentScreen, privacyLevel, setPrivacyLevel }) => {
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
      {/* Header with rainbow border */}
      <div className="p-4 flex items-center border-b border-gray-800 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <h2 className="text-lg font-semibold text-white">Privacy Settings</h2>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="bg-gray-900 p-3 rounded-lg mb-4 border border-gray-800">
          <div className="flex items-start">
            <Shield size={18} className="mr-2 mt-0.5 text-cyan-400" />
            <p className="text-xs text-gray-300">
              Choose how you want your financial insights presented.
            </p>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div 
            className={`p-3 rounded-lg ${privacyLevel === 'high' ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-cyan-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => setPrivacyLevel('high')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${privacyLevel === 'high' ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                {privacyLevel === 'high' && <Check size={10} color="white" />}
              </div>
              <h3 className="text-sm font-medium text-white flex-1">High Privacy</h3>
              <EyeOff size={16} className="text-cyan-400" />
            </div>
            <p className="text-xs text-gray-400 ml-6 mt-1">
              General trends only. No specific merchants.
            </p>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${privacyLevel === 'balanced' ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-purple-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => setPrivacyLevel('balanced')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${privacyLevel === 'balanced' ? 'bg-purple-500' : 'bg-gray-700'}`}>
                {privacyLevel === 'balanced' && <Check size={10} color="white" />}
              </div>
              <h3 className="text-sm font-medium text-white flex-1">Balanced</h3>
              <Shield size={16} className="text-purple-400" />
            </div>
            <p className="text-xs text-gray-400 ml-6 mt-1">
              Category percentages. No specific merchants.
            </p>
          </div>
          
          <div 
            className={`p-3 rounded-lg ${privacyLevel === 'detailed' ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-l-4 border-pink-500' : 'bg-gray-900 border border-gray-800'}`}
            onClick={() => setPrivacyLevel('detailed')}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${privacyLevel === 'detailed' ? 'bg-pink-500' : 'bg-gray-700'}`}>
                {privacyLevel === 'detailed' && <Check size={10} color="white" />}
              </div>
              <h3 className="text-sm font-medium text-white flex-1">Detailed</h3>
              <Eye size={16} className="text-pink-400" />
            </div>
            <p className="text-xs text-gray-400 ml-6 mt-1">
              Full insights with top merchants (no amounts).
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button 
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7)' }}
          onClick={() => setCurrentScreen('categories')}
        >
          Continue <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PrivacyScreen;