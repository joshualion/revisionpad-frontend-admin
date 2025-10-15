<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { LogIn, UserCircle, ChevronDown } from 'lucide-vue-next'

// Simulated auth state (replace with actual auth logic)
const isLoggedIn = ref(false)
const userName = ref('Jane Doe')
</script>

<template>
  <header
    v-if="isMobile"
    class="flex items-center justify-between px-4 py-3 bg-[#f29c14] text-white shadow-md"
  >
    <!-- Logo -->
    <RouterLink to="/" class="text-xl font-extrabold tracking-wide logo-fancy-first-letter">
      <h2 class="flex items-center gap-1">
        <span class="text-[#1f2937] text-2xl">R</span><span>evision</span><span>Pad</span>
      </h2>
    </RouterLink>

    <!-- Right side (login or dropdown) -->
    <div class="relative">
      <!-- Not logged in -->
      <RouterLink
        v-if="!isLoggedIn"
        to="/login"
        class="p-2 rounded-full bg-white text-[#f29c14] hover:bg-orange-100 transition"
      >
        <LogIn class="w-6 h-6" />
      </RouterLink>

      <!-- Logged in -->
      <div v-else class="flex items-center gap-2 cursor-pointer group">
        <UserCircle class="w-6 h-6 text-white" />
        <ChevronDown class="w-4 h-4 text-white" />

        <!-- Dropdown -->
        <div
          class="absolute right-0 mt-10 w-40 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 transform scale-95 group-hover:scale-100"
        >
          <div class="px-4 py-2 text-sm font-medium border-b">{{ userName }}</div>
          <RouterLink to="/profile" class="block px-4 py-2 text-sm hover:bg-gray-100"
            >Profile</RouterLink
          >
          <RouterLink to="/logout" class="block px-4 py-2 text-sm hover:bg-gray-100"
            >Logout</RouterLink
          >
        </div>
      </div>
    </div>
  </header>
</template>
