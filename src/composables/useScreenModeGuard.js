// /composables/useScreenModeGuard.js
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useScreenModeGuard(restricted = false) {
  const router = useRouter()

  function checkMode() {
    const isMobile = window.innerWidth <= 768
    if (restricted && !isMobile) {
      // User switched to desktop mode on a restricted screen
      router.replace({ name: 'home' }) // Or route path: '/'
    }
  }

  onMounted(() => {
    checkMode()
    window.addEventListener('resize', checkMode)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMode)
  })
}
