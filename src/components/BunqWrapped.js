import React, { useState } from 'react';
import { useFinancialData } from '../backend/FinancialDataContext';
import LoginScreen from './LoginScreen';
import LandingScreen from './LandingScreen';
import PrivacyScreen from './PrivacyScreen';
import CategoriesScreen from './CategoriesScreen';
import InsightsScreen from './InsightsScreen';

const BunqWrapped = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [userId, setUserId] = useState(null);
  const { 
    privacyLevel, 
    selectedCategories, 
    updatePrivacyLevel, 
    updateSelectedCategories,
    loading,
    loadUserData
  } = useFinancialData();
  
  const handleLogin = async (userId) => {
    // If you have a loadUserData function in your context, call it here
    if (loadUserData) {
      await loadUserData(userId);
    }
    
    setUserId(userId);
    setCurrentScreen('landing');
  };
  
  const renderScreen = () => {
    switch(currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'landing':
        return <LandingScreen setCurrentScreen={setCurrentScreen} />;
      case 'privacySettings':
        return <PrivacyScreen 
          setCurrentScreen={setCurrentScreen} 
          privacyLevel={privacyLevel} 
          setPrivacyLevel={updatePrivacyLevel} 
        />;
      case 'categories':
        return <CategoriesScreen 
          setCurrentScreen={setCurrentScreen}
          selectedCategories={selectedCategories}
          setSelectedCategories={updateSelectedCategories}
        />;
      case 'insights':
        return <InsightsScreen 
          setCurrentScreen={setCurrentScreen} 
          privacyLevel={privacyLevel}
          userId={userId}
        />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };
  
  return (
    <div className="flex justify-center items-center bg-black min-h-screen">
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        renderScreen()
      )}
    </div>
  );
};

export default BunqWrapped;