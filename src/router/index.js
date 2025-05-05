import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import TransactionHistoryView from '@/views/user/TransactionHistoryView.vue'
import CheckoutView from '@/views/user/CheckoutView.vue'
import NotFoundView from '@/views/error/NotFoundView.vue'
import ForbiddenView from '@/views/error/ForbiddenView.vue'
import { supabase } from '@/utils/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/transaction-history',
      name: 'transaction-history',
      component: TransactionHistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresAuth: true }
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data.session
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Save the intended destination for redirect after login
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }
  
  // Check if route requires guest access only
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  // Allow the navigation
  next()
})

export default router
