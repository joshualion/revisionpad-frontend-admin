// src/composables/useScreen.js
import { useBreakpoints } from '@vueuse/core'
import { computed } from 'vue'

const breakpoints = useBreakpoints({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1366,
})

export const isMobile = computed(() => breakpoints.smaller('md').value)
export const isTablet = computed(() => breakpoints.between('md', 'lg').value)
export const isDesktop = computed(() => breakpoints.between('lg','xxl').value)
export const islargerScreen = computed(() => breakpoints.greater('xl').value)
