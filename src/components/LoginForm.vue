<template>
  <form @submit.prevent="handleLogin" class="flex flex-wrap gap-2 justify-end items-center">
    <div>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full px-3 py-2 form form-control transition"
      />
    </div>
    <div>
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full px-3 py-2 form form-control transition"
      />
    </div>
    <button
      type="submit"
      class="btn btn-secondary flex items-center gap-2 px-4 py-2 rounded  text-white font-semibold disabled:opacity-50 hover:bg-gray-800 transition"
      :disabled="loading"
    >
      <component
        :is="loading ? Loader : LogIn"
        class="mr-2"
        :class="{ 'animate-spin': loading }"
      />
      <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
    </button>
  </form>
</template>


<script setup>
import { ref } from 'vue'
import { LogIn, Loader } from 'lucide-vue-next'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'

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

    const auth = useAuthStore()
    await auth.loginUser(response.data.token, response.data.user)

    toast.success('Welcome back!', { autoClose: 2000 })

    //router.push('/dashboard')
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

<style scoped>
.bg-gold {
  background-color: #d4af37;
}
</style>
