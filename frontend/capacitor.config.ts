import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mynest.app',
  appName: 'MyNest',
  webDir: 'dist',
  server: {
    // For development: uncomment to use local dev server
    // url: 'http://localhost:5173',
    // cleartext: true,
    
    // For production: leave commented to use built files from webDir
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F3F1E7', // MyNest background color
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
