<script setup lang="ts">
import { ref, watch, onErrorCaptured, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBackButton } from './composables/useBackButton'
import PWAPrompt from './components/pwa/PWAPrompt.vue'
import HomeIcon from './components/icons/HomeIcon.vue'
import PenIcon from './components/icons/PenIcon.vue'
import HeartIcon from './components/icons/HeartIcon.vue'
import { TRANSLATIONS } from './config/translations'

const router = useRouter()
const transitionName = ref('slide-left')
const error = ref<string | null>(null)
const isWideScreen = ref(false)

// Track navigation direction and pages
const routes = {
  '/': { index: 0, transition: 'slide' },
  '/favorites': { index: 1, transition: 'fade' }
}

// Initialize back button handling
useBackButton()

watch(() => router.currentRoute.value.path, (to, from) => {
  const toRoute = routes[to as keyof typeof routes] || { index: 0, transition: 'slide' }
  const fromRoute = routes[from as keyof typeof routes] || { index: 0, transition: 'slide' }
  
  // Use fade transition when moving to/from favorites
  if (toRoute.transition === 'fade' || fromRoute.transition === 'fade') {
    transitionName.value = 'fade'
  } else {
    transitionName.value = toRoute.index < fromRoute.index ? 'slide-right' : 'slide-left'
  }
})

// Transition hooks for better performance
const beforeLeave = (el: Element) => {
  const { left } = (el as HTMLElement).getBoundingClientRect()
  if (el instanceof HTMLElement) {
    el.style.left = left + 'px'
    el.style.position = 'absolute'
    el.style.width = '100%'
  }
}

const enter = (el: Element, done: () => void) => {
  if (el instanceof HTMLElement) {
    el.style.position = ''
    el.style.left = ''
    el.style.width = ''
  }
  done()
}

onErrorCaptured((err) => {
  console.error('App error:', err)
  error.value = 'Something went wrong. Please try again.'
  return false
})

const resetError = () => {
  error.value = null
  window.location.reload()
}

const checkScreenSize = () => {
  isWideScreen.value = window.innerWidth >= 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="app">
    <div v-if="error" class="error-boundary">
      <p>{{ error }}</p>
      <button @click="resetError">Try Again</button>
    </div>
    <div v-else class="page-container" :class="{ 'wide-container': isWideScreen }">
      <router-view v-slot="{ Component, route }">
        <transition 
          :name="transitionName" 
          @before-leave="beforeLeave"
          @enter="enter"
        >
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
      <nav class="bottom-nav">
        <router-link to="/" class="nav-item" active-class="active">
          <HomeIcon />
          <span>{{ TRANSLATIONS.NAV.HOME }}</span>
        </router-link>
        <router-link to="/submit" class="nav-item" active-class="active">
          <PenIcon />
          <span>{{ TRANSLATIONS.NAV.SUBMIT }}</span>
        </router-link>
        <router-link to="/favorites" class="nav-item" active-class="active">
          <HeartIcon />
          <span>{{ TRANSLATIONS.NAV.FAVORITES }}</span>
        </router-link>
      </nav>
      <PWAPrompt />
    </div>
  </div>
</template>

<style>
:root {
  /* Safe area insets */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 16px);
  --safe-area-left: env(safe-area-inset-left, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  
  /* Layout */
  --bottom-nav-height: 64px;
  --bottom-nav-padding: 16px;
  
  /* Typography */
  --font-title: 'Cormorant Garamond', serif;
  --font-text: 'Lora', serif;
  --header-padding-top: 2rem;
  
  /* Colors */
  --color-primary: #00dc7d;
  --color-primary-dark: #00b76a;
  --color-text: #2c3e50;
  --color-text-light: #666;
  --color-background: #f9f9f9;
  --color-border: rgba(0, 0, 0, 0.05);
  --color-shadow: rgba(0, 0, 0, 0.03);
  --color-error: #ff4444;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  font-family: var(--font-text);
  color: var(--color-text);
  background: var(--color-background);
}

.app {
  min-height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  overflow-x: hidden;
  position: relative;
}

.page-container {
  min-height: 100vh;
  padding-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom));
  position: relative;
  overflow-x: hidden;
  width: 100%;
}

/* Remove redundant styles and use CSS variables */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background: white;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: 2rem;
  align-items: center;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px var(--color-shadow);
  padding: 0;
  margin: 0;
  padding-bottom: var(--safe-area-bottom);
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-light);
  text-decoration: none;
  padding: 8px 0;
  width: auto;
  min-width: 70px;
  transition: transform 0.2s ease;
  height: 100%;
  justify-content: center;
  flex: 0 0 auto;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item svg {
  width: 28px;
  height: 28px;
}

.nav-item span {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1;
}

/* Global header styles */
.app-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-top: var(--header-padding-top);
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
  font-family: var(--font-title);
}

/* Common view styles */
.view-container {
  padding: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.content-container {
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Common empty state styles */
.empty-state {
  text-align: center;
  color: var(--color-text-light);
  font-size: 1.2rem;
  padding: var(--spacing-xl);
}

/* Common fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* Wide container styles */
.wide-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom));
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 1200px) {
  .wide-container {
    max-width: 900px;
  }
}

/* Error styles */
.error-boundary {
  padding: var(--spacing-xl);
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-boundary button {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

/* Fix for the poem card container */
.poem-container {
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Fix for the poem card */
.poem-card {
  max-width: 100%;
  max-height: 90%;
  box-sizing: border-box;
  transform-origin: center center;
}

/* Common form styles */
.form-group {
  margin-bottom: var(--spacing-lg);
  width: 100%;
  box-sizing: border-box;
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
  font-weight: 500;
}

textarea, input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: white;
  color: var(--color-text);
  box-sizing: border-box;
  max-width: 100%;
}

textarea:focus, input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error {
  border-color: var(--color-error) !important;
}

.error-text {
  color: var(--color-error);
  font-size: 0.9rem;
  margin-top: var(--spacing-sm);
}

button {
  cursor: pointer;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-header {
    margin-bottom: var(--spacing-md);
  }
}
</style>
