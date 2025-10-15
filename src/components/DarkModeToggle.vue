<template>
  <label class="relative inline-block w-16 h-9 rounded-full border border-yellow-300 transition-shadow animate-pulse shadow-[0_0_10px_#f29c14]">
    <input
      type="checkbox"
      class="sr-only peer"
      :checked="isDark"
      @change="toggleDark()"
    />
    <!-- Switch Slider -->
    <span
      class="absolute inset-0 flex items-center justify-center bg-transparent transition duration-300 rounded-full peer-checked:bg-transparent"
    >
      <!-- Icons -->
      <Sun v-if="!isDark" size="20" class="text-yellow-500 transition duration-300 rotate-0" />
      <Moon v-else size="20" class="text-yellow-100 transition duration-300 rotate-180" />
    </span>

    <!-- Moving Circle -->
    <span
      class="absolute left-1 top-1 h-7 w-7 rounded-full bg-transparent transition-transform duration-300 peer-checked:translate-x-7"
    ></span>
  </label>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const toggleDark = useToggle(isDark)
</script>

<style>
body {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  transition: background-color 0.3s, color 0.3s;
}
body.dark {
  --bs-body-bg: #111827;
  --bs-body-color: #f8f9fa;
  --bs-primary: #f59e0b;
  --bs-btn-bg: #f59e0b;
  --bs-btn-border-color: #f59e0b;
}
</style>
