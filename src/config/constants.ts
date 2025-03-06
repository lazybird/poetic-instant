export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    ANONYMOUS_ID: 'anonymous_user_id',
    PWA_DISMISSED: 'pwa-prompt-dismissed',
    PWA_INSTALLED: 'pwa-installed'
  },
  
  ROUTES: {
    HOME: '/',
    FAVORITES: '/favorites',
    SUBMIT: '/submit'
  },
  
  TRANSITIONS: {
    SLIDE_LEFT: 'slide-left',
    SLIDE_RIGHT: 'slide-right',
    FADE: 'fade'
  }
} as const 