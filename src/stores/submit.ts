import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePoemStore } from './poems'
import type { NewPoem } from '../types/database'

export const useSubmitStore = defineStore('submit', () => {
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const submitPoem = async (poem: NewPoem) => {
    isSubmitting.value = true
    error.value = null
    
    try {
      const poemStore = usePoemStore()
      await poemStore.addPoem(poem)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit poem'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    error,
    submitPoem
  }
}) 