<template>
  <div 
    ref="cardRef"
    class="poem-card"
    :style="style"
    :class="{ 'wide-card': isWideScreen }"
  >
    <div class="poem-content">
      <div class="poem-text">{{ poem.text }}</div>
      <div class="poem-author">- {{ poem.author }}</div>
    </div>
    <div class="action-buttons">
      <button class="action-btn rewind" @click="onPreviousClick">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11H8.83l2.88 2.88c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41L10.3 6.7c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L8.83 11H16c.55 0 1 .45 1 1s-.45 1-1 1z"/>
        </svg>
      </button>
      <button 
        class="action-btn like" 
        :class="{ active: poemStore.isFavorited(poem.id) }" 
        @click="onLikeClick"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <button class="action-btn next" @click="onNextClick">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11H8.83l2.88 2.88c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41L10.3 6.7c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L8.83 11H16c.55 0 1 .45 1 1s-.45 1-1 1z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePoemStore } from '../../stores/poems'
import { Haptics } from '@capacitor/haptics'
import { ImpactStyle } from '@capacitor/haptics'
import { handleError } from '../../lib/errorHandling'

interface Poem {
  id: string
  text: string
  author: string
  timestamp: string
  likes: number
}

const props = defineProps<{
  poem: Poem
}>()

const emit = defineEmits<{
  next: []
  previous: []
  like: [id: string]
}>()

const poemStore = usePoemStore()
const cardRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const rotation = ref(0)
const startPos = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const isWideScreen = ref(false)

const style = computed(() => ({
  transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0) rotate(${rotation.value}deg)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.2, 1, 0.3, 1)'
}))

const checkScreenSize = () => {
  isWideScreen.value = window.innerWidth >= 768
}

onMounted(() => {
  const el = cardRef.value
  if (el) {
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
  }
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  const el = cardRef.value
  if (el) {
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  }
  window.removeEventListener('resize', checkScreenSize)
})

const onNextClick = () => {
  position.value = { x: window.innerWidth, y: 0 }
  rotation.value = 15
  setTimeout(() => {
    position.value = { x: 0, y: 0 }
    rotation.value = 0
    emit('next')
  }, 300)
}

const onPreviousClick = () => {
  position.value = { x: -window.innerWidth, y: 0 }
  rotation.value = -15
  setTimeout(() => {
    position.value = { x: 0, y: 0 }
    rotation.value = 0
    emit('previous')
  }, 300)
}

const onLikeClick = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
    await poemStore.toggleFavorite(props.poem.id)
  } catch (err) {
    handleError(err, 'PoemCard.onLikeClick')
  }
  
  position.value = { x: 0, y: 0 }
  rotation.value = 0
}

const handleSwipe = (deltaX: number, deltaY: number) => {
  const threshold = window.innerWidth * 0.15
  
  if (Math.abs(deltaX) > threshold) {
    position.value = { x: deltaX > 0 ? window.innerWidth : -window.innerWidth, y: 0 }
    rotation.value = deltaX > 0 ? 15 : -15
    setTimeout(() => {
      position.value = { x: 0, y: 0 }
      rotation.value = 0
      if (deltaX > 0) {
        emit('next')
      } else {
        emit('previous')
      }
    }, 300)
  } else if (deltaY < -threshold) {
    position.value = { x: 0, y: -window.innerHeight * 0.8 }
    setTimeout(() => {
      position.value = { x: 0, y: 0 }
      rotation.value = 0
      poemStore.toggleFavorite(props.poem.id)
    }, 300)
  } else if (deltaY > threshold) {
    position.value = { x: 0, y: 0 }
    rotation.value = 0
  } else {
    position.value = { x: 0, y: 0 }
    rotation.value = 0
  }
}

const onTouchStart = (e: TouchEvent) => {
  if ((e.target as HTMLElement).closest('.action-btn')) {
    return
  }
  e.preventDefault()
  isDragging.value = true
  const touch = e.touches[0]
  startPos.value = { x: touch.clientX, y: touch.clientY }
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()

  const touch = e.touches[0]
  const deltaX = touch.clientX - startPos.value.x
  const deltaY = touch.clientY - startPos.value.y

  position.value = { x: deltaX, y: deltaY }
  rotation.value = (deltaX / window.innerWidth) * 15
}

const onTouchEnd = (e: TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()

  isDragging.value = false
  const deltaX = position.value.x
  const deltaY = position.value.y
  handleSwipe(deltaX, deltaY)
}
</script>

<style scoped>
.poem-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid var(--color-border);
  user-select: none;
  -webkit-user-select: none;
  margin-bottom: 4rem;
}

.poem-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 80%;
  margin: 0 auto;
}

.poem-text {
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
  font-size: 1.4rem;
  line-height: 1.7;
  color: var(--color-text);
  font-family: var(--font-text);
}

.poem-author {
  text-align: right;
  font-style: italic;
  color: var(--color-text-light);
  font-size: 1.1rem;
  font-family: var(--font-text);
}

.action-buttons {
  position: absolute;
  bottom: -2.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.action-btn {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid #eee;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:active {
  transform: scale(0.9);
  transition: all 0.1s ease;
}

.action-btn.like {
  color: var(--color-primary);
}

.action-btn.like.active {
  background: var(--color-primary);
  color: white;
  border: none;
}

.action-btn.rewind {
  color: #ffd02c;
}


.action-btn.next {
  color: #00b4ff;
  transform: rotate(180deg);
}

.action-btn svg {
  width: 50%;
  height: 50%;
}

.wide-card {
  max-width: 800px;
  padding: var(--spacing-xl);
  min-height: 400px;
  font-size: 1.2rem;
}

.wide-card .poem-text {
  font-size: 1.3rem;
  line-height: 1.8;
}

.wide-card .poem-author {
  font-size: 1.1rem;
}

/* Adjust action buttons for wide screens */
@media (min-width: 768px) {
  .action-buttons {
    bottom: -2.5rem;
  }
  
  .action-btn {
    width: 4.5rem;
    height: 4.5rem;
  }
}

/* Improve touch targets on iOS */
@supports (-webkit-touch-callout: none) {
  .action-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
