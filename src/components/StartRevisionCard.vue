<template>
  <transition name="fade-slide" mode="out-in">
    <div
      v-if="visible"
      class="p-6 mt-6 rounded-2xl shadow-lg text-center mx-auto w-full max-w-xl"
      :class="isDark ? 'bg-dark' : 'bg-white'"
    >
      <!-- Header Section -->
      <div
        class="py-8 px-20 rounded-md space-y-2"
        :class="isDark ? 'bg-[#1f2937] text-white' : 'bg-[#444] text-white'"
      >
        <h1
          class="text-2xl font-bold drop-shadow"
          :class="isDark ? 'text-yellow-600' : 'text-yellow-500'"
        >
          Welcome back, {{ username }}
        </h1>
        <p class="text-xl md:text-2xl font-bold text-white">Let’s Get These Grades 🔥</p>
      </div>

      <!-- Start Button -->
      <div class="mt-8">
        <RouterLink
          to="/revision"
          class="inline-flex items-center justify-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg shadow transition-all text-lg md:text-xl"
        >
          <Play class="w-6 h-6" /> Start Revision
        </RouterLink>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { Play } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
})

const username = auth.user?.username || 'Student'
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
