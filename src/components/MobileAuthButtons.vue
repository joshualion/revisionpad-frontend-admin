<template>
  <div v-if="!auth.isLoggedIn" class="max-w-2xl mx-auto px-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <!-- Login Button -->
      <RouterLink to="/login" class="block w-full">
        <button
          class="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-md shadow transition"
        >
          <LogIn class="w-5 h-5" /> Login
        </button>
      </RouterLink>

      <!-- Signup Button -->
      <RouterLink to="/register" class="block w-full">
        <button
          class="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-md border border-yellow-400 shadow transition"
        >
          <UserPlus class="w-5 h-5" /> Signup
        </button>
      </RouterLink>

    </div>
  </div>
</template>


<script setup>
import { useAuthStore } from '@/stores/auth'
import { LogIn, UserPlus } from 'lucide-vue-next'

const auth = useAuthStore()
</script>
