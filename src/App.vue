<template>
  <div v-if="isMobile || isTablet" class="container mx-auto px-4">
    <RouterView />
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup>
import { isMobile, isTablet } from './composables/useScreen'
// No auth stage redirect logic anymore
</script>
