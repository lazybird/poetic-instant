<template>
    <keep-alive>
      <ViewLayout :title="TRANSLATIONS.APP_NAME">
        <PullToRefresh
          :distance="pullDistance"
          :threshold="100"
          :is-refreshing="isRefreshing"
        />
        <div class="poem-container" :class="{ 'wide-poem': isWideScreen }">
          <Transition name="fade" mode="out-in">
            <PoemCard
              v-if="poemStore.currentPoem"
              :key="poemStore.currentPoem.id"
              :poem="poemStore.currentPoem"
              @next="poemStore.nextPoem"
              @previous="poemStore.previousPoem"
              @like="poemStore.toggleFavorite"
            />
            <div v-else class="empty-state">
              <p>{{ TRANSLATIONS.POEM.EMPTY_STATE }}</p>
              <router-link to="/submit">{{ TRANSLATIONS.POEM.WRITE_YOURS }}</router-link>
            </div>
          </Transition>
        </div>
      </ViewLayout>
    </keep-alive>
  </template>
  
  <script setup lang="ts">
  import { onMounted, computed, onActivated, ref, onUnmounted } from 'vue'
  import { usePoemStore } from '../stores/poems'
  import PoemCard from '../components/poem/PoemCard.vue'
  import PullToRefresh from '../components/shared/PullToRefresh.vue'
  import { usePullToRefresh } from '../composables/usePullToRefresh'
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
    poemStore.fetchPoems()
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
  
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await poemStore.fetchPoems()
    }
  })
  
  const emptyStateMessage = computed(() => 
    poemStore.poems.length === 0 
      ? 'No poems yet. Be the first to submit!' 
      : 'Loading...'
  )
  
  onActivated(async () => {
    try {
      await poemStore.fetchFavorites()
    } catch (err) {
      console.error('Error refreshing favorites:', err)
    }
  })
  </script>
  
  <style scoped>
  .poem-container {
    width: 90%;
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-md);
    perspective: 1000px;
    min-height: 350px;
    height: calc(100vh - var(--bottom-nav-height) - var(--safe-area-bottom) - var(--header-padding-top) - 6rem);
    display: flex;
    align-items: center;
  }
  
  .empty-state {
    text-align: center;
    color: var(--color-text-light);
    font-size: 1.2rem;
    padding: 2rem;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-height: 700px) {
    .poem-container {
      height: calc(100vh - var(--bottom-nav-height) - var(--safe-area-bottom) - var(--header-padding-top) - 5rem);
    }
  }
  
  @media (max-height: 600px) {
    .poem-container {
      height: calc(100vh - var(--bottom-nav-height) - var(--safe-area-bottom) - var(--header-padding-top) - 3rem);
    }
  }
  
  .wide-poem {
    max-width: 800px;
    margin: var(--spacing-xl) auto;
    height: auto;
    min-height: 400px;
  }
  </style>