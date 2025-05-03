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
    'Maestro Moolah': 'maestro_moolah.png',
    'Flashy Fin': 'flashy_fin.png',
    'Penny the Penguin': 'penny_penguin.png',
    'Bullish Benny': 'bullish_benny.png',
    'Bargain Buzzy': 'bargain_buzzy.png',
    'Zen Zeke': 'zen_zeke.png',
    'Charity Charlie': 'charity_charlie.png',
    'Explorer Ellie': 'explorer_ellie.png'
  };
  
  return characterImageMap[character] || 'explorer_ellie.png';
}

export default apiClient;