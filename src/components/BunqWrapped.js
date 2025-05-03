import React from 'react';
import { useFinancialData } from '../backend/FinancialDataContext';
import LandingScreen from './LandingScreen';
import PrivacyScreen from './PrivacyScreen';
import CategoriesScreen from './CategoriesScreen';
import InsightsScreen from './InsightsScreen';

const BunqWrapped = () => {
  const [currentScreen, setCurrentScreen] = React.useState('landing');
  const { 
    privacyLevel, 
    selectedCategories, 
    updatePrivacyLevel, 
    updateSelectedCategories,
    loading
  } = useFinancialData();
  
  const renderScreen = () => {
    switch(currentScreen) {
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
        />;
      default:
        return <LandingScreen setCurrentScreen={setCurrentScreen} />;
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