export function handleError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error)
  
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return `An error occurred in ${context}`
}

export function logEvent(event: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.log(`[Event] ${event}`, data || '')
  }
} 