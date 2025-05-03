import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Send, Check, Award, HelpCircle, Sword } from 'lucide-react';
import axios from 'axios';

// Get image path function
const getImagePath = (imageName) => {
  try {
    return require(`../assets/${imageName}`);
  } catch (e) {
    console.error("Failed to load image:", imageName);
    return '';
  }
};

const BattleArenaScreen = ({ setCurrentScreen }) => {
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('selection'); // 'selection', 'question', 'battle'
  const [error, setError] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [debateStage, setDebateStage] = useState(0); // 0: not started, 1: first round, 2: rebuttal round
  const [debateOrder, setDebateOrder] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  // All available personas
  const allPersonas = [
    {
      type: "The Budgeting Maestro",
      character: "Maestro Moolah",
      description: "Meticulously plans every expense, tracks budgets diligently.",
      image: "owl_1.png",
      color: "from-red-500 to-pink-500"
    },
    {
      type: "The Spontaneous Spender",
      character: "Flashy Fin",
      description: "Lives in the moment, often making impulsive purchases.",
      image: "dolphin_2.png",
      color: "from-orange-500 to-amber-500"
    },
    {
      type: "The Cautious Saver",
      character: "Penny the Penguin",
      description: "Prioritizes saving over spending for future security.",
      image: "penguin_3.png",
      color: "from-yellow-500 to-lime-500"
    },
    {
      type: "The Investment Enthusiast",
      character: "Bullish Benny",
      description: "Always looking for opportunities to grow wealth.",
      image: "bull_4.png",
      color: "from-green-500 to-emerald-500"
    },
    {
      type: "The Deal Hunter",
      character: "Bargain Buzzy",
      description: "Always on the lookout for discounts and the best deals.",
      image: "bee_5.png",
      color: "from-teal-500 to-cyan-500"
    },
    {
      type: "The Minimalist",
      character: "Zen Zeke",
      description: "Prefers simplicity and values experiences over possessions.",
      image: "panda_6.png",
      color: "from-blue-500 to-indigo-500"
    },
    {
      type: "The Generous Giver",
      character: "Charity Charlie",
      description: "Frequently donates to causes and helps friends in need.",
      image: "squirrel_7.png",
      color: "from-violet-500 to-purple-500"
    },
    {
      type: "The Financial Adventurer",
      character: "Explorer Ellie",
      description: "Explores new financial tools and unconventional methods.",
      image: "cat_8.png",
      color: "from-fuchsia-500 to-pink-500"
    }
  ];
  
  // Sample questions for inspiration
  const sampleQuestions = [
    "Should I invest my savings or pay off my student debt?",
    "Is it better to buy or rent a home right now?",
    "How should I budget for an upcoming vacation?",
    "What's the best approach to building an emergency fund?",
    "Should I focus on retirement savings or buying a house?",
    "What's the smartest way to handle a sudden windfall?",
    "How can I reduce my monthly expenses without sacrificing quality of life?",
    "Should I prioritize investing in stocks or crypto?"
  ];
  
  const togglePersona = (personaType) => {
    if (selectedPersonas.includes(personaType)) {
      setSelectedPersonas(selectedPersonas.filter(p => p !== personaType));
    } else {
      // Only allow up to 4 personas
      if (selectedPersonas.length < 4) {
        setSelectedPersonas([...selectedPersonas, personaType]);
      }
    }
  };

  // Function to get persona info by type
  const getPersonaByType = (personaType) => {
    return allPersonas.find(p => p.type === personaType);
  };
  
  // Function to get persona info
  const getPersonaInfo = (personaType) => {
    const persona = getPersonaByType(personaType);
    return {
      type: personaType,
      character: persona ? persona.character : '',
      image: persona ? persona.image : '',
      color: persona ? persona.color : 'from-gray-500 to-gray-600'
    };
  };
  
  // Start the debate
  const startDebate = () => {
    setDebateStage(1);
    setConversation([]);
    
    // Set the debate order (randomize the selected personas)
    const orderedPersonas = [...selectedPersonas];
    setDebateOrder(orderedPersonas);
    
    // Start with the first persona
    setCurrentSpeaker(0);
    processNextSpeaker();
  };
  
  // Process the next speaker in the debate
  const processNextSpeaker = useCallback(() => {
    if (currentSpeaker === null || debateOrder.length === 0) return;
    
    const personaType = debateOrder[currentSpeaker];
    const personaInfo = getPersonaInfo(personaType);
    
    setIsTyping(true);
    
    // Build context for the current speaker
    let context = "";
    let messageType = "";
    
    if (debateStage === 1) {
      // First round - initial statements
      context = `Initial response to the financial question: "${question}"`;
      messageType = "initial";
    } else if (debateStage === 2) {
      // Second round - rebuttals and final statements
      // Get what others have said in the first round
      const otherStatements = conversation
        .filter(msg => msg.type === "initial" && msg.persona !== personaType)
        .map(msg => `${msg.character} (${msg.persona.replace('The ', '')}) said: ${msg.text}`);
      
      context = `Now give your final statement and brief responses to what others have said:\n${otherStatements.join('\n')}`;
      messageType = "rebuttal";
    }
    
    // Prepare data for API call
    const apiData = {
      question: question,
      personas: [personaType],
      context: context,
      messageType: messageType
    };
    
    // Simulate typing delay (2-4 seconds)
    const typingDelay = Math.floor(Math.random() * 2000) + 2000;
    
    setTimeout(() => {
      // Make API call to get response
      axios.post('http://localhost:5002/api/persona-response', apiData)
        .then(response => {
          const responseText = response.data.response;
          
          // Add message to conversation
          const newMessage = {
            persona: personaType,
            character: personaInfo.character,
            text: responseText,
            type: messageType,
            timestamp: new Date().toISOString()
          };
          
          setConversation(prev => [...prev, newMessage]);
          setIsTyping(false);
          
          // Move to next speaker or stage
          moveToNextSpeaker();
        })
        .catch(err => {
          console.error("Error getting persona response:", err);
          
          // Fallback response
          const fallbackResponse = `As ${personaInfo.character}, I would approach this question with my typical ${personaType.replace('The ', '')} mindset. However, there seems to be a technical issue.`;
          
          const newMessage = {
            persona: personaType,
            character: personaInfo.character,
            text: fallbackResponse,
            type: messageType,
            timestamp: new Date().toISOString()
          };
          
          setConversation(prev => [...prev, newMessage]);
          setIsTyping(false);
          
          // Move to next speaker or stage
          moveToNextSpeaker();
        });
    }, typingDelay);
  }, [currentSpeaker, debateOrder, debateStage, question, conversation]);
  
  // Move to the next speaker or stage
  const moveToNextSpeaker = useCallback(() => {
    // Calculate next speaker index
    const nextSpeaker = currentSpeaker + 1;
    
    if (nextSpeaker < debateOrder.length) {
      // Move to next speaker in the same round
      setCurrentSpeaker(nextSpeaker);
    } else if (debateStage === 1) {
      // All speakers have gone in the first round, move to second round
      setDebateStage(2);
      setCurrentSpeaker(0);
    } else {
      // Debate is complete
      setDebateStage(3); // 3: completed
      setCurrentSpeaker(null);
    }
  }, [currentSpeaker, debateStage, debateOrder.length]);
  
  // Effect to process next speaker when current speaker changes
  useEffect(() => {
    if (currentSpeaker !== null && debateStage < 3) {
      processNextSpeaker();
    }
  }, [currentSpeaker, debateStage, processNextSpeaker]);
  
  const handleQuestionSubmit = () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }
    
    if (selectedPersonas.length < 2) {
      setError("Please select at least 2 personas");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Move to battle UI
    setCurrentStep('battle');
    setIsLoading(false);
    
    // Start the debate with a small delay to allow UI transition
    setTimeout(() => {
      startDebate();
    }, 500);
  };
  
  // Fix: Rename the function to not start with "use" and memoize it
  const selectSampleQuestion = useCallback((q) => {
    setQuestion(q);
  }, []);
  
  // Render functions for different steps
  const renderPersonaSelection = () => {
    return (
      <div className="p-4">
        <div className="bg-gray-900 p-3 rounded-lg mb-4 border border-gray-800">
          <div className="flex items-start">
            <Award size={18} className="mr-2 mt-0.5 text-orange-400" />
            <p className="text-xs text-gray-300">
              Select 2-4 financial personalities to battle it out in the arena! Each will provide their unique perspective on your financial question.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {allPersonas.map(persona => (
            <div 
              key={persona.type}
              className={`p-3 rounded-lg border ${
                selectedPersonas.includes(persona.type) 
                  ? `bg-gradient-to-br ${persona.color} bg-opacity-20 border-l-4` 
                  : 'bg-gray-900 border-gray-800'
              }`}
              onClick={() => togglePersona(persona.type)}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full overflow-hidden mr-2 ${
                  selectedPersonas.includes(persona.type) ? 'ring-2 ring-white' : ''
                }`}>
                  <img 
                    src={getImagePath(persona.image)} 
                    alt={persona.character} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded flex items-center justify-center mr-1 ${
                      selectedPersonas.includes(persona.type) ? `bg-${persona.color.split(' ')[0].replace('from-', '')}` : 'bg-gray-700'
                    }`}>
                      {selectedPersonas.includes(persona.type) && <Check size={10} color="white" />}
                    </div>
                    <h3 className="text-xs font-medium text-white">{persona.character}</h3>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                    {persona.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-2 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}
        
        <button 
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center text-white ${
            selectedPersonas.length >= 2 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gray-800 text-gray-400'
          }`}
          onClick={() => selectedPersonas.length >= 2 ? setCurrentStep('question') : setError("Please select at least 2 personas")}
        >
          Continue ({selectedPersonas.length}/4 selected)
        </button>
      </div>
    );
  };
  
  const renderQuestionInput = () => {
    return (
      <div className="p-4">
        <div className="bg-gray-900 p-3 rounded-lg mb-4 border border-gray-800">
          <div className="flex items-start">
            <HelpCircle size={18} className="mr-2 mt-0.5 text-cyan-400" />
            <p className="text-xs text-gray-300">
              What financial question would you like our personalities to debate? Make it specific for the best results!
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your financial question here..."
            className="w-full bg-gray-900 text-white rounded-lg border border-gray-700 p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none min-h-[100px]"
            rows={4}
          />
          
          {/* Character count */}
          <div className="text-right text-xs text-gray-500 mt-1">
            {question.length}/200 characters
          </div>
        </div>
        
        {/* Sample questions */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Need inspiration? Try one of these:</p>
          <div className="space-y-2">
            {sampleQuestions.slice(0, 4).map((q, idx) => (
              <div 
                key={idx}
                className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-xs text-white cursor-pointer hover:bg-gray-800"
                onClick={() => selectSampleQuestion(q)}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-300 p-2 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button 
            className="py-3 px-4 rounded-lg font-medium flex items-center justify-center bg-gray-800 text-white"
            onClick={() => setCurrentStep('selection')}
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          
          <button 
            className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center text-white bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleQuestionSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <>Start Battle <Sword size={16} className="ml-2" /></>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  const renderBattleArena = () => {
    return (
      <div className="p-4 flex flex-col h-full">
        {/* Question banner */}
        <div className="bg-black bg-opacity-50 p-3 rounded-lg mb-4 border border-gray-700 sticky top-0 z-10">
          <p className="text-xs text-gray-300 font-medium italic">
            "{question}"
          </p>
          {debateStage === 1 && (
            <div className="text-xs text-cyan-400 mt-1">Round 1: Opening statements</div>
          )}
          {debateStage === 2 && (
            <div className="text-xs text-orange-400 mt-1">Round 2: Rebuttals & conclusions</div>
          )}
          {debateStage === 3 && (
            <div className="text-xs text-green-400 mt-1">Debate complete!</div>
          )}
        </div>
        
        {/* Conversation */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
          {conversation.map((message, idx) => {
            const personaInfo = getPersonaInfo(message.persona);
            
            // Parse asterisk actions
            const formattedText = message.text.split(/(\*[^*]+\*)/).map((part, i) => {
              if (part.startsWith('*') && part.endsWith('*')) {
                return <span key={i} className="italic text-gray-400">{part.slice(1, -1)}</span>;
              }
              return <span key={i}>{part}</span>;
            });
            
            return (
              <div key={idx} className="flex">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1">
                  <img 
                    src={getImagePath(personaInfo.image)} 
                    alt={message.character} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${personaInfo.color} bg-opacity-20`}>
                    <div className="flex items-center mb-1">
                      <p className="text-xs font-bold text-white">{message.character}</p>
                      <p className="text-[10px] text-gray-400 ml-2">{message.persona.replace('The ', '')}</p>
                      {message.type === "rebuttal" && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500 bg-opacity-25 text-orange-300">Rebuttal</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-white">
                      {formattedText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isTyping && currentSpeaker !== null && debateOrder.length > 0 && (
            <div className="flex">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1">
                <img 
                  src={getImagePath(getPersonaInfo(debateOrder[currentSpeaker]).image)} 
                  alt={getPersonaInfo(debateOrder[currentSpeaker]).character} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getPersonaInfo(debateOrder[currentSpeaker]).color} bg-opacity-20`}>
                  <div className="flex items-center mb-1">
                    <p className="text-xs font-bold text-white">{getPersonaInfo(debateOrder[currentSpeaker]).character}</p>
                    <p className="text-[10px] text-gray-400 ml-2">{debateOrder[currentSpeaker].replace('The ', '')}</p>
                  </div>
                  
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Controls */}
        <div className="mt-auto pt-3 border-t border-gray-800">
          <div className="flex space-x-2">
            <button 
              className="py-3 px-4 rounded-lg font-medium flex items-center justify-center bg-gray-800 text-white"
              onClick={() => setCurrentScreen('insights')}
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            
            <button 
              className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center text-white bg-gradient-to-r from-purple-500 to-pink-500"
              onClick={() => {
                setCurrentStep('selection');
                setSelectedPersonas([]);
                setQuestion('');
                setConversation([]);
                setDebateStage(0);
                setCurrentSpeaker(null);
              }}
              disabled={debateStage < 3 && debateStage > 0}
            >
              {debateStage < 3 && debateStage > 0 ? 'Debate in progress...' : 'New Battle'}
            </button>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
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
  };
  
  // Main render
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800 flex flex-col h-[600px]">
      {/* Header with rainbow border */}
      <div className="p-4 border-b border-gray-800 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Financial Battle Arena</h2>
            <p className="text-xs text-gray-400">Pit financial personas against each other</p>
          </div>
          
          {currentStep === 'battle' && (
            <div className="flex">
              {selectedPersonas.map(personaType => {
                const persona = getPersonaByType(personaType);
                return (
                  <div 
                    key={personaType}
                    className="w-6 h-6 rounded-full overflow-hidden -ml-2 first:ml-0 border border-black"
                  >
                    <img 
                      src={getImagePath(persona.image)} 
                      alt={persona.character} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Content based on current step */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 'selection' && renderPersonaSelection()}
        {currentStep === 'question' && renderQuestionInput()}
        {currentStep === 'battle' && renderBattleArena()}
      </div>
    </div>
  );
};

export default BattleArenaScreen;