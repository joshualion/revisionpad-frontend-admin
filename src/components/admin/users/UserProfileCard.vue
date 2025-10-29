<template>
  <div
    class="rounded-lg border p-4 transition hover:shadow-md"
    :class="[
      isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
      clickable ? 'cursor-pointer' : '',
    ]"
    @click="handleClick"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="relative">
        <img
          :src="avatarUrl"
          :alt="user.name || user.email"
          class="w-12 h-12 rounded-full object-cover"
        />
        <!-- Online Status Indicator -->
        <div
          v-if="showOnlineStatus"
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900"
          :class="user.online ? 'bg-green-500' : 'bg-gray-400'"
        ></div>
      </div>

      <!-- User Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {{ displayName }}
          </h3>
          <RoleBadge :role="user.role" />
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
          {{ user.email }}
        </p>

        <div v-if="user.last_activity" class="text-xs text-gray-500 dark:text-gray-500">
          Last active: {{ formatLastActivity(user.last_activity) }}
        </div>
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex gap-2">
        <button
          @click.stop="handleView"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="View Details"
        >
          <Eye class="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          @click.stop="handleEdit"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Edit User"
        >
          <Edit class="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          @click.stop="handleDelete"
          class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition"
          title="Delete User"
        >
          <Trash2 class="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { Eye, Edit, Trash2 } from 'lucide-vue-next'
import RoleBadge from './RoleBadge.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  showOnlineStatus: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'view', 'edit', 'delete'])

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const displayName = computed(() => {
  if (props.user.name) return props.user.name
  const first = props.user.first_name || props.user.firstname
  const last = props.user.last_name || props.user.lastname
  const combined = [first, last].filter(Boolean).join(' ')
  return combined || props.user.username || props.user.email || 'Unknown User'
})

const avatarUrl = computed(() => {
  const photo = props.user.photo
  if (photo) {
    if (typeof photo === 'string' && photo.startsWith('http')) {
      return photo
    }
    const base = import.meta.env.VITE_BACKEND_URL || ''
    return `${base}/storage/${photo}`
  }

  // Fallback to UI Avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=FFD700&color=000`
})

const formatLastActivity = (timestamp) => {
  if (!timestamp) return 'Never'

  const now = new Date()
  const activity = new Date(timestamp)
  const diffMs = now - activity
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return activity.toLocaleDateString()
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.user)
  }
}

const handleView = () => {
  emit('view', props.user)
}

const handleEdit = () => {
  emit('edit', props.user)
}

const handleDelete = () => {
  emit('delete', props.user)
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
