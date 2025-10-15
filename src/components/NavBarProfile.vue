<template>
  <div class="relative" ref="dropdownRef">
    <!-- Avatar Trigger -->
    <button @click="toggleDropdown" class="focus:outline-none">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="User Avatar"
        class="w-10 h-10 rounded-full border-2 border-yellow-400 shadow"
      />
      <UserRound
        v-else
        class="w-10 h-10 text-gray-500 dark:text-gray-300 border-2 border-white rounded-full p-1"
      />
    </button>

    <!-- Dropdown Menu -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
          <li>
            <RouterLink
              :to="profileRoute"
              class="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="User Avatar"
                class="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
              />
              <span class="font-medium text-sm">{{ fullName }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/settings"
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Settings
            </RouterLink>
          </li>
          <li>
            <button
              @click="logout"
              class="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { UserRound } from 'lucide-vue-next'

const dropdownRef = ref(null)
const isOpen = ref(false)
const router = useRouter()
const auth = useAuthStore()
const profile = useProfileStore()

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

function logout() {
  auth.logout()
  profile.clearProfile()
  router.push('/login')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed: Avatar URL
const avatarUrl = computed(() => {
  const fileName = profile.data?.student?.photo
  if (!fileName) return null
  return fileName.startsWith('http')
    ? fileName
    : `${import.meta.env.VITE_BACKEND_URL}/storage/${fileName}`
})

// Computed: Profile fullname
const fullName = computed(() => {
  const s = profile.data?.student
  return s ? `${s.first_name} ${s.last_name}` : ''
})


// Computed: Profile route based on user role
const profileRoute = computed(() => {
  const role = auth.user?.role
  return role === 'examiner' ? '/examiner/profile' : '/profile'
})
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
