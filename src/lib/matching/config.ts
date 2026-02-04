export const MATCHING_CONFIG = {
  // Confidence thresholds
  thresholds: {
    autoAccept: parseInt(import.meta.env.VITE_MATCH_AUTO_ACCEPT_THRESHOLD || '85'),
    quickReview: parseInt(import.meta.env.VITE_MATCH_QUICK_REVIEW_THRESHOLD || '60'),
    manualReview: 0,
  },
  
  // AI Matching settings
  ai: {
    maxCandidates: parseInt(import.meta.env.VITE_MATCH_MAX_AI_CANDIDATES || '10'),
    timeout: 30000, // 30 seconds
    retries: 2,
  },
  
  // Fuzzy matching settings (for candidate retrieval)
  fuzzy: {
    threshold: 0.3,
    distance: 100,
    keys: ['item_number', 'description'],
  },
};

// Fireworks.ai Configuration for Kimi K2.5
export const FIREWORKS_CONFIG = {
  apiKey: import.meta.env.VITE_FIREWORKS_API_KEY,
  // Kimi K2.5 model endpoint on Fireworks.ai
  model: 'accounts/fireworks/models/kimi-k2-5',
  endpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_FIREWORKS_API_KEY}`,
    'Content-Type': 'application/json',
  },
};
