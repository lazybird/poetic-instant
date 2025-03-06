<template>
  <div 
    class="pull-indicator"
    :style="{
      transform: `translateY(${distance}px)`,
      opacity: Math.min(1, distance / threshold)
    }"
  >
    <div class="spinner" :class="{ active: isRefreshing }">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path 
          fill="currentColor" 
          d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
        />
      </svg>
    </div>
    <span>{{ isRefreshing ? 'Refreshing...' : 'Pull to refresh' }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  distance: number
  threshold: number
  isRefreshing: boolean
}>()
</script>

<style scoped>
.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 50px;
  color: #666;
  font-size: 0.9rem;
  pointer-events: none;
}

.spinner {
  opacity: 0.6;
}

.spinner.active {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 