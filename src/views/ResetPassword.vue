<template>
  <LandingPageHeader />
  <div
    class="min-h-screen flex items-center justify-center px-4"
    :class="isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'"
  >
    <div
      v-if="formVisible"
      class="max-w-xl mx-auto p-6 rounded-lg shadow-lg"
      :class="isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'"
    >
      <!-- Banner/Header -->
      <div class="mb-6 text-center bg-gray-700 p-6 rounded-lg">
        <h1 class="text-3xl font-extrabold mb-2 text-white">🔐 Reset Your Password</h1>
        <p class="text-sm text-gold">Secure your account. Get back on track.</p>
      </div>

      <!-- Reset Form -->
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Email -->
        <div class="relative">
          <Mail class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.email"
            type="email"
            readonly
            class="form form-control w-full pl-10 pr-3 py-2 cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-white opacity-75"
          />
        </div>

        <!-- New Password -->
        <div class="relative">
          <Lock class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="     New Password"
            class="form form-control w-full pl-10 pr-12"
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
          <LockKeyhole class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.password_confirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="     Confirm Password"
            class="form form-control w-full pl-10 pr-12"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn-secondary text-white w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          :disabled="loading"
        >
          <component
            :is="loading ? Loader : LockOpen"
            :class="{ 'animate-spin w-5 h-5': loading, 'w-5 h-5': !loading }"
          />
          <span>{{ loading ? 'Resetting...' : 'Reset Password' }}</span>
        </button>
      </form>
    </div>
  </div>
  <LandingPageFooter />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import { Mail, Lock, Loader, LockOpen, LockKeyhole, Eye, EyeOff } from 'lucide-vue-next'
import LandingPageHeader from '@/components/LandingPageHeader.vue'
import LandingPageFooter from '@/components/LandingPageFooter.vue'
import { useDark } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const formVisible = ref(false)

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const form = ref({
  token: '',
  email: '',
  password: '',
  password_confirmation: '',
})

onMounted(async () => {
  form.value.token = route.query.token || ''
  form.value.email = route.query.email || ''

  if (!form.value.token || !form.value.email) {
    toast.error('Invalid or expired password reset link')
    return setTimeout(() => router.replace('/'), 5000) // wait 3 seconds
  }

  try {
    await api.post('/auth/verify-password-reset-token', {
      token: form.value.token,
      email: form.value.email,
    })
    formVisible.value = true
  } catch (error) {
    toast.error(error.response?.data?.message || 'Reset token invalid or expired')
    return setTimeout(() => router.replace('/'), 5000) // wait 3 seconds
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submit = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/reset-password', form.value)
    toast.success(response.data.message || 'Password reset successful')
    return setTimeout(() => router.push('/login'), 3000) // wait 3 seconds
  } catch (error) {
    toast.error(error.response?.data?.message || 'Reset failed')
  } finally {
    loading.value = false
  }
}
</script>
