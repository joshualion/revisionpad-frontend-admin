<template>
  <div class="relative w-full header-glass">
    <div class="max-w-[90rem] mx-auto mb-1 relative">
      <!-- Mobile or Tablet Header -->
      <header
        v-if="isMobile || isTablet"
        class="w-full flex flex-col sm:flex-row items-center justify-between gap-1 px-1 py-1 text-[#1f2937]"
      >
        <div class="w-full flex justify-between items-center">
          <h2
            :class="isDark ? 'logo-content-white' : 'logo-content-dark'"
            class="logo-fancy-first-letter text-2xl sm:text-3xl text-center sm:text-left px-2"
          >
            <RouterLink to="/">
              <span class="text-4xl">R</span><span>evision</span><span>Pad</span>
            </RouterLink>
          </h2>

          <div v-if="auth.isLoggedIn" class="ml-auto">
            <NavBarProfile />
          </div>

          <DarkMode />
        </div>
      </header>
    </div>
  </div>
</template>

<script setup>
import { isMobile, isTablet } from '@/composables/useScreen'
import { useAuthStore } from '@/stores/auth'
import NavBarProfile from '@/components/NavBarProfile.vue'
import DarkMode from '@/components/DarkModeToggle.vue'
import { useDark } from '@vueuse/core'
const auth = useAuthStore()

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
  /* text-shadow:
      0 0 5px rgba(46, 36, 8, 0.5),
      0 0 10px rgba(68, 52, 3, 0.4),
      0 0 15px rgba(117, 88, 1, 0.3); */
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
  /* text-shadow:
      0 0 5px rgba(209, 185, 117, 0.5),
      0 0 10px rgba(238, 188, 37, 0.4),
      0 0 15px rgba(252, 198, 39, 0.3); */
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
