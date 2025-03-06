<template>
  <ViewLayout :title="TRANSLATIONS.SUBMIT.TITLE">
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="poem-text">{{ TRANSLATIONS.POEM.YOUR_POEM }}</label>
          <textarea 
            id="poem-text"
            v-model="poemText"
            :placeholder="TRANSLATIONS.SUBMIT.PLACEHOLDER"
            rows="8"
            :class="{ error: errors.poemText }"
            @blur="handleBlur('poemText')"
          ></textarea>
          <span v-if="errors.poemText" class="error-text">
            {{ errors.poemText }}
          </span>
        </div>
        <div class="form-group">
          <label for="author">{{ TRANSLATIONS.POEM.AUTHOR }}</label>
          <input 
            id="author"
            type="text"
            v-model="author"
            :placeholder="TRANSLATIONS.SUBMIT.AUTHOR_PLACEHOLDER"
            @blur="handleBlur('author')"
          >
        </div>
        <p v-if="submitStore.error" class="error-text center">
          {{ submitStore.error }}
        </p>
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="submitStore.isSubmitting || !isValid"
          :class="{ loading: submitStore.isSubmitting }"
        >
          {{ submitStore.isSubmitting ? TRANSLATIONS.SUBMIT.SUBMITTING : TRANSLATIONS.SUBMIT.SUBMIT }}
        </button>
      </form>
    </div>
  </ViewLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSubmitStore } from '../stores/submit'
import { useRouter } from 'vue-router'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { TRANSLATIONS } from '../config/translations'
import ViewLayout from '../components/layout/ViewLayout.vue'

const poemText = ref('')
const author = ref('')
const touched = ref({ poemText: false, author: false })
const submitStore = useSubmitStore()
const router = useRouter()
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

// Validation
const errors = computed(() => ({
  poemText: touched.value.poemText && poemText.value.trim().length < 10 
    ? 'Poem must be at least 10 characters long' 
    : null,
}))

const isValid = computed(() => 
  poemText.value.trim().length >= 10
)

const handleBlur = (field: 'poemText' | 'author') => {
  touched.value[field] = true
}

const handleSubmit = async () => {
  touched.value = { poemText: true, author: true }
  
  if (!isValid.value) {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch {} // Ignore browser errors
    return
  }

  if (submitStore.isSubmitting) {
    return
  }

  const success = await submitStore.submitPoem({
    text: poemText.value.trim(),
    author: author.value.trim() || undefined
  })

  if (success) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {}
    poemText.value = ''
    author.value = ''
    touched.value = { poemText: false, author: false }
    console.log('Navigating to home')
    await router.replace('/')
    console.log('Navigation complete')
  }
}
</script>

<style scoped>
.form-container {
  padding: var(--spacing-md) var(--spacing-md);
  width: 100%;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

textarea, input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #333;
  resize: vertical;
  box-sizing: border-box;
  max-width: 100%;
}

.submit-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  max-width: 100%;
}

.submit-btn:active {
  transform: scale(0.98);
  background: var(--color-primary-dark);
}

.error {
  border-color: #ff4444 !important;
}

.error-text {
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.center {
  text-align: center;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn.loading {
  background: var(--color-primary-dark);
}

textarea:focus, input:focus {
  outline: none;
  border-color: #00dc7d;
}

.wide-layout {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.wide-layout .app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.wide-layout .app-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  font-family: var(--font-title);
}

.wide-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
}

.form-preview {
  padding: 1rem;
}

.form-preview h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
  font-family: var(--font-title);
}

.preview-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.preview-text {
  flex: 1;
  white-space: pre-wrap;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text);
  font-family: var(--font-text);
}

.preview-author {
  text-align: right;
  font-style: italic;
  color: #666;
  font-size: 0.95rem;
  font-family: var(--font-text);
}

.empty-preview {
  background: #f9f9f9;
  border-radius: 16px;
  padding: 2rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  text-align: center;
  border: 1px dashed #ddd;
}

@media (min-width: 1400px) {
  .wide-layout {
    max-width: 900px;
  }
}

/* Add responsive adjustments for smaller screens */
@media (max-width: 480px) {
  .form-container {
    padding: var(--spacing-sm) var(--spacing-sm);
  }
  
  textarea, input {
    padding: var(--spacing-sm);
  }
  
  .submit-btn {
    padding: var(--spacing-sm);
  }
}

/* Add more padding on larger screens */
@media (min-width: 768px) {
  .form-container {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}
</style> 