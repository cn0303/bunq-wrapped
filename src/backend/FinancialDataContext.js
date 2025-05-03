import React, { createContext, useState, useEffect, useContext } from 'react';
import bunqApiClient from './bunqApiClient';

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
  const [transactions, setTransactions] = useState([]);

  // Load user privacy settings on initial load
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await bunqApiClient.getUserPrivacySettings();
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

  // Load financial data from Bunq API
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        
        // Get financial summary from Bunq API
        const summaryData = await bunqApiClient.getFinancialSummary();
        
        // Get all transactions for further processing if needed
        const transactionsData = await bunqApiClient.getTransactions();
        setTransactions(transactionsData);
        
        // Format the data for our app
        const formattedData = {
          user: {
            financialPersonality: summaryData.financialPersonality || 'Financial Adventurer',
            savingRate: {
              current: 25,
              previous: 20
            }
          },
          categories: summaryData.categories || {},
          topMerchants: summaryData.topMerchants || [],
          spendingBreakdown: summaryData.spendingBreakdown || {
            experiences: 45,
            essentials: 55
          },
          weekdaySpending: summaryData.weekdaySpending || {},
          conversationPoints: summaryData.conversationPoints || [],
          persona: {
            type: summaryData.financialPersonality || 'Financial Adventurer',
            character: getCharacterForPersonality(summaryData.financialPersonality),
            description: getDescriptionForPersonality(summaryData.financialPersonality),
            image: getImageForCharacter(getCharacterForPersonality(summaryData.financialPersonality))
          }
        };
        
        setFinancialData(formattedData);
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

  // Helper functions to map personality to character and description
  function getCharacterForPersonality(personality) {
    const personalities = {
      'The Budgeting Maestro': 'Maestro Moolah',
      'The Spontaneous Spender': 'Flashy Fin',
      'The Cautious Saver': 'Penny the Penguin', 
      'The Investment Enthusiast': 'Bullish Benny',
      'The Deal Hunter': 'Bargain Buzzy',
      'The Minimalist': 'Zen Zeke',
      'The Generous Giver': 'Charity Charlie',
      'The Financial Adventurer': 'Explorer Ellie'
    };
    return personalities[personality] || 'Explorer Ellie';
  }

  function getDescriptionForPersonality(personality) {
    const descriptions = {
      'The Budgeting Maestro': 'Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes.',
      'The Spontaneous Spender': 'Lives in the moment, often making impulsive purchases for instant gratification.',
      'The Cautious Saver': 'Prioritizes saving over spending, often setting aside funds for future security.',
      'The Investment Enthusiast': 'Always looking for opportunities to grow wealth through various investments.',
      'The Deal Hunter': 'Always on the lookout for discounts, coupons, and the best deals.',
      'The Minimalist': 'Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions.',
      'The Generous Giver': 'Frequently donates to causes, helps friends in need, and values sharing wealth.',
      'The Financial Adventurer': 'Explores new financial tools, apps, and unconventional methods to manage money.'
    };
    return descriptions[personality] || 'Explores new financial tools, apps, and unconventional methods to manage money.';
  }

  function getImageForCharacter(character) {
    // Map character names to image file names
    // This is a placeholder - adjust based on your actual image naming convention
    const characterImageMap = {
      'Maestro Moolah': 'owl_1.png',
      'Flashy Fin': 'dolphin_2.png',
      'Penny the Penguin': 'penguin_3.png',
      'Bullish Benny': 'bull_4.png',
      'Bargain Buzzy': 'bee_5.png',
      'Zen Zeke': 'panda_6.png',
      'Charity Charlie': 'squirrel_7.png',
      'Explorer Ellie': 'cat_8.png'
    };
    
    return characterImageMap[character] || 'explorer_ellie.png';
  }

  // Update privacy level
  const updatePrivacyLevel = async (level) => {
    try {
      await bunqApiClient.updatePrivacySettings(level);
      setPrivacyLevel(level);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
    }
  };

  // Update selected categories
  const updateSelectedCategories = async (categories) => {
    try {
      const selectedArray = Object.keys(categories).filter(key => categories[key]);
      await bunqApiClient.saveCategories(selectedArray);
      setSelectedCategories(categories);
    } catch (err) {
      console.error('Failed to update categories:', err);
    }
  };

  // Share an insight
  const shareInsight = async (type) => {
    try {
      return await bunqApiClient.generateShareCard(type);
    } catch (err) {
      console.error('Failed to share insight:', err);
      throw err;
    }
  };

  // Data processing functions for different privacy levels
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
            name: topCategory ? topCategory[0] : 'travel',
            percentage: topCategory ? topCategory[1].percentage : 28
          }
        };
        
      case 'detailed':
        return {
          ...baseInsights,
          spendingBreakdown: financialData.spendingBreakdown,
          topCategory: Object.entries(financialData.categories).length > 0 
            ? Object.entries(financialData.categories)
                .sort((a, b) => b[1].percentage - a[1].percentage)[0][0]
            : 'travel',
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
    transactions,
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