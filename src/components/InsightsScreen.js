import React, { useState, useEffect } from 'react';
import { Share2, Award, TrendingUp, Map, Coffee, X, ArrowRight, ArrowLeft, ShoppingBag, Calendar, PieChart, CreditCard, DollarSign, Target, Briefcase, Heart } from 'lucide-react';
import { useFinancialData } from '../backend/FinancialDataContext';
import ChatInterface from './ChatInterface';

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
          x: Math.random() * 100,
          y: 100 + Math.random() * 20,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 3 + 1,
          rotation: Math.random() * 360
        });
      }
      
      setParticles(newParticles);
    };
    
    createParticles();
    
    const animationId = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        const newY = particle.y - particle.speed;
        
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
            opacity: (100 - particle.y) / 100
          }}
        />
      ))}
    </div>
  );
};

// Story Progress Indicator
const StoryProgress = ({ currentIndex, totalStories, onIndexChange }) => {
  return (
    <div className="absolute top-2 left-0 right-0 z-10 px-4">
      <div className="flex space-x-1">
        {Array.from({ length: totalStories }).map((_, index) => (
          <div 
            key={index}
            className="flex-1 h-1 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: index === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
            }}
            onClick={() => onIndexChange(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Story Navigation Buttons
const StoryNavigation = ({ onPrevious, onNext }) => {
  return (
    <>
      <button 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-20 rounded-full p-2"
        onClick={onPrevious}
      >
        <ArrowLeft size={20} className="text-white" />
      </button>
      <button 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-20 rounded-full p-2"
        onClick={onNext}
      >
        <ArrowRight size={20} className="text-white" />
      </button>
    </>
  );
};

// Radar Chart Component for Persona Confidence
const RadarChart = ({ scores }) => {
    const iconSize = 16;
    const personaIcons = [
      { icon: <Briefcase size={iconSize} />, name: "Budgeting Maestro", color: "#f43f5e" },
      { icon: <CreditCard size={iconSize} />, name: "Spontaneous Spender", color: "#fb923c" },
      { icon: <DollarSign size={iconSize} />, name: "Cautious Saver", color: "#fbbf24" },
      { icon: <TrendingUp size={iconSize} />, name: "Investment Enthusiast", color: "#4ade80" },
      { icon: <Target size={iconSize} />, name: "Deal Hunter", color: "#22d3ee" },
      { icon: <Coffee size={iconSize} />, name: "Minimalist", color: "#818cf8" },
      { icon: <Heart size={iconSize} />, name: "Generous Giver", color: "#a855f7" },
      { icon: <Map size={iconSize} />, name: "Financial Adventurer", color: "#ec4899" }
    ];
    
    const sides = 8;
    const size = 120;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    // Force scores array to be the correct format and multiplied to make it visible
    const defaultScores = [0.05, 0.6, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05];
    const scoreArray = Array.isArray(scores) && scores.length === sides ? scores : defaultScores;
    
    // Calculate points for the chart
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const value = scoreArray[i] || 0.1; // Default to 0.1 if undefined
      const pointRadius = radius * value;
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);
      points.push({ x, y, angle });
    }
    
    // Create polygon points string
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    
    // Calculate icon positions (slightly outside the radar)
    const iconPositions = [];
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const iconRadius = radius * 1.3; // Place icons outside the radar
      const x = centerX + iconRadius * Math.cos(angle);
      const y = centerY + iconRadius * Math.sin(angle);
      iconPositions.push({ x, y });
    }
    
    return (
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background shapes */}
          {[0.25, 0.5, 0.75, 1].map((level, i) => (
            <polygon 
              key={i}
              points={Array(sides).fill().map((_, idx) => {
                const angle = (Math.PI * 2 * idx) / sides - Math.PI / 2;
                const r = radius * level;
                return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
              }).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Radar lines */}
          {Array(sides).fill().map((_, i) => {
            const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
            return (
              <line 
                key={i}
                x1={centerX}
                y1={centerY}
                x2={centerX + radius * Math.cos(angle)}
                y2={centerY + radius * Math.sin(angle)}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data polygon */}
          <polygon 
            points={polygonPoints}
            fill="rgba(236, 72, 153, 0.2)"
            stroke="#ec4899"
            strokeWidth="2"
          />
          
          {/* Points */}
          {points.map((point, i) => (
            <circle 
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#ec4899"
            />
          ))}
        </svg>
        
        {/* Icons */}
        {iconPositions.map((pos, i) => (
          <div 
            key={i}
            className="absolute flex items-center justify-center rounded-full bg-gray-900 p-1 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: pos.x, 
              top: pos.y,
              color: personaIcons[i].color,
            }}
          >
            {personaIcons[i].icon}
          </div>
        ))}
      </div>
    );
  };

const InsightsScreen = ({ setCurrentScreen }) => {
  const { privacyLevel, insights, shareInsight, financialData } = useFinancialData();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  // Setup stories data based on insights
  const stories = [
      {
        title: "Shopping Habits",
        icon: <ShoppingBag size={20} className="text-pink-400" />,
        backgroundGradient: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
        content: () => {
          // ------------------------------------------------------------------
          // 1.  Raw data (same as before ­– or comes from `financialData`)
          // ------------------------------------------------------------------
          const topMerchants = financialData?.topMerchants || [
            { name: "Albert Heijn", category: "groceries", visits: 10 },
            { name: "Bol.com",       category: "others",    visits: 9 },
            { name: "Salary",        category: "salary",    visits: 2 }
          ];
      
          // quick helper ­→ logo path (unchanged from your last edit)
          const logoFor = (merchantName) => {
            try {
              return getImagePath(
                `logos/${merchantName.replace(/\s+/g, "").toLowerCase()}.png`
              );
            } catch (e) {
              return null;
            }
          };
      
          // ------------------------------------------------------------------
          // 2.  Narrative helpers
          // ------------------------------------------------------------------
          const incomeCats = ["salary", "investment", "investments", "income", "deposit"];
          const merchant      = topMerchants[0];
          const isSupermarket = merchant.category === "groceries";
          const isIncome      = incomeCats.includes(merchant.category);
      
          //  headline sentence
          const getTrendDescription = () => {
            if (isIncome) {
              return `💸 ${merchant.name} has paid you ${merchant.visits} time${
                merchant.visits !== 1 ? "s" : ""
              } this year – keep those inflows rolling!`;
            }
            if (isSupermarket) {
              return `You've made ${merchant.visits} trips to ${merchant.name} this year. You're a loyal shopper!`;
            }
            return `You've shopped at ${merchant.name} ${merchant.visits} times! It seems to be your favourite store.`;
          };
      
          //  extra tip line under the list
          const getExtraTip = () => {
            if (isIncome) {
              return "Great job growing your income – you're on the road to millionaire status! 🚀";
            }
            if (isSupermarket) {
              return `Did you know? You could save around €150 per year by grouping your trips to ${merchant.name}!`;
            }
            return `Try batching those orders – a little planning could save you roughly €150 a year.`;
          };
      
          // colour helpers for the ranking bars
          const rankColours = ["pink", "orange", "blue"];
      
          // ------------------------------------------------------------------
          // 3.  Render
          // ------------------------------------------------------------------
          return (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white mb-2">Shopping Superstar!</h2>
      
              <div className="bg-black bg-opacity-30 p-4 rounded-xl">
                <p className="text-sm text-white mb-3">{getTrendDescription()}</p>
      
                {[0, 1, 2].map((idx) => {
                  const m   = topMerchants[idx];
                  const pct = (m.visits / topMerchants[0].visits) * 100;
                  return (
                    <div key={idx} className="mt-2 flex items-center space-x-2 first:mt-0">
                      {/* Badge – logo if found, else number */}
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full overflow-hidden bg-${rankColours[idx]}-500`}
                      >
                        {logoFor(m.name) ? (
                          <img src={logoFor(m.name)} alt={m.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                        )}
                      </div>
      
                      {/* Merchant bar */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-white">{m.name}</span>
                          <span className="text-xs text-gray-300">{m.visits}×</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full bg-gradient-to-r from-${rankColours[idx]}-500 to-${rankColours[idx]}-400`}
                            style={{ width: `${idx === 0 ? 100 : pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
      
              {/* Tip banner */}
              <div className="bg-black bg-opacity-30 p-3 rounded-xl">
                <p className="text-xs text-gray-300 italic">{getExtraTip()}</p>
              </div>
            </div>
          );
        }
      },
      
    {
      title: "Weekly Rhythm",
      icon: <Calendar size={20} className="text-green-400" />,
      backgroundGradient: "linear-gradient(135deg, #047857, #10b981)",
      content: () => {
        // Fixed weekday order
        const orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        const weekdaySpending = financialData?.weekdaySpending || {
          'monday': 120.0, 
          'tuesday': 409.51, 
          'wednesday': 362.71, 
          'thursday': 7150.47, 
          'friday': 149.99, 
          'saturday': 1183.60, 
          'sunday': 2310.14
        };
        
        const maxDay = Object.entries(weekdaySpending)
          .sort((a, b) => b[1] - a[1])[0];
          
        const totalSpending = Object.values(weekdaySpending).reduce((sum, val) => sum + val, 0);
        const maxSpending = Math.max(...Object.values(weekdaySpending));
        
        const getDayMood = (day) => {
          if (day === maxDay[0]) return "";
          if (day === 'friday' || day === 'saturday') return "";
          if (day === 'monday') return "";
          return "";
        };
        
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white mb-2">Your Week in €€€</h2>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-sm text-white mb-2">
                <span className="font-bold text-green-400 capitalize">{maxDay[0]}s</span> are when you spend the most! 
                <span className="block mt-1 text-xs">That's €{maxDay[1].toFixed(0)} on average.</span>
              </p>
              
              <div className="flex items-end justify-between h-28 mt-6 px-1">
                {orderedDays.map((day) => {
                  const amount = weekdaySpending[day] || 0;
                  const percentage = (amount / maxSpending) * 100;
                  const mood = getDayMood(day);
                  
                  return (
                    <div key={day} className="flex flex-col items-center justify-end relative group h-full">
                      <div className="absolute bottom-full mb-1 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
    €{amount.toFixed(0)}
  </div>

  <div
    className={`w-7 mt-auto rounded-t-sm ${
      day === maxDay[0]
        ? 'bg-gradient-to-t from-green-500 to-emerald-300'
        : 'bg-gradient-to-t from-green-600 to-green-400'
    }`}
    style={{ height: `${Math.max(percentage, 5)}%` }}
  ></div>

  <span className="text-xs text-gray-300 mt-1 capitalize">
    {day.substring(0, 3)}
  </span>

  {mood && (
    <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[8px] text-green-300 whitespace-nowrap">
      {mood}
    </span>
  )}
</div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-black bg-opacity-30 p-3 rounded-xl">
              <p className="text-xs text-gray-300 italic">
                Your spending peaks on {maxDay[0]}s while {orderedDays.find(day => weekdaySpending[day] === Math.min(...Object.values(weekdaySpending)))}s are your most frugal days!
              </p>
            </div>
          </div>
        );
      }
    },
    {
      title: "Category Breakdown",
      icon: <PieChart size={20} className="text-cyan-400" />,
      backgroundGradient: "linear-gradient(135deg, #0369a1, #22d3ee)",
      content: () => {
        const categories = financialData?.categories || {
          'personal': {'percentage': 10, 'count': 10, 'averageInArea': 64},
          'groceries': {'percentage': 15, 'count': 15, 'averageInArea': 46},
          'salary': {'percentage': 12, 'count': 12, 'averageInArea': 2925},
          'subscriptions': {'percentage': 11, 'count': 11, 'averageInArea': 16},
          'others': {'percentage': 17, 'count': 17, 'averageInArea': 61},
          'entertainment': {'percentage': 7, 'count': 7, 'averageInArea': 40},
          'health': {'percentage': 10, 'count': 10, 'averageInArea': 80},
          'rent': {'percentage': 7, 'count': 7, 'averageInArea': 1021},
          'finance': {'percentage': 7, 'count': 7, 'averageInArea': 241},
          'food': {'percentage': 4, 'count': 4, 'averageInArea': 52}
        };
        
        // Get top 4 categories
        const topCategories = Object.entries(categories)
          .filter(([key]) => key !== 'salary') // Remove salary
          .sort((a, b) => b[1].percentage - a[1].percentage)
          .slice(0, 3);
          
        // Define fun names for categories
        const categoryNames = {
          'groceries': 'Food Stockpiler',
          'rent': 'Roof Provider',
          'health': 'Wellness Champion',
          'personal': 'Self-Care Expert',
          'subscriptions': 'Digital Collector',
          'entertainment': 'Fun Seeker',
          'finance': 'Money Manager',
          'food': 'Food Explorer',
          'others': 'Mystery Spender'
        };
        
        // Define fun emojis for each category
        const categoryEmojis = {
          'groceries': '🛒',
          'rent': '🏠',
          'health': '💪',
          'personal': '💅',
          'subscriptions': '📱',
          'entertainment': '🎭',
          'finance': '💼',
          'food': '🍽️',
          'others': '🎁'
        };
        
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white mb-2">Money Personality</h2>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-sm text-white mb-3">
                <span className="font-bold text-cyan-400">You're a {categoryNames[topCategories[0][0]]}!</span> Here's where your money flows:
              </p>
              
              {topCategories.map((cat, idx) => {
                const [name, data] = cat;
                const emoji = categoryEmojis[name] || '✨';
                const colors = [
                  "from-cyan-500 to-blue-500", 
                  "from-blue-500 to-indigo-500", 
                  "from-indigo-500 to-purple-500"
                ];
                
                const funFact = idx === 0 ? 
                  `This is your top spending category at ${data.percentage}%!` : 
                  `Average transaction: €${data.averageInArea}`;
                
                return (
                  <div key={idx} className="mb-3 p-2 bg-black bg-opacity-30 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="mr-2 text-xl">{emoji}</span>
                        <span className="text-sm text-white capitalize font-bold">{name}</span>
                      </div>
                      <span className="text-sm text-cyan-300 font-bold">{data.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors[idx % colors.length]}`}
                        style={{ width: `${data.percentage * 2}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-400 italic">{funFact}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    },
    {
      title: "Balance",
      icon: <DollarSign size={20} className="text-yellow-400" />,
      backgroundGradient: "linear-gradient(135deg, #b45309, #fbbf24)",
      content: () => {
        const breakdown = financialData?.spendingBreakdown || {
          'experiences': 3, 
          'essentials': 97
        };
        
        // Generate personalized feedback
        const getFeedback = () => {
          if (breakdown.experiences < 10) {
            return "You're all about the essentials! Maybe treat yourself a bit more in 2025?";
          } else if (breakdown.experiences < 30) {
            return "Good balance! You handle essentials while still making room for experiences.";
          } else {
            return "You're living your best life! Just make sure the essentials are covered too.";
          }
        };
        
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white mb-2">Life Balance Meter</h2>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <div className="flex justify-between mb-3">
                <div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <p className="text-sm font-bold text-white">Essentials</p>
                  </div>
                  <p className="text-xl font-bold text-white">{breakdown.essentials}%</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-1"></div>
                    <p className="text-sm font-bold text-white">Fun Stuff</p>
                  </div>
                  <p className="text-xl font-bold text-white">{breakdown.experiences}%</p>
                </div>
              </div>
              
              <div className="h-10 bg-gray-800 rounded-xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-pink-500 flex items-center"
                  style={{ width: `${breakdown.essentials}%` }}
                >
                  {breakdown.essentials > 60 && (
                    <span className="text-xs font-bold text-white ml-3">{breakdown.essentials}%</span>
                  )}
                </div>
                {breakdown.experiences > 30 && (
                  <div className="flex justify-end relative h-0">
                    <span className="text-xs font-bold text-white mr-3 -mt-6">{breakdown.experiences}%</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="px-4 py-2 rounded-full bg-yellow-600 bg-opacity-40">
                  <p className="text-xs text-white font-medium">
                    {getFeedback()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: "Financial Advice",
      icon: <Award size={20} className="text-purple-400" />,
      backgroundGradient: "linear-gradient(135deg, #6d28d9, #c026d3)",
      content: () => {
        const points = financialData?.conversationPoints || [
          "Consider allocating a specific budget for dining out, as frequent transactions in the 'food' category were observed.",
          "You have multiple accounts with similar transaction patterns; consolidating accounts might simplify your financial management.",
          "A significant portion of your expenses goes towards 'rent' and 'groceries'; exploring cost-saving options for these categories could be beneficial.",
          "Regularly review your subscription services (e.g., Netflix, Spotify) to ensure they remain valuable to you.",
          "Your income is consistent, but it's essential to maintain an easily accessible savings fund for emergencies."
        ];
        
        // Take 3 random points and make them more fun and punchy
        const punchyTips = [
          "🍕 Food budget going overboard? Set a dining-out limit - future you will thank you!",
          "💸 Juggling too many accounts? Consolidate and cut the clutter!",
          "🏠 Housing eating your money? Look for small ways to trim those big expenses!",
          "📱 Subscription audit time! Are you actually using all those services?",
          "💰 Emergency fund = sleep better at night. Build that financial safety net!"
        ];
        
        return (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white mb-2">Money Wisdom</h2>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                  <Award size={28} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                {punchyTips.slice(0, 3).map((tip, idx) => (
                  <div key={idx} 
                    className="p-3 bg-purple-900 bg-opacity-40 rounded-lg border-l-2 border-purple-500 transform hover:scale-102 transition-transform"
                  >
                    <p className="text-sm text-white">{tip}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-xs text-purple-300 italic">Learn more about any tip in the chat!</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
        title: "Your Financial Personality",
        icon: <Award size={20} className="text-pink-400" />,
        backgroundGradient: "black",
        content: () => {
            // Big reveal - personality & character
            const persona = financialData?.persona || {
              type: "The Budgeting Maestro",
              character: "Maestro Moolah",
              description: "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes.",
              image: "owl_1.png"
            };
            
            const persona_scores = financialData?.persona_scores || [0.05, 0.6, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05];
            
            const personaTypes = [
              "Budgeting Maestro",
              "Spontaneous Spender",
              "Cautious Saver",
              "Investment Enthusiast",
              "Deal Hunter",
              "Minimalist",
              "Generous Giver",
              "Financial Adventurer"
            ];
            
            return (
              <div className="space-y-3 overflow-y-auto h-full pr-1 pb-4 custom-scrollbar">
                <h2 className="text-xl font-bold text-white text-center">Your Financial Personality</h2>
                
                {/* Character Image with Confetti */}
                <div className="mb-3 flex justify-center relative">
                  <Confetti />
                  <div 
                    className="relative cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setShowChat(true)}
                  >
                    {/* Animated rainbow border background */}
                    <div 
                      className="absolute inset-0 rounded-lg" 
                      style={{
                        background: 'linear-gradient(45deg, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7, #f43f5e)',
                        backgroundSize: '400% 400%',
                        animation: 'rainbow-move 3s ease infinite',
                        transform: 'scale(1.02)',
                        zIndex: 0
                      }}
                    ></div>
                    
                    {/* Black padding for inner border */}
                    <div className="absolute inset-0 m-0.5 rounded-lg bg-black" style={{ zIndex: 1 }}></div>
                    
                    {/* Actual image */}
                    <img 
                      src={getImagePath(persona.image)} 
                      alt={persona.character} 
                      className="h-32 w-32 object-contain relative rounded-lg p-1"
                      style={{ zIndex: 2 }} 
                    />
                    
                    {/* "Chat with me" indicator */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs py-1 rounded-b-lg text-center" style={{ zIndex: 3 }}>
                      Click to chat with me!
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg text-center mb-2 relative overflow-hidden bg-black bg-opacity-30">
                  <div className="relative">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500">
                      {persona.type}
                    </span>
                    <p className="text-xs mt-1 text-gray-300">
                      {persona.character}
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="bg-black bg-opacity-30 p-3 rounded-lg mb-2">
                  <p className="text-xs text-gray-300">
                    {persona.description}
                  </p>
                </div>
                
                {/* Radar Chart with Legend */}
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <p className="text-xs text-white text-center mb-2">Personality Analysis</p>
                  <RadarChart scores={persona_scores} />
                  
                  {/* Legend - with horizontal scroll for small screens */}
                  <div className="mt-2 overflow-x-auto pb-1">
                    <div className="flex space-x-2 min-w-max px-1">
                      {personaTypes.map((type, idx) => (
                        <div key={idx} className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ 
                              backgroundColor: ['#f43f5e', '#fb923c', '#fbbf24', '#4ade80', '#22d3ee', '#818cf8', '#a855f7', '#ec4899'][idx],
                              opacity: persona_scores[idx] > 0.1 ? 1 : 0.5
                            }}
                          ></div>
                          <span 
                            className="text-[8px] text-gray-300 whitespace-nowrap"
                            style={{ opacity: persona_scores[idx] > 0.1 ? 1 : 0.5 }}
                          >
                            {type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes rainbow-move {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(0,0,0,0.1);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(255,255,255,0.2);
                      border-radius: 2px;
                    }
                  `
                }} />
              </div>
            );
          }
      }
    ];
    
    // Set up automatic story progression
    useEffect(() => {
      setShowConfetti(currentStoryIndex === stories.length - 1);
      
      const timer = setTimeout(() => {
        if (currentStoryIndex < stories.length - 1) {
          setCurrentStoryIndex(prevIndex => prevIndex + 1);
        }
      }, 8000); // Auto-progress after 8 seconds
      
      return () => clearTimeout(timer);
    }, [currentStoryIndex, stories.length]);
    
    // Handle navigation
    const goToPreviousStory = () => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      }
    };
    
    const goToNextStory = () => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      }
    };
    
    const handleShare = async () => {
      try {
        const result = await shareInsight('financial-summary');
        if (result && result.shareUrl) {
          alert(`Share link created: ${result.shareUrl}`);
        }
      } catch (err) {
        console.error('Failed to share insight:', err);
      }
    };
    
    const currentStory = stories[currentStoryIndex];
    
    return (
      <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
        {/* Header with border gradient */}
        <div className="p-4 text-center relative border-b border-gray-800">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
          <h1 className="text-xl font-bold text-white">Your Financial Story</h1>
          <p className="text-xs text-gray-400">2024 in Review</p>
        </div>
        
        {/* Story Content */}
        <div 
          className="relative h-[420px] overflow-hidden transition-all duration-500"
          style={{ background: currentStory.backgroundGradient }}
        >
          {/* Story Progress Indicator */}
          <StoryProgress 
            currentIndex={currentStoryIndex} 
            totalStories={stories.length}
            onIndexChange={setCurrentStoryIndex}
          />
          
          {/* Navigation Buttons */}
          <StoryNavigation 
            onPrevious={goToPreviousStory} 
            onNext={goToNextStory}
          />
          
          {/* Story Content */}
          <div className="h-full p-6 flex flex-col justify-center">
            {currentStory.content()}
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
        
        {/* Chat Interface Modal */}
        {showChat && financialData?.persona && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-gray-900 rounded-xl max-w-sm w-full max-h-[90vh] flex flex-col border border-gray-800 relative">
              <button 
                className="absolute right-2 top-2 text-gray-400 hover:text-white p-1 rounded-full"
                onClick={() => setShowChat(false)}
              >
                <X size={20} />
              </button>
              <ChatInterface 
                character={financialData.persona.character} 
                persona={financialData.persona.type}
                imagePath={financialData.persona.image}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default InsightsScreen;