import { createClient } from '@supabase/supabase-js'
import { getAnonymousId } from './anonymousId'
import { config, validateConfig } from '../config/security'

// Validate configuration at startup
validateConfig()

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    global: {
      headers: {
        'x-anonymous-id': getAnonymousId()
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      timeout: 30000,
    }
  }
)

export async function checkConnection() {
  try {
    const { error } = await supabase.from('poems').select('id').limit(1)
    return !error
  } catch {
    return false
  }
} 