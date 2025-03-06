import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(options: {
  onRefresh: () => Promise<void>
  threshold?: number // Distance needed to trigger refresh
  maxPull?: number  // Maximum pull distance
}) {
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  let startY = 0
  let currentY = 0

  const handleTouchStart = (e: TouchEvent) => {
    // Only enable pull when at top of scroll
    if (window.scrollY !== 0) return
    startY = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!startY) return
    
    currentY = e.touches[0].clientY
    const delta = currentY - startY

    // Only allow pulling down
    if (delta > 0) {
      e.preventDefault()
      // Apply resistance to make pull feel natural
      pullDistance.value = Math.min(
        options.maxPull || 150,
        delta * 0.5
      )
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance.value > (options.threshold || 100)) {
      isRefreshing.value = true
      await options.onRefresh()
      isRefreshing.value = false
    }
    
    pullDistance.value = 0
    startY = 0
    currentY = 0
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isRefreshing,
    pullDistance
  }
} 