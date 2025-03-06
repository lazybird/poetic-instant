<template>
  <div class="responsive-container" :class="{ 'wide-layout': isWideScreen }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
.responsive-container {
  width: 100%;
  margin: 0 auto;
  transition: max-width 0.3s ease;
}

.wide-layout {
  max-width: 1200px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 0 2rem;
}

@media (min-width: 1400px) {
  .wide-layout {
    max-width: 1400px;
  }
}
</style> 