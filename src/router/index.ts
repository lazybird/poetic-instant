import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import SubmitView from '../views/SubmitView.vue'
import { APP_CONSTANTS } from '../config/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes: [
    {
      path: APP_CONSTANTS.ROUTES.HOME,
      name: 'home',
      component: HomeView
    },
    {
      path: APP_CONSTANTS.ROUTES.FAVORITES,
      name: 'favorites',
      component: FavoritesView
    },
    {
      path: APP_CONSTANTS.ROUTES.SUBMIT,
      name: 'submit',
      component: SubmitView
    }
  ]
})

export default router