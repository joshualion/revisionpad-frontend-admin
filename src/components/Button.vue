<template>
  <button :type="type" :disabled="disabled || loading" :class="buttonClasses" @click="handleClick">
    <span v-if="loading" class="inline-flex items-center gap-2">
      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {{ loadingText }}
    </span>
    <span v-else-if="icon && !textOnly" class="inline-flex items-center gap-2">
      <component :is="icon" class="w-4 h-4" />
      <span v-if="hasSlot"><slot /></span>
      <span v-else>{{ label }}</span>
    </span>
    <span v-else>
      <slot v-if="hasSlot" />
      <span v-else>{{ label }}</span>
    </span>
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { useDark } from '@vueuse/core'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'danger', 'success', 'warning', 'outline', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: 'Loading...',
  },
  icon: {
    type: Object,
    default: null,
  },
  textOnly: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const slots = useSlots()
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const hasSlot = computed(() => slots.default)

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ]

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  // Variant classes
  const variantClasses = {
    primary: [
      isDark.value
        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus:ring-yellow-500'
        : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus:ring-yellow-500',
    ],
    secondary: [
      isDark.value
        ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 focus:ring-gray-500'
        : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ],
    danger: [
      isDark.value
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ],
    success: [
      isDark.value
        ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ],
    warning: [
      isDark.value
        ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
        : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    ],
    outline: [
      isDark.value
        ? 'border border-gray-600 text-gray-100 hover:bg-gray-700 focus:ring-gray-500'
        : 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ],
    ghost: [
      isDark.value
        ? 'text-gray-100 hover:bg-gray-700 focus:ring-gray-500'
        : 'text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ],
  }

  const classes = [...baseClasses, sizeClasses[props.size], ...variantClasses[props.variant]]

  if (props.fullWidth) {
    classes.push('w-full')
  }

  return classes.join(' ')
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
