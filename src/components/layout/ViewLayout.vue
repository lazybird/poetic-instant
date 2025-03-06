<template>
  <div class="view-container" :class="{ 'wide-layout': isWideScreen }">
    <div class="app-header">
      <h1>{{ title }}</h1>
    </div>
    <div class="content-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  title: string
}>()

const isWideScreen = ref(false)

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

<style scoped>
.view-container {
  padding: var(--spacing-md);
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.wide-layout {
  padding: var(--spacing-xl);
  max-width: 800px;
}

.content-container {
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  padding: 0 var(--spacing-sm);
}

@media (max-width: 480px) {
  .view-container {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .content-container {
    padding: 0 var(--spacing-xs);
  }
}

@media (min-width: 768px) {
  .content-container {
    padding: 0 var(--spacing-md);
  }
}

@media (min-width: 1400px) {
  .wide-layout {
    max-width: 900px;
  }
  
  .content-container {
    padding: 0 var(--spacing-lg);
  }
}
</style> 