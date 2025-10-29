<template>
  <Modal :visible="visible" title="User Details" size="xl" @close="$emit('close')">
    <div v-if="user" class="space-y-6">
      <!-- User Header -->
      <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <img :src="avatarUrl" :alt="displayName" class="w-16 h-16 rounded-full object-cover" />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ displayName }}
            </h2>
            <RoleBadge :role="user.role" />
            <OnlineStatusIndicator :online="user.online" :last-activity="user.last_activity" />
          </div>
          <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            Created: {{ formatDate(user.created_at) }}
          </p>
        </div>
      </div>

      <!-- Basic Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="user.first_name || user.firstname">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.first_name || user.firstname }}</p>
          </div>
          <div v-if="user.last_name || user.lastname">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.last_name || user.lastname }}</p>
          </div>
          <div v-if="user.phone">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.phone }}</p>
          </div>
          <div v-if="user.gender">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
            <p class="text-gray-900 dark:text-gray-100 capitalize">{{ user.gender }}</p>
          </div>
          <div v-if="user.date_of_birth">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
            <p class="text-gray-900 dark:text-gray-100">{{ formatDate(user.date_of_birth) }}</p>
          </div>
        </div>
      </div>

      <!-- Location Information -->
      <div v-if="hasLocationInfo" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Location</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-if="location.country">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
            <p class="text-gray-900 dark:text-gray-100">{{ location.country }}</p>
          </div>
          <div v-if="location.state">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">State/Province</label>
            <p class="text-gray-900 dark:text-gray-100">{{ location.state }}</p>
          </div>
          <div v-if="location.city">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <p class="text-gray-900 dark:text-gray-100">{{ location.city }}</p>
          </div>
        </div>
      </div>

      <!-- Role-specific Information -->
      <div v-if="userRole === 'administrator' && user.access_level" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Administrator Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Access Level</label>
            <p class="text-gray-900 dark:text-gray-100 capitalize">{{ user.access_level.replace('_', ' ') }}</p>
          </div>
        </div>
      </div>

      <div v-if="userRole === 'examiner'" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Examiner Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="user.access_level">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Access Level</label>
            <p class="text-gray-900 dark:text-gray-100 capitalize">{{ user.access_level.replace('_', ' ') }}</p>
          </div>
          <div v-if="user.occupation">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupation</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.occupation }}</p>
          </div>
          <div v-if="user.area_of_expertise">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Area of Expertise</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.area_of_expertise }}</p>
          </div>
          <div v-if="user.institution_affiliation">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution Affiliation</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user.institution_affiliation }}</p>
          </div>
        </div>
        <div v-if="user.bio">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{{ user.bio }}</p>
        </div>
      </div>

      <!-- Exam Information (for students) -->
      <div v-if="userRole === 'student'" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Exam Preferences</h3>
        <div class="space-y-3">
          <div v-if="user.exam_categories && user.exam_categories.length">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam Categories</label>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="category in user.exam_categories"
                :key="category.id || category.value || category"
                variant="secondary"
              >
                {{ category.name }}
              </Badge>
            </div>
          </div>
          <div v-if="user.exam_subcategories && user.exam_subcategories.length">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam Subcategories</label>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="subcategory in user.exam_subcategories"
                :key="subcategory.id || subcategory.value || subcategory"
                variant="secondary"
              >
                {{ subcategory.name }}
              </Badge>
            </div>
          </div>
          <div v-if="user.exams && user.exams.length">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Exams</label>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="exam in user.exams" :key="exam.id || exam.value || exam" variant="secondary">
                {{ exam.name }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button @click="$emit('close')" variant="outline">Close</Button>
      <Button @click="$emit('edit', user)" variant="primary">Edit User</Button>
    </template>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import Badge from '@/components/Badge.vue'
import RoleBadge from './RoleBadge.vue'
import OnlineStatusIndicator from './OnlineStatusIndicator.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
})

defineEmits(['close', 'edit'])

const userRole = computed(() => props.user?.role?.toLowerCase?.() || '')

const displayName = computed(() => {
  if (props.user?.name) return props.user.name
  const first = props.user?.first_name ?? props.user?.firstname
  const last = props.user?.last_name ?? props.user?.lastname
  const fallback = [first, last].filter(Boolean).join(' ')
  return fallback || props.user?.username || props.user?.email || 'User'
})

const avatarUrl = computed(() => {
  const photo = props.user?.photo
  if (photo) {
    if (typeof photo === 'string' && photo.startsWith('http')) {
      return photo
    }
    const base = import.meta.env.VITE_BACKEND_URL || ''
    return `${base}/storage/${photo}`
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=FFD700&color=000`
})

const location = computed(() => {
  return {
    country: props.user?.country?.name || props.user?.country_name || props.user?.country || '',
    state: props.user?.state?.name || props.user?.state_name || props.user?.state || '',
    city: props.user?.city?.name || props.user?.city_name || props.user?.city || '',
  }
})

const hasLocationInfo = computed(() => {
  const value = location.value
  return Boolean(value.country || value.state || value.city)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>
