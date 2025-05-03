// Mock API client for frontend-backend integration
const BASE_URL = 'http://localhost:3001/api';

// Financial personas mapping
const financialPersonas = {
  "Budgeting Maestro": {
    description: "Meticulously plans every expense, tracks budgets diligently, and always knows where every cent goes.",
    character: "Maestro Moolah",
    image: "owl_1.png"
  },
  "Spontaneous Spender": {
    description: "Lives in the moment, often making impulsive purchases for instant gratification.",
    character: "Flashy Fin",
    image: "dolphin_2.png"
  },
  "Cautious Saver": {
    description: "Prioritizes saving over spending, often setting aside funds for future security.",
    character: "Penny the Penguin",
    image: "penguin_3.png"
  },
  "Investment Enthusiast": {
    description: "Always looking for opportunities to grow wealth through various investments.",
    character: "Bullish Benny",
    image: "bull_4.png"
  },
  "Deal Hunter": {
    description: "Always on the lookout for discounts, coupons, and the best deals.",
    character: "Bargain Buzzy",
    image: "bee_5.png"
  },
  "Minimalist": {
    description: "Prefers simplicity, avoids unnecessary expenses, and values experiences over possessions.",
    character: "Zen Zeke",
    image: "panda_6.png"
  },
  "Generous Giver": {
    description: "Frequently donates to causes, helps friends in need, and values sharing wealth.",
    character: "Charity Charlie",
    image: "squirrel_7.png"
  },
  "Financial Adventurer": {
    description: "Explores new financial tools, apps, and unconventional methods to manage money.",
    character: "Explorer Ellie",
    image: "cat_8.png"
  }
};

// Mock financial data - this would be replaced with real API calls
const mockFinancialData = {
  user: {
    id: 'user123',
    name: 'John Doe',
    financialPersonality: 'Spontaneous Spender', // This determines which character is shown
    savingRate: {
      current: 15,
      previous: 10
    }
  },
  categories: {
    coffee: { percentage: 8, count: 42, averageInArea: 14 },
    travel: { percentage: 28, count: 18, averageInArea: 12 },
    dining: { percentage: 15, count: 34, averageInArea: 22 },
    shopping: { percentage: 22, count: 28, averageInArea: 30 },
    business: { percentage: 27, count: 16, averageInArea: 18 }
  },
  topMerchants: [
    { name: 'Café Amsterdam', category: 'coffee', visits: 18 },
    { name: 'NS Railways', category: 'travel', visits: 14 },
    { name: 'Albert Heijn', category: 'shopping', visits: 24 }
  ],
  spendingBreakdown: {
    experiences: 45,
    essentials: 55
  },
  weekdaySpending: {
    monday: 10,
    tuesday: 12,
    wednesday: 15,
    thursday: 18,
    friday: 22,
    saturday: 32,
    sunday: 24
  }
};

// API endpoints for frontend integration
const apiClient = {
  // Get user's financial data
  getUserFinancialData: async () => {
    // This would be an actual API call in production
    return new Promise((resolve) => {
      setTimeout(() => {
        // Add the persona details to the response
        const personalityType = mockFinancialData.user.financialPersonality;
        const persona = financialPersonas[personalityType] || financialPersonas["Financial Adventurer"];
        
        resolve({
          ...mockFinancialData,
          persona: {
            type: personalityType,
            description: persona.description,
            character: persona.character,
            image: persona.image
          }
        });
      }, 300);
    });
  },
  
  // Get user's privacy settings
  getUserPrivacySettings: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          privacyLevel: 'balanced',
          selectedCategories: ['coffee', 'travel', 'dining', 'shopping', 'business']
        });
      }, 200);
    });
  },
  
  // Update user's privacy settings
  updatePrivacySettings: async (privacyLevel) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, privacyLevel });
      }, 200);
    });
  },
  
  // Save user's category preferences
  saveCategories: async (categories) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, categories });
      }, 200);
    });
  },
  
  // Generate sharable insight card
  generateShareCard: async (type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          shareUrl: `https://bunq.com/wrapped/share/${Math.random().toString(36).substring(2, 9)}`
        });
      }, 300);
    });
  },
  
  // Get all available financial personas
  getFinancialPersonas: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(financialPersonas);
      }, 200);
    });
  }
};

export default apiClient;