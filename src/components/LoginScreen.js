import React, { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';

// Import user profile images
import user1Image from '../assets/people/1.png';
import user2Image from '../assets/people/2.png';
import user3Image from '../assets/people/3.png';
import user4Image from '../assets/people/4.png';
import user5Image from '../assets/people/5.png';
import user6Image from '../assets/people/6.png';
import user7Image from '../assets/people/7.png';
import user8Image from '../assets/people/8.png';

const LoginScreen = ({ onLogin }) => {
  const [userId, setUserId] = useState('1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const users = [
    { id: '1', name: "Martijn de Vries, 42, Dutch financial analyst", image: user1Image },
    { id: '2', name: "Sofia Patel, 28, British-Indian marketing executive", image: user2Image },
    { id: '3', name: "Lars Jensen, 35, Danish programmer living in Utrecht", image: user3Image },
    { id: '4', name: "Mei Lin, 31, Chinese-Dutch investment advisor", image: user4Image },
    { id: '5', name: "Fatima El-Haddad, 29, Moroccan-Dutch teacher", image: user5Image },
    { id: '6', name: "Johannes Weber, 40, German architect based in Amsterdam", image: user6Image },
    { id: '7', name: "Isabella Rossi, 37, Italian chef with a restaurant in Rotterdam", image: user7Image },
    { id: '8', name: "Thijs van der Meer, 26, Dutch tech entrepreneur", image: user8Image }
  ];
  
  // Find the current user
  const currentUser = users.find(user => user.id === userId) || users[0];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'bunqiscool') {
      onLogin(userId);
    } else {
      setError('Invalid password. Please try again.');
    }
  };
  
  return (
    <div className="max-w-sm w-full bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800">
      {/* Header with rainbow border */}
      <div className="p-4 text-center relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-violet-500"></div>
        <h1 className="text-2xl font-bold text-white">Financial Story</h1>
        <p className="text-gray-400 text-sm">Sign in to view your financial insights</p>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700">
            <img 
              src={currentUser.image} 
              alt={`${currentUser.name} profile`} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select User</label>
            <select 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg border border-gray-700 p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg border border-gray-700 p-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none pl-10"
                placeholder="Enter your password"
              />
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-2 rounded-lg text-xs">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all text-white"
            style={{ background: 'linear-gradient(to right, #f43f5e, #fb923c, #fbbf24, #4ade80, #22d3ee, #818cf8, #a855f7)' }}
          >
            Sign In <ArrowRight size={16} className="ml-2" />
          </button>
        </form>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-center text-gray-500 text-xs">
          © 2025 Bunq Financial Story. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;