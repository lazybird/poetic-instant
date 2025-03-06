import { APP_CONSTANTS } from '../config/constants'

function generateUUID(): string {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback to Math.random (less secure, but better than nothing)
  console.warn('crypto.randomUUID not available, using fallback')
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getAnonymousId(): string {
  let id = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ANONYMOUS_ID)
  
  if (!id) {
    id = generateUUID()
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ANONYMOUS_ID, id)
  }
  
  return id
} 