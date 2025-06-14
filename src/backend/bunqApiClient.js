// bunqApiClient.js - API client for connecting to the Flask backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

const bunqApiClient = {
  // Get financial summary data with userId support
  getFinancialSummary: async (userId = null) => {
    try {
      const url = userId 
      ? `${API_BASE_URL}/memories/summary/${userId}` 
      : `${API_BASE_URL}/memories/summary`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  },

  // Get all transactions with userId support
  getTransactions: async (userId = null) => {
    // If there's a user ID, we can append it as a query parameter
    const url = userId 
      ? `${API_BASE_URL}/memories/transactions/${userId}` 
      : `${API_BASE_URL}/memories/transactions`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;      
    }
  },

  // Mock functions to maintain compatibility with existing code
  getUserPrivacySettings: async () => {
    return {
      privacyLevel: 'balanced',
      selectedCategories: ['coffee', 'travel', 'dining', 'shopping', 'business']
    };
  },

  updatePrivacySettings: async (level) => {
    console.log('Privacy settings updated to:', level);
    return { success: true };
  },

  saveCategories: async (categories) => {
    console.log('Categories updated:', categories);
    return { success: true };
  },

  generateShareCard: async (type) => {
    console.log('Generating share card for:', type);
    return { shareUrl: 'https://example.com/share/123' };
  }
};

export default bunqApiClient;