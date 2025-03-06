import { App } from '@capacitor/app'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useBackButton() {
  const router = useRouter()
  const lastBackPress = ref(0)
  
  const handleBackButton = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch {} // Ignore errors in browser

    if (router.currentRoute.value.path !== '/') {
      router.back()
    } else {
      const now = Date.now()
      if (now - lastBackPress.value < 500) {
        await App.exitApp()
      } else {
        lastBackPress.value = now
        // Could add a toast here: "Press back again to exit"
      }
    }
  }

  onMounted(() => {
    App.addListener('backButton', handleBackButton)
  })

  onUnmounted(() => {
    App.removeAllListeners()
  })
} 