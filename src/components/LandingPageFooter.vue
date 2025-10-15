<template>
  <footer class="text-center text-sm py-4   footer glow" :class="isDark ? 'text-white' : 'text-dark'">
    &copy; {{ new Date().getFullYear() }} RevisionPad. All rights reserved.
  </footer>
</template>

<script setup>
import { useDark } from '@vueuse/core'
import { watch } from 'vue'
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
})
watch(isDark, (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
})
</script>

<style scoped>
  footer {
   border-top: 1px solid aliceblue;
  }

  footer a {
    color: #f59e0b;
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
  }
  footer p {
    margin: 0;
    font-size: 0.875rem;
  }

  .card-shadow {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}
  </style>


