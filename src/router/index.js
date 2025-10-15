import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LandingPage from '../views/LandingPage.vue'
import LoginPage from '../views/LoginPage.vue'
import VerifyEmailPage from '../views/VerifyEmailPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ChangePassword from '../views/ChangePassword.vue'
import ResetPassword from '../views/ResetPassword.vue'

// --- Admin Views ---
import AdminDashboard from '../views/admin/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
  path: '/reset-password',
  name: 'reset-password',
  component: ResetPassword,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
  },

   {
    path: '/change/password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true },
  },

  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: {
      requiresAuth: true,
    },
  },

   // 🧱 Admin Section
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      adminOnly: true, // <-- custom flag
    },
  },

   // 🕳 Catch-all for 404s (optional)
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ✅ Navigation Guard: Protects pages with meta.requiresAuth
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
