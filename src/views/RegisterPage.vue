<template>
  <div v-if="isMobile || isTablet" class="min-h-screen flex flex-col justify-between">
    <!-- Header -->
    <LandingHeader />
    <!-- Main -->
    <main class="flex flex-1 flex-col lg:flex-row items-center justify-center mt-0">
      <div
        class="p-6 rounded-lg shadow-lg max-w-4xl mx-auto card-shadow"
        :class="isDark ? 'bg-dark' : 'bg-white'"
      >
        <!-- Banner -->
        <div class="mb-4 text-center bg-[#1f2937] text-white p-4 rounded">
          <h1
            :class="isDark ? 'text-warning' : 'text-warning'"
            class="display-6 fw-bold text-toggle"
          >
            Let’s Get These Grades 🔥
          </h1>
          <p class="text-white small">Smarter revision. No stress. Just wins. Signup Now.</p>
        </div>
        <!-- Form -->
        <form @submit.prevent="handleRegister" class="form space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              class="form-control w-full px-3 py-2 border rounded"
              id="signup"
            />
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="form-control w-full px-3 py-2 border rounded"
            />

            <!-- Password -->
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                class="form-control w-full px-3 py-2 border rounded pr-10"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>

            <!-- Confirm Password -->
            <div class="relative">
              <input
                v-model="password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm Password"
                class="form-control w-full px-3 py-2 border rounded pr-10"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Bot Trap -->
          <input
            v-model="nickname"
            type="text"
            name="nickname"
            style="position: absolute; left: -9999px"
          />

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-secondary text-white px-4 py-2 w-full rounded font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            :disabled="loading"
          >
            <component
              :is="loading ? Loader : UserPlus"
              class="w-5 h-5"
              :class="{ 'animate-spin': loading }"
            />
            <span>{{ loading ? 'Registering...' : 'Create Account' }}</span>
          </button>
        </form>
      </div>
    </main>
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserPlus, Loader } from 'lucide-vue-next'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import { Eye, EyeOff } from 'lucide-vue-next'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import LandingHeader from '@/components/LandingPageHeader.vue'
import AppFooter from '@/components/LandingPageFooter.vue'
import { isMobile, isTablet } from '@/composables/useScreen'

const username = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const loading = ref(false)
const nickname = ref('')
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

async function handleRegister() {
  loading.value = true

  try {
    const response = await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      role: 'student',
      nickname: nickname.value, // send the honeypot field
    })

    console.log('Registration successful:', response.data)

    toast.success('Registration successful!', {
      autoClose: 2000,
    })

    const auth = useAuthStore()
    auth.loginUser(response.data.token, response.data.user)

    // Redirect to verification page
    router.push('/verify-email')
  } catch (error) {
    if (error.response?.status === 429) {
      toast.error('Too many attempts. Please wait and try again.', { autoClose: 4000 })
    } else if (error.response?.status === 403) {
      toast.error('Bot activity detected. Form blocked.', { autoClose: 4000 })
    } else {
      toast.error('Registration failed: ' + (error.response?.data?.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

body {
  background-color: #ffffff;
}
</style>
