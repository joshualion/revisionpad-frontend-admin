<template>
  <div
    :class="[
      isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900',
      'mx-auto p-6 rounded-lg shadow-lg',
    ]"
    style="max-width: 960px"
  >
    <!-- Banner -->
    <div class="mb-6 text-center bg-gray-700 p-6 rounded-lg">
      <h1 class="text-3xl font-extrabold mb-2 text-white">Let’s Get These Grades 🔥</h1>
      <p class="text-sm  text-yellow-500">Smarter revision. No stress. Just wins. Signup Now.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          v-model="username"
          type="text"
          placeholder="Username"
          id="signup"
          class="form form-control w-full"
        />
        <input v-model="email" type="email" placeholder="Email" class="form form-control w-full" />

        <!-- Password -->
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="form form-control w-full pr-12"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
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
            class="form form-control w-full pr-12"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
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
        class="absolute left-[-9999px] opacity-0 pointer-events-none"
      />

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-secondary text-white min-w-full flex items-center justify-center gap-1 py-3 disabled:opacity-50"
        :disabled="loading"
      >
        <component
          :is="loading ? Loader : UserPlus"
          :class="{ 'animate-spin w-5 h-5': loading, 'w-5 h-5': !loading }"
        />
        <span>{{ loading ? 'Registering...' : 'Create Account' }}</span>
      </button>
    </form>
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
import { useDark } from '@vueuse/core'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

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
.Eye,
.EyeOff {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}
.bg-gold {
  background-color: #f29c14;
}

.card-shadow {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

body {
  background-color: #ffffff;
}
</style>
