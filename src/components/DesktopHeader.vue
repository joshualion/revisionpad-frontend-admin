<template>
  <div class="w-full relative header-glass">
    <!-- Full-Width Header -->
    <header
      v-if="isDesktop || islargerScreen"
      class="w-full flex flex-col glow sm:flex-row justify-between items-center gap-2 px-4 py-2 text-white"
    >
      <h2
        :class="[
          isDark ? 'logo-content-white' : 'logo-content-dark',
          'logo-fancy-first-letter text-2xl sm:text-3xl text-center sm:text-left px-2 mb-0',
        ]"
      >
        <RouterLink to="/">
          <span class="text-4xl">R</span><span>evision</span><span>Pad</span>
        </RouterLink>
      </h2>



      <DarkMode class="hidden sm:block" />
    </header>
  </div>
</template>

<script setup>
import { islargerScreen, isDesktop } from '@/composables/useScreen'
import DarkMode from '@/components/DarkModeToggle.vue'
import { useDark } from '@vueuse/core'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})
</script>

<style scoped>
.logo-content-dark {
  font-size: 6vmin;
  font-family: 'Sen', sans-serif;
  font-weight: 900;
  color: #374151;
  border-radius: 100%;
  animation-name: bounce-7;
  animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
  animation-duration: 2s;
}

.logo-content-white {
  font-size: 6vmin;
  font-family: 'Sen', sans-serif;
  font-weight: 900;
  color: #fdecb9;
  border-radius: 100%;
  animation-name: bounce-7;
  animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
  animation-duration: 2s;
}

.logo-fancy-first-letter::first-letter {
  color: #f29c14;
  font-size: 1.5em;
  font-weight: 900;
  font-family: 'Playfair Display', serif, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes bounce-7 {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

a {
  text-decoration: none;
  color: inherit;
}

.header-glass {
  width: 100% !important;
  background-color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: all 0.3s ease;
}

.dark .header-glass {
  background-color: #111827;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.05);
}
</style>
