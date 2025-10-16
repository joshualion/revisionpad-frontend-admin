<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click.self="close"
      :class="isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <!-- Close Button -->
        <button class="absolute top-2 right-2 text-gray-500 hover:text-red-500" @click="close">
          ✕
        </button>

        <h2 class="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
          Forgot Password
        </h2>

        <form @submit.prevent="submit">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full text-gray-900 px-3 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            type="submit"
            class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Sending reset link...' : 'Send Reset Link' }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/http/api'
import { toast } from 'vue3-toastify'

import { useDark } from '@vueuse/core'
const isDarkMode = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
})

defineProps({
  visible: Boolean,
})

const emit = defineEmits(['close'])

const email = ref('')
const loading = ref(false)

const close = () => {
  email.value = ''
  emit('close')
}

const submit = async () => {
  if (!email.value || email.value.trim() === '') {
    toast.error('Please enter a valid email')
    return
  }

  loading.value = true
  try {
    const response = await api.post('/auth/forgot-password', { email: email.value })
    toast.success(response.data.message || 'Reset link sent! Check your email.')
    close()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* You can skip this if you're using Tailwind or utility classes above already */
</style>
