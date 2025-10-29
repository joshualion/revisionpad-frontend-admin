<template>
  <span
    :class="badgeClasses"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
  >
    <component v-if="icon" :is="icon" class="w-3 h-3" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value),
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md'].includes(value),
  },
  icon: {
    type: Object,
    default: null,
  },
  rounded: {
    type: Boolean,
    default: true,
  },
})

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const badgeClasses = computed(() => {
  const baseClasses = []

  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  // Variant classes
  const variantClasses = {
    default: [isDark.value ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'],
    primary: [isDark.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'],
    secondary: [isDark.value ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-800'],
    success: [isDark.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'],
    warning: [isDark.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'],
    danger: [isDark.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'],
    info: [isDark.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'],
  }

  const classes = [...baseClasses, sizeClasses[props.size], ...variantClasses[props.variant]]

  if (!props.rounded) {
    classes.push('rounded')
  }

  return classes.join(' ')
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
