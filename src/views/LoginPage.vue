<template>
  <div v-if="isMobile || isTablet" class="min-vh-100 d-flex flex-column justify-content-between">
    <!-- Header -->
    <LandingHeader />

    <!-- Main -->
    <main class="d-flex flex-column flex-grow-1 justify-content-center align-items-center">
      <div class="p-3 rounded shadow-lg w-100 mx-auto" style="max-width: 1140px;">
        <!-- Banner -->
        <div class="mb-4 text-center bg-dark py-5 px-4 rounded">
          <h3 class="display-5 fw-bold text-white gradient-text drop-shadow">
            Signin
          </h3>
        </div>

        <!-- 🔐 Conditional Auth Block -->
        <div v-if="!auth.isLoggedIn" class="ms-auto">
          <form @submit.prevent="handleLogin" class="d-flex flex-column gap-3">
            <div class="d-flex flex-column flex-md-row gap-3">
              <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="form-control"
              />
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="form-control"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-dark d-inline-flex align-items-center gap-2 fw-semibold"
              :disabled="loading"
            >
              <component
                :is="loading ? Loader : LogIn"
                class="icon-sm"
                :class="{ 'spinner-border spinner-border-sm': loading }"
              />
              <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
            </button>
          </form>
        </div>

        <!-- ✅ Logged In Section -->
        <div v-else class="text-center">
          <RouterLink
            to="/revision"
            class="btn btn-warning d-inline-flex align-items-center gap-2 fw-semibold shadow-sm"
          >
            <Play class="icon-sm" /> Start Revision
          </RouterLink>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import LandingHeader from '@/components/LandingPageHeader.vue'
import AppFooter from '@/components/LandingPageFooter.vue'
import { isMobile, isTablet } from '@/composables/useScreen'
import { LogIn, Loader, Play } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import api from '@/http/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function checkMode() {
  if (!isMobile.value && !isTablet.value) {
    toast.warn('Switched to desktop mode — redirecting to home.', { autoClose: 3000 })
    router.replace({ name: 'home' })
  }
}

onMounted(() => {
  checkMode()
  window.addEventListener('resize', checkMode)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMode)
})

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
    auth.loginUser(response.data.token, response.data.user)
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message)
    toast.error('Login failed: ' + (error.response?.data?.message || 'Invalid credentials'), {
      autoClose: 3000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style>
.gradient-text {
  background: linear-gradient(to right, #facc15, #eab308, #ca8a04);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.drop-shadow {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
