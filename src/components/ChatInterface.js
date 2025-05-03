import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal } from 'lucide-react';

const getImagePath = (imageName) => {
  try {
    return require(`../assets/${imageName}`);
  } catch (e) {
    console.error("Failed to load image:", imageName);
    return '';
  }
};

const ChatInterface = ({ character, persona, imagePath, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Initial greeting message from the character
  useEffect(() => {
    const initialMessages = [
      {
        sender: 'character',
        text: getGreeting(character, persona),
        timestamp: new Date().toISOString()
      }
    ];
    setMessages(initialMessages);
  }, [character, persona]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get appropriate greeting based on character
  const getGreeting = (charName, personaType) => {
    switch(personaType) {
      case 'Budgeting Maestro':
        return `*Waves baton* Welcome! I am ${charName}, your financial conductor. Let me help you orchestrate your finances to perfection!`;
      case 'Spontaneous Spender':
        return `*Does a flip* Hey there! ${charName} at your service! Life's too short not to enjoy it, am I right? Let's chat about fun ways to use your money!`;
      case 'Cautious Saver':
        return `*Carefully arranges coins* Hello! I'm ${charName}. I'm all about preserving your financial nest egg. How can I help you save today?`;
      case 'Investment Enthusiast':
        return `*Adjusts tie* Greetings, investor! ${charName} here, ready to talk about growing your wealth. What market trends are you interested in?`;
      case 'Deal Hunter':
        return `*Buzzes excitedly* Found you! I'm ${charName} and I love finding great deals! Want to know how to stretch your money further?`;
      case 'Minimalist':
        return `*Peaceful smile* Welcome to a space of financial tranquility. I'm ${charName}, and I believe in the beauty of simplicity in finances.`;
      case 'Generous Giver':
        return `*Shares an acorn* Hello friend! ${charName} here! I believe sharing is caring. How can we use your resources to make a difference?`;
      case 'Financial Adventurer':
        return `*Examines map* Ah, a fellow explorer! I'm ${charName}, always seeking new financial frontiers. What exciting money questions shall we explore today?`;
      default:
        return `Hi there! I'm ${charName}. I'm excited to chat with you about your finances!`;
    }
  };

  // Send message to the chatbot API
  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Make API call to backend chat endpoint
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          character: character,
          persona: persona
        })
      });
      
      // Parse the JSON response
      const data = await response.json();
      
      // Check if we got a valid response
      if (data && data.response) {
        const botResponse = {
          sender: 'character',
          text: data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } else {
        // Handle error case
        console.error('Invalid response format:', data);
        const errorResponse = {
          sender: 'character',
          text: "I'm having trouble connecting right now. Could you try again?",
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, errorResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        sender: 'character',
        text: "I'm having trouble connecting right now. Could you try again?",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-[80vh] max-h-[80vh]">
      {/* Chat header */}
      <div className="flex items-center p-3 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-700">
          <img src={getImagePath(imagePath)} alt={character} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-white font-medium">{character}</h3>
          <p className="text-gray-400 text-xs">{persona}</p>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-950">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'character' && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                <img src={getImagePath(imagePath)} alt={character} className="w-full h-full object-cover" />
              </div>
            )}
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
              <img src={getImagePath(imagePath)} alt={character} className="w-full h-full object-cover" />
            </div>
            <div className="bg-gray-800 text-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${character} a question...`}
            className="flex-1 bg-gray-800 text-white rounded-lg border border-gray-700 p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={input.trim() === '' || isTyping}
            className={`ml-2 p-2 rounded-full ${
              input.trim() === '' || isTyping
                ? 'bg-gray-800 text-gray-500'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            }`}
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;