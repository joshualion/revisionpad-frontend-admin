<template>
  <div class="relative">
    <div class="max-w-[90rem] mx-auto px-1 relative">
      <!-- Desktop Header -->
      <header
        v-if="isDesktop || islargerScreen"
        class="w-full flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-1 text-white dark:text-white"
      >
        <h2
          :class="isDark ? 'logo-content-white' : 'logo-content-dark'"
          class="logo-fancy-first-letter text-2xl sm:text-3xl text-center sm:text-left"
        >
          <RouterLink to="/">
            <span class="text-4xl">R</span><span>evision</span><span>Pad</span>
          </RouterLink>
        </h2>
        <DarkMode />

        <div v-if="!auth.isLoggedIn">
          <LoginForm />
        </div>

        <div v-else class="flex justify-end sm:justify-between items-center gap-2 w-full sm:w-auto">
          <NavBarProfile />
        </div>
      </header>

      <!-- Mobile or Tablet Header -->
      <header
        v-if="isMobile || isTablet"
        class="w-full flex flex-col sm:flex-row items-center justify-between gap-1 px-1 py-1 text-[#1f2937]"
      >
        <div class="w-full flex justify-between items-center">
          <h2 class="text-4xl sm:text-3xl text-center font-bold text-gold mx-auto">
            <RouterLink to="/">
              <span class="text-6xl">R</span><span>evision</span><span>Pad</span>
            </RouterLink>
          </h2>
          <DarkMode />

          <div v-if="auth.isLoggedIn" class="ml-auto">
            <NavBarProfile />
          </div>
        </div>
      </header>
    </div>

    <hr class="border-t-2 border-[#f29c14] opacity-80" />
  </div>
</template>

<script setup>
import LoginForm from './LoginForm.vue'
import { islargerScreen, isDesktop, isMobile, isTablet } from '@/composables/useScreen'
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
.text-gold {
  color: #f29c14;
}
</style>
