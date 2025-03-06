import { ref, computed, type Ref, onMounted, onUnmounted } from 'vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export interface SwipeHandlers {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSwipeUp: () => void
}

export function useSwipe(element: Ref<HTMLElement | null>, handlers: SwipeHandlers) {
  const position = ref({ x: 0, y: 0 })
  const rotation = ref(0)
  const isDragging = ref(false)
  const startPos = ref({ x: 0, y: 0 })

  const handleSwipe = (deltaX: number, deltaY: number) => {
    const threshold = window.innerWidth * 0.15
    
    if (Math.abs(deltaX) > threshold) {
      position.value = { x: deltaX > 0 ? window.innerWidth : -window.innerWidth, y: 0 }
      rotation.value = deltaX > 0 ? 15 : -15
      try {
        Haptics.impact({ style: ImpactStyle.Medium })
      } catch (err) {
        // Ignore errors in browser
      }
      setTimeout(() => {
        position.value = { x: 0, y: 0 }
        rotation.value = 0
        if (deltaX > 0) {
          handlers.onSwipeRight()
        } else {
          handlers.onSwipeLeft()
        }
      }, 300)
    } else if (deltaY < -threshold) {
      position.value = { x: 0, y: -window.innerHeight * 0.8 }
      try {
        Haptics.impact({ style: ImpactStyle.Light })
      } catch (err) {
        // Ignore errors in browser
      }
      setTimeout(() => {
        position.value = { x: 0, y: 0 }
        rotation.value = 0
        handlers.onSwipeUp()
      }, 300)
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

  onMounted(() => {
    const el = element.value
    if (el) {
      el.addEventListener('touchstart', onTouchStart, { passive: false })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd, { passive: false })
    }
  })

  onUnmounted(() => {
    const el = element.value
    if (el) {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  })

  return {
    style: computed(() => ({
      transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0) rotate(${rotation.value}deg)`,
      transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.2, 1, 0.3, 1)'
    }))
  }
} 