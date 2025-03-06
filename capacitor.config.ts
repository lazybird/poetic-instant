import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poeticinstant.app',
  appName: 'Poetic Instant',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Only use local URL in development
    ...(process.env.NODE_ENV === 'development' ? {
      url: 'http://localhost:5173',
      cleartext: true
    } : {})
  },
  android: {
    backgroundColor: '#FFFFFF',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
    },
  }
};

export default config; 