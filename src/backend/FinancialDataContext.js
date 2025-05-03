import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from './api/apiClient';

// Create context
const FinancialDataContext = createContext();

// Provider component
export const FinancialDataProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState(null);
  const [privacyLevel, setPrivacyLevel] = useState('balanced');
  const [selectedCategories, setSelectedCategories] = useState({
    coffee: true,
    travel: true,
    dining: true,
    shopping: true,
    business: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user privacy settings on initial load
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await apiClient.getUserPrivacySettings();
        setPrivacyLevel(settings.privacyLevel);
        
        // Convert array of categories to object format
        if (settings.selectedCategories) {
          const categoriesObj = {
            coffee: false,
            travel: false,
            dining: false,
            shopping: false,
            business: false
          };
          
          settings.selectedCategories.forEach(cat => {
            categoriesObj[cat] = true;
          });
          
          setSelectedCategories(categoriesObj);
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      }
    };
    
    loadUserSettings();
  }, []);

  // Load financial data based on privacy level
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getUserFinancialData();
        setFinancialData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load financial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFinancialData();
  }, [privacyLevel]);

  // Update privacy level
  const updatePrivacyLevel = async (level) => {
    try {
      await apiClient.updatePrivacySettings(level);
      setPrivacyLevel(level);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
    }
  };

  // Update selected categories
  const updateSelectedCategories = async (categories) => {
    try {
      const selectedArray = Object.keys(categories).filter(key => categories[key]);
      await apiClient.saveCategories(selectedArray);
      setSelectedCategories(categories);
    } catch (err) {
      console.error('Failed to update categories:', err);
    }
  };

  // Share an insight
  const shareInsight = async (type) => {
    try {
      return await apiClient.generateShareCard(type);
    } catch (err) {
      console.error('Failed to share insight:', err);
      throw err;
    }
  };

  // Data processing functions for different privacy levels
  // Inside getInsightsForPrivacyLevel in src/backend/FinancialDataContext.js
const getInsightsForPrivacyLevel = () => {
    if (!financialData) return null;
    
    // Make sure the persona is always included
    const baseInsights = {
      financialPersonality: financialData.user.financialPersonality,
      persona: financialData.persona
    };
    
    switch(privacyLevel) {
      case 'high':
        return {
          ...baseInsights,
          savingTrend: financialData.user.savingRate.current > financialData.user.savingRate.previous,
          weekdayPattern: Object.entries(financialData.weekdaySpending).sort((a, b) => b[1] - a[1])[0][0]
        };
        
      case 'balanced':
        // Find top category
        const topCategory = Object.entries(financialData.categories)
          .sort((a, b) => b[1].percentage - a[1].percentage)[0];
          
        return {
          ...baseInsights,
          spendingBreakdown: financialData.spendingBreakdown,
          topCategory: {
            name: topCategory[0],
            percentage: topCategory[1].percentage
          }
        };
        
      case 'detailed':
        return {
          ...baseInsights,
          spendingBreakdown: financialData.spendingBreakdown,
          topCategory: Object.entries(financialData.categories)
            .sort((a, b) => b[1].percentage - a[1].percentage)[0][0],
          topMerchants: financialData.topMerchants,
          categories: financialData.categories
        };
        
      default:
        return baseInsights;
    }
  };

  const value = {
    financialData,
    privacyLevel,
    selectedCategories,
    loading,
    error,
    insights: getInsightsForPrivacyLevel(),
    updatePrivacyLevel,
    updateSelectedCategories,
    shareInsight
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
};

// Custom hook for using the context
export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};