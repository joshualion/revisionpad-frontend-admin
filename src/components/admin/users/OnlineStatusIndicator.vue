<template>
  <div class="inline-flex items-center gap-2" :title="tooltipText">
    <div class="w-2 h-2 rounded-full" :class="statusClass"></div>
    <span v-if="showLabel" class="text-xs text-gray-600 dark:text-gray-400">
      {{ statusText }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  online: {
    type: Boolean,
    default: false,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  lastActivity: {
    type: String,
    default: null,
  },
})

const statusClass = computed(() => {
  return props.online ? 'bg-green-500' : 'bg-gray-400'
})

const statusText = computed(() => {
  return props.online ? 'Online' : 'Offline'
})

const tooltipText = computed(() => {
  if (props.online) {
    return 'Currently online'
  }

  if (props.lastActivity) {
    const activity = new Date(props.lastActivity)
    return `Last seen: ${activity.toLocaleString()}`
  }

  return 'Offline'
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
