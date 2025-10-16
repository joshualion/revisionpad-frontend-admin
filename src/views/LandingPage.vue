<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center relative"
    :class="isDark ? 'bg-gray-900' : 'bg-white'"
  >
    <!-- Login Card -->
    <div
      class="relative z-10 shadow-2xl rounded-2xl w-[90%] sm:w-[400px] p-8 border border-gray-200 dark:border-gray-700"
    >
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/">
          <h2
            class="text-4xl font-extrabold tracking-tight"
            :class="isDark ? 'text-gold' : 'text-gold'"
          >
            <span class="text-4xl">R</span>
            <span :class="isDark ? 'text-white' : 'text-gray-800'">evisionPad</span>
          </h2>
        </RouterLink>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label
            for="email"
            class="block text-sm font-semibold mb-1"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@revisionpad.com"
            required
            autocomplete="email"
            class="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-semibold mb-1"
            :class="isDark ? 'text-gray-300' : 'text-gray-700'"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"
          />

          <!-- forgot password link (always visible) -->
          <div class="mt-1 text-[0.75rem] text-right">
            <button
              type="button"
              class="text-gold hover:underline focus:outline-none"
              @click="showForgotModal = true"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          :disabled="loading"
        >
          <component
            :is="loading ? Loader : LogIn"
            class="w-5 h-5"
            :class="{ 'animate-spin': loading }"
          />
          <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
        </button>

        <p v-if="errorMessage" class="text-center text-sm mt-2 text-red-500 font-medium">
          {{ errorMessage }}
        </p>
      </form>

      <!-- Forgot Password Modal -->
      <ForgotPasswordModal :visible="showForgotModal" @close="showForgotModal = false" />

      <!-- Optional Dark Mode Toggle -->
      <div class="flex justify-center mt-6">
        <DarkModeToggle />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LogIn, Loader } from 'lucide-vue-next'
import { useDark } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import ForgotPasswordModal from '@/components/ForgotPasswordModal.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showForgotModal = ref(false)
// forgot password link is always visible on this page
const showForgotLink = ref(true)

const auth = useAuthStore()
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    // Store credentials first to maintain consistent flow
    await auth.loginUser(response.data.token, response.data.user)

    // Enforce admin-only access after login
    const role = response?.data?.user?.role || auth.user?.role
    if (role !== 'administrator') {
      auth.logout()
      toast.error('Access denied: Administrators only.', { autoClose: 2500 })
      return
    }

    toast.success('Welcome back, admin!', { autoClose: 2000 })
    // Redirect admins to dashboard
    window.location.href = '/admin/dashboard'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Invalid credentials. Try again.'
    toast.error(errorMessage.value, { autoClose: 2500 })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input::placeholder {
  color: #2f374bff;
}
</style>
