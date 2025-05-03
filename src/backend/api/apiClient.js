// apiClient.js - Facade over the bunqApiClient
import bunqApiClient from './bunqApiClient';

// Re-export all methods from bunqApiClient
const apiClient = {
  ...bunqApiClient,
  
  // Add any additional app-specific methods here
  getUserFinancialData: async () => {
    // Get data from the bunq API
    const summaryData = await bunqApiClient.getFinancialSummary();
    
    // Return the formatted data
    return {
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
  }
};

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
  
  return characterImageMap[character] || 'cat_8.png';
}

export default apiClient;