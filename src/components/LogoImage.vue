<template>
  <div class="flex items-center justify-center">
    <img
      :src="logoSrc"
      alt="RevisionPad Logo"
      class="h-10 sm:h-12 md:h-14 object-contain drop-shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>


<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'

const isDark = useDark()

const logoSrc = computed(() =>
  isDark.value ? new URL('@/assets/logo-dark.png', import.meta.url).href : new URL('@/assets/logo.png', import.meta.url).href
)
</script>

<style scoped>
.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
