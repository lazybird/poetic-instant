import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

// PWA debug logging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration)
    })
    .catch(error => {
      console.error('SW registration failed:', error)
    })
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt fired')
})

window.addEventListener('appinstalled', (e) => {
  console.log('App installed')
})

async function initializeApp() {
  try {
    // Only run StatusBar code on native platforms
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({ style: Style.Light })
    }
    
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
    
    await SplashScreen.hide()
  } catch (err) {
    console.error('Error initializing app:', err)
    // Still create the app even if native features fail
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
  }
}

initializeApp() 