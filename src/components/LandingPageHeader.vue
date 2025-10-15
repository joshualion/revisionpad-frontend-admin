<template>
  <div class="w-full relative">
    <div class="max-w-screen-2xl mx-auto mb-1 relative">
      <!-- Desktop Header -->
      <DesktopHeader v-if="isDesktop || islargerScreen" />

      <!-- Mobile or Tablet Header -->
      <MobileHeader v-else-if="isMobile || isTablet" />
    </div>
  </div>
</template>


<script setup>
import { islargerScreen, isDesktop, isMobile, isTablet } from '@/composables/useScreen'
import DesktopHeader from './DesktopHeader.vue'
import MobileHeader from './MobileHeader.vue'
</script>

