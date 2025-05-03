// userImages.js - Safe image imports for user profiles
import defaultImage from '../assets/explorer_ellie.png';

// Use a try-catch to safely import profile images
const getUserImage = (userId) => {
  try {
    // Dynamic import of user profile images
    return require(`../assets/${userId}.png`);
  } catch (error) {
    console.log(`Image for user ${userId} not found, using default`);
    return defaultImage;
  }
};

// Pre-load all user images (1-8)
const userImages = {
  default: defaultImage
};

// Try to pre-load all profile images
for (let i = 1; i <= 8; i++) {
  try {
    userImages[i] = require(`../assets/${i}.png`);
  } catch {
    userImages[i] = defaultImage;
  }
}

export { getUserImage, userImages };