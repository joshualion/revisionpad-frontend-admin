import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import LandingPage from '../views/LandingPage.vue'
// Login route now reuses LandingPage
import VerifyEmailPage from '../views/VerifyEmailPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ChangePassword from '../views/ChangePassword.vue'
import ResetPassword from '../views/ResetPassword.vue'

// --- Admin Views ---
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminProfile from '../views/admin/AdminProfile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LandingPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LandingPage,
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
    meta: {
      requiresAuth: true,
      adminOnly: true,
    },
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
  // user profile page removed; admin profile remains

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
  {
    path: '/admin/profile',
    name: 'admin-profile',
    component: AdminProfile,
    meta: {
      requiresAuth: true,
      adminOnly: true,
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
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  try {
    if (!auth.user && auth.getToken()) {
      await auth.fetchMe()
    }
  } catch {}

  // Require auth
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'login' })
  }

  // Admin-only routes
  if (to.meta.adminOnly && !auth.isAdmin) {
    toast.error('Access denied: Administrators only.', { autoClose: 2500 })
    return next({ name: 'home' })
  }

  // If admin already logged in, avoid public pages
  const publicPages = new Set(['home', 'login', 'reset-password', 'verify-email'])
  if (auth.isAdmin && publicPages.has(to.name)) {
    return next({ name: 'admin-dashboard' })
  }

  next()
})

export default router
