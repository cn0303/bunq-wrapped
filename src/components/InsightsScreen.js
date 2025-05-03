import React, { useState, useEffect } from 'react';
import { Share2, Award, TrendingUp, Map, Coffee } from 'lucide-react';
import { useFinancialData } from '../backend/FinancialDataContext';

// Get image path function
const getImagePath = (imageName) => {
  try {
    return require(`../assets/${imageName}`);
  } catch (e) {
    console.error("Failed to load image:", imageName);
    return '';
  }
};

// Confetti component
const Confetti = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Create confetti particles
    const createParticles = () => {
      const colors = ['#f43f5e', '#fb923c', '#fbbf24', '#4ade80', '#22d3ee', '#818cf8', '#a855f7'];
      const newParticles = [];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // position across width (%)
          y: 100 + Math.random() * 20, // start below the container
          size: Math.random() * 8 + 4, // size between 4-12px
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 1, // speed between 1-4
          rotation: Math.random() * 360
        });
      }
      
      setParticles(newParticles);
    };
    
    // Call once to initialize
    createParticles();
    
    // Animation loop
    const animationId = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        // Move particle upward
        const newY = particle.y - particle.speed;
        
        // If particle has gone off the top, reset from bottom
        if (newY < -10) {
          return {
            ...particle,
            y: 100 + Math.random() * 10,
            x: Math.random() * 100
          };
        }
        
        return {
          ...particle,
          y: newY,
          rotation: particle.rotation + particle.speed
        };
      }));
    }, 50);
    
    // Cleanup
    return () => clearInterval(animationId);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: (100 - particle.y) / 100 // fade out as it rises
          }}
        />
      ))}
    </div>
  );
};

const InsightsScreen = ({ setCurrentScreen }) => {
  const { privacyLevel, insights, shareInsight, financialData } = useFinancialData();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Start confetti when component mounts
  useEffect(() => {
    setShowConfetti(true);
    
    // Optional: Hide confetti after some time
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000); // Stop after 10 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleShare = async () => {
    try {
      const result = await shareInsight('financial-summary');
      if (result && result.shareUrl) {
        // In a real app, you would show a toast notification or copy to clipboard
        alert(`Share link created: ${result.shareUrl}`);
      }
    } catch (err) {
      console.error('Failed to share insight:', err);
    }
  };
  
  // Render insights based on privacy level
  const renderInsights = () => {
    if (!insights) return null;
    
    if (privacyLevel === 'high') {
      return (
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-1">
              <Award size={16} className="mr-2 text-cyan-400" />
              <h3 className="text-sm font-medium text-white">Your Style</h3>
            </div>
            <p className="text-xs text-gray-300">You're a <span className="font-bold text-cyan-400">{insights.financialPersonality}</span> - balancing experiences with saving.</p>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-1">
              <TrendingUp size={16} className="mr-2 text-green-400" />
              <h3 className="text-sm font-medium text-white">Saving Trend</h3>
            </div>
            <p className="text-xs text-gray-300">
              Your saving rate {insights.savingTrend ? 'increased' : 'decreased'} compared to last year!
            </p>
          </div>
        </div>
      );
    } else if (privacyLevel === 'balanced') {
      return (
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-1">
              <Award size={16} className="mr-2 text-cyan-400" />
              <h3 className="text-sm font-medium text-white">Spending Mix</h3>
            </div>
            <p className="text-xs text-gray-300">
              {insights.spendingBreakdown?.experiences || 45}% on experiences, {insights.spendingBreakdown?.essentials || 55}% on essentials - balanced!
            </p>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
            <div className="flex items-center mb-1">
              <Map size={16} className="mr-2 text-pink-400" />
              <h3 className="text-sm font-medium text-white">Top Category</h3>
            </div>
            <p className="text-xs text-gray-300">
              {insights.topCategory?.name?.charAt(0).toUpperCase() + insights.topCategory?.name?.slice(1) || 'Travel'} is {insights.topCategory?.percentage || 28}% of your spending this year.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          {(insights.topMerchants || []).slice(0, 2).map((merchant, index) => (
            <div key={index} className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center mb-1">
                {merchant.category === 'coffee' && <Coffee size={16} className="mr-2 text-pink-400" />}
                {merchant.category === 'travel' && <Map size={16} className="mr-2 text-cyan-400" />}
                <h3 className="text-sm font-medium text-white">
                  {merchant.category === 'coffee' ? 'Coffee Enthusiast' : 'Travel Lover'}
                </h3>
              </div>
              <p className="text-xs text-gray-300">
                You visited {merchant.name} {merchant.visits} times, more than most users.
              </p>
            </div>
          ))}
        </div>
      );
    }
  };
  
  // Get the character image
 // Get the character image
const getCharacterImage = () => {
    if (!financialData || !financialData.persona) {
      return null;
    }
    
    const imagePath = financialData.persona.image;
    return (
      <div className="mb-6 flex justify-center relative">
        {showConfetti && <Confetti />}
        <div className="relative">
          {/* Animated rainbow border background */}
          <div 
            className="absolute inset-0 rounded-lg" 
            style={{
              background: 'linear-gradient(45deg, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7, #f43f5e)',
              backgroundSize: '400% 400%',
              animation: 'rainbow-move 3s ease infinite',
              transform: 'scale(1.0)',
              zIndex: 0
            }}
          ></div>
          
          {/* Black padding for inner border */}
          <div className="absolute inset-0 m-1.5 rounded-lg bg-black" style={{ zIndex: 1 }}></div>
          
          {/* Actual image with small padding */}
          <img 
            src={getImagePath(imagePath)} 
            alt={financialData.persona.character} 
            className="h-48 w-48 object-contain relative rounded-lg p-4"
            style={{ zIndex: 2 }} 
          />
        </div>
        
        {/* Add the animation keyframes to the head of the document */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes rainbow-move {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `
        }} />
      </div>
    );
  };
  
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
      {/* Header with border gradient */}
      <div className="p-4 text-center relative border-b border-gray-800">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <h1 className="text-xl font-bold text-white">Your Financial Story</h1>
        <p className="text-xs text-gray-400">2024 in Review</p>
      </div>
      
      {/* Content */}
      <div className="p-4 relative overflow-hidden">
        <div className="mb-4 relative">
          <h2 className="text-sm font-semibold text-white mb-3">Financial Personality</h2>
          
          {/* Character Image with Confetti */}
          {getCharacterImage()}
          
          <div className="p-3 rounded-lg text-center mb-3 relative overflow-hidden bg-gray-900 border border-gray-800">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMCAxLjEwNS0uODk1IDItMiAyLTEuMTA1IDAtMi0uODk1LTItMiAwLTEuMTA1Ljg5NS0yIDItMiAxLjEwNSAwIDIgLjg5NSAyIDJ6bTAtMjhjMCAxLjEwNS0uODk1IDItMiAyLTEuMTA1IDAtMi0uODk1LTItMiAwLTEuMTA1Ljg5NS0yIDItMiAxLjEwNSAwIDIgLjg5NSAyIDJ6bS0yMCAyMGMxLjEwNSAwIDItLjg5NSAyLTIgMC0xLjEwNS0uODk1LTItMi0yLTEuMTA1IDAtMiAuODk1LTIgMiAwIDEuMTA1Ljg5NSAyIDIgMnptMCAyYy0yLjIxIDAtNC0xLjc5LTQtNHMxLjc5LTQgNC00IDQgMS43OSA0IDQtMS43OSA0LTQgNHptMC0yMGMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6bTIwIDBjLTIuMjEgMC00LTEuNzktNC00czEuNzktNCA0LTQgNCAxLjc5IDQgNC0xLjc5IDQtNCA0em0wIDIwYy0yLjIxIDAtNC0xLjc5LTQtNHMxLjc5LTQgNC00IDQgMS43OSA0IDQtMS43OSA0LTQgNHoiPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg==')]"></div>
            <div className="relative">
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500">
                {financialData?.persona?.type || 'Financial Adventurer'}
              </span>
              <p className="text-xs mt-1 text-gray-300">
                {financialData?.persona?.character || 'Explorer Ellie'}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 mb-3">
            <p className="text-xs text-gray-300">
              {financialData?.persona?.description || 'Explores new financial tools, apps, and unconventional methods to manage money.'}
            </p>
          </div>
          
          {renderInsights()}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <button 
            className="flex-1 py-2 rounded-lg border border-gray-700 font-medium flex items-center justify-center bg-gray-900 text-white text-sm"
            onClick={handleShare}
          >
            <Share2 size={14} className="mr-1 text-pink-400" /> Share
          </button>
          <button 
            className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center text-white text-sm"
            style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7)' }}
            onClick={() => setCurrentScreen('landing')}
          >
            More Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsScreen;