import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import type { DbPoem, NewPoem } from '../types/database'
import { getAnonymousId } from '../lib/anonymousId'
import { handleError, logEvent } from '../lib/errorHandling'

interface State {
  poems: DbPoem[]
  currentIndex: number
  favorites: string[]
  isLoading: boolean
  error: string | null
}

export const usePoemStore = defineStore('poems', {
  state: (): State => ({
    poems: [],
    currentIndex: 0,
    favorites: [],
    isLoading: false,
    error: null
  }),

  getters: {
    currentPoem: (state) => state.poems[state.currentIndex] || null,
    isFavorited: (state) => (poemId: string) => state.favorites.includes(poemId),
    favoritedPoems: (state) => state.poems.filter(poem => state.favorites.includes(poem.id))
  },

  actions: {
    async fetchPoems() {
      this.isLoading = true
      this.error = null
      
      try {
        logEvent('fetchPoems:start')
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        this.poems = data
        logEvent('fetchPoems:success', { count: data.length })
        await this.fetchFavorites()
      } catch (err) {
        this.error = handleError(err, 'fetchPoems')
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async addPoem(poem: NewPoem) {
      this.isLoading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('poems')
          .insert([{
            text: poem.text,
            author: poem.author || 'Anonymous'
          }])
          .select()
          .single()

        if (error) throw error

        // Add to beginning of list
        this.poems = [data, ...this.poems]
        this.currentIndex = 0
        
        return data
      } catch (err) {
        console.error('Error adding poem:', err)
        this.error = 'Failed to add poem'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async toggleFavorite(poemId: string) {
      logEvent('toggleFavorite:start', { poemId })
      const isFavorited = this.favorites.includes(poemId)
      
      try {
        const anonymousId = getAnonymousId()
        
        if (isFavorited) {
          // Remove favorite
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('poem_id', poemId)
            .eq('anonymous_id', anonymousId)

          if (error) {
            throw error
          }
          
          this.favorites = this.favorites.filter(id => id !== poemId)
          logEvent('toggleFavorite:removed', { poemId })
        } else {
          // Add favorite
          const { error } = await supabase
            .from('favorites')
            .insert([{ 
              poem_id: poemId,
              anonymous_id: anonymousId 
            }])

          if (error) {
            throw error
          }
          
          this.favorites.push(poemId)
          logEvent('toggleFavorite:added', { poemId })
        }
      } catch (err) {
        this.error = handleError(err, 'toggleFavorite')
        await this.fetchFavorites()
        throw err
      }
    },

    async fetchFavorites() {
      logEvent('fetchFavorites:start')
      try {
        const anonymousId = getAnonymousId()
        const { data, error } = await supabase
          .from('favorites')
          .select('poem_id')
          .eq('anonymous_id', anonymousId)

        if (error) {
          throw error
        }

        this.favorites = data.map(fav => fav.poem_id)
        logEvent('fetchFavorites:success', { count: this.favorites.length })
      } catch (err) {
        this.error = handleError(err, 'fetchFavorites')
        throw err
      }
    },

    nextPoem() {
      this.currentIndex = (this.currentIndex + 1) % this.poems.length
    },

    previousPoem() {
      this.currentIndex = this.currentIndex === 0 
        ? this.poems.length - 1 
        : this.currentIndex - 1
    }
  }
})