// src/composables/useTheme.js
import { useDark, useToggle } from '@vueuse/core'

export const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'revisionpad-dark-mode', // ✅ persist mode
})

export const toggleDark = useToggle(isDark)