<template>
  <div v-if="showInstallPrompt" class="pwa-prompt">
    <div class="prompt-content">
      <p>{{ TRANSLATIONS.PWA.INSTALL_PROMPT }}</p>
      <div class="prompt-buttons">
        <button @click="installPWA" class="install-btn">{{ TRANSLATIONS.PWA.INSTALL }}</button>
        <button @click="dismissPrompt" class="dismiss-btn">{{ TRANSLATIONS.PWA.DISMISS }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TRANSLATIONS } from '../../config/translations'

const deferredPrompt = ref<any>(null)
const showInstallPrompt = ref(false)

const handleBeforeInstallPrompt = (e: any) => {
  // Don't prevent default immediately
  e.preventDefault()
  // Store the event for later use
  deferredPrompt.value = e
  // Show our custom prompt if conditions are met
  if (!window.matchMedia('(display-mode: standalone)').matches && 
      !localStorage.getItem('pwa-prompt-dismissed')) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 1000)
  }
}

const installPWA = async () => {
  if (!deferredPrompt.value) {
    return
  }
  
  try {
    // Hide our custom prompt first
    showInstallPrompt.value = false
    
    // Show the native prompt
    const promptEvent = deferredPrompt.value
    deferredPrompt.value = null
    
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    } else {
      // Only set dismissed if user explicitly cancels
      localStorage.setItem('pwa-prompt-dismissed', 'true')
    }
  } catch (err) {
    // Reset state on error
    deferredPrompt.value = null
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-prompt-dismissed', 'true')
  deferredPrompt.value = null
}

onMounted(() => {
  // Clear any existing handlers first
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    localStorage.setItem('pwa-installed', 'true')
    return
  }
  
  // For testing: allow reset via URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('reset-pwa')) {
    localStorage.removeItem('pwa-prompt-dismissed')
    localStorage.removeItem('pwa-installed')
  }
  
  if (!localStorage.getItem('pwa-installed') && 
      !localStorage.getItem('pwa-prompt-dismissed')) {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  deferredPrompt.value = null
  showInstallPrompt.value = false
})
</script>

<style scoped>
.pwa-prompt {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 1rem);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-shadow);
  padding: 1rem;
  width: 90%;
  max-width: 400px;
  z-index: 1000;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.prompt-content {
  text-align: center;
}

.prompt-content p {
  margin: 0 0 1rem;
  color: var(--color-text);
}

.prompt-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.install-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.dismiss-btn {
  background: none;
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
}

.install-btn:active,
.dismiss-btn:active {
  transform: scale(0.98);
}
</style> 