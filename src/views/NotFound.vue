<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center relative"
    :class="isDark ? 'bg-dark' : 'bg-light'"
  >
    <div class="text-center">
      <h1 class="text-6xl font-bold mb-4">404</h1>
      <p class="text-xl mb-8">Page Not Found</p>
      <router-link
        to="/"
        class="px-6 py-3 bg-primary text-white rounded hover:bg-primary-dark transition"
      >
        Go to Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useDark } from '@vueuse/core'
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})
</script>
