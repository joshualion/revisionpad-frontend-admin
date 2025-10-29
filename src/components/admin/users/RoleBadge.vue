<template>
  <Badge :label="roleLabel" :variant="roleVariant" size="xs" />
</template>

<script setup>
import { computed } from 'vue'
import Badge from '@/components/Badge.vue'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const roleLabel = computed(() => {
  switch (props.role?.toLowerCase()) {
    case 'student':
      return 'Student'
    case 'administrator':
      return 'Administrator'
    case 'examiner':
      return 'Examiner'
    default:
      return props.role || 'Unknown'
  }
})

const roleVariant = computed(() => {
  switch (props.role?.toLowerCase()) {
    case 'student':
      return 'primary'
    case 'administrator':
      return 'danger'
    case 'examiner':
      return 'success'
    default:
      return 'default'
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
