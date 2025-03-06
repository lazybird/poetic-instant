<template>
  <ViewLayout :title="TRANSLATIONS.NAV.FAVORITES">
    <div class="content" :class="{ 'grid-layout': isWideScreen }">
      <template v-if="poemStore.favoritedPoems.length === 0">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <p>{{ TRANSLATIONS.POEM.NO_FAVORITES }}</p>
        </div>
      </template>
      <TransitionGroup 
        v-else
        name="list" 
        tag="div" 
        class="poems-list" :class="{ 'grid-list': isWideScreen }"
      >
        <div v-for="(poem, index) in poemStore.favoritedPoems" 
          :key="poem.id" 
          class="poem-card"
          :style="{ '--delay': `${index * 0.05}s` }"
        >
          <div class="poem-content">
            <div class="poem-text">{{ poem.text }}</div>
            <div class="poem-author">- {{ poem.author }}</div>
          </div>
          <button 
            class="unlike-btn"
            @click="unlikePoem(poem.id)"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </ViewLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePoemStore } from '../stores/poems'
import { TRANSLATIONS } from '../config/translations'
import ViewLayout from '../components/layout/ViewLayout.vue'

const poemStore = usePoemStore()
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

const unlikePoem = (id: string) => {
  poemStore.toggleFavorite(id)
}
</script>

<style scoped>
.content {
  padding: var(--spacing-md) 0;
  margin: 0 var(--spacing-sm);
}

.empty-state {
  text-align: center;
  color: var(--color-text-light);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.empty-state svg {
  color: #ccc;
  margin-bottom: var(--spacing-md);
}

.empty-state .subtitle {
  color: #999;
  font-size: 0.9rem;
}

.poem-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin: 0 var(--spacing-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  transition: transform 0.2s ease;
  border: 1px solid var(--color-border);
  --delay: 0s;
  animation: card-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(20px);
}

.poem-card:active {
  transform: scale(0.98);
  background: rgba(0, 0, 0, 0.01);
}

.poem-content {
  flex: 1;
}

.poem-text {
  white-space: pre-wrap;
  margin-bottom: var(--spacing-md);
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text);
  font-family: var(--font-text);
}

.poem-author {
  text-align: right;
  font-style: italic;
  color: var(--color-text-light);
  font-size: 0.95rem;
  font-family: var(--font-text);
}

.unlike-btn {
  background: none;
  border: none;
  padding: 8px;
  color: var(--color-primary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin: -4px;
}

.unlike-btn:active {
  transform: scale(0.9);
  background: rgba(0, 220, 125, 0.1);
}

@media (max-width: 480px) {
  .poem-card {
    padding: var(--spacing-md);
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

.poems-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  will-change: transform;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* List transition animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.grid-layout {
  padding: var(--spacing-md) 0;
  margin: 0 var(--spacing-sm);
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-sm);
}

/* Add more padding on larger screens */
@media (min-width: 768px) {
  .content {
    margin: 0 var(--spacing-md);
  }
  
  .poem-card {
    margin: 0;
  }
  
  .grid-layout {
    margin: 0 var(--spacing-md);
  }
  
  .grid-list {
    padding: 0;
  }
}
</style>