// Environment variable validation
const requiredEnvVars = [
  'REACT_APP_API_URL'
];

const optionalEnvVars = [
  'REACT_APP_GEMINI_API_KEY',
  'REACT_APP_SOCKET_URL',
  'REACT_APP_ANALYTICS_ID'
];

export const validateEnvironment = () => {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (process.env.NODE_ENV === 'development') {
      console.warn('In development, some features may not work without these variables');
    } else {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Log optional variables that are missing
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.warn(`Optional environment variable not set: ${varName}`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    apiUrl: process.env.REACT_APP_API_URL,
    geminiKey: process.env.REACT_APP_GEMINI_API_KEY,
    socketUrl: process.env.REACT_APP_SOCKET_URL,
    analyticsId: process.env.REACT_APP_ANALYTICS_ID
  };
};

// Validate on import
export const envConfig = validateEnvironment(); 