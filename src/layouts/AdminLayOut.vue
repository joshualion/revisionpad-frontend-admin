<template>
  <div
    class="flex h-screen transition-colors duration-300"
    :class="isDark ? 'bg-gray-900 text-gray-50' : 'bg-gray-50 text-gray-800'"
  >
    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <transition name="slide">
      <aside
        v-show="sidebarOpen || !isMobile"
        class="fixed lg:static z-40 h-full top-0 left-0 transition-all duration-300 flex flex-col border-r glow"
        :class="[
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
          sidebarMinimized ? 'w-20' : 'w-64',
        ]"
      >
        <!-- Logo / Toggle Section -->
        <div
          class="flex items-center justify-between p-4 border-b"
          :class="isDark ? 'border-gray-900' : 'border-gray-200'"
        >
          <h1
            class="font-extrabold transition-all duration-300"
            :class="sidebarMinimized ? 'text-2xl' : 'text-xl'"
          >
            <span class="text-3xl" :class="isDark ? 'text-gold' : 'text-gold'">R</span>
            <span v-if="!sidebarMinimized" :class="isDark ? 'text-white' : 'text-gray-900'">evisionPad</span>
          </h1>
          <!-- Sidebar toggles -->
          <div class="flex gap-2">
            <!-- Collapse for desktop -->
            <button
              class="hidden lg:block p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
              @click="sidebarMinimized = !sidebarMinimized"
            >
              <ChevronLeft v-if="!sidebarMinimized" class="w-5 h-5" />
              <ChevronRight v-else class="w-5 h-5" />
            </button>
            <!-- Close for mobile -->
            <button
              class="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
              @click="sidebarOpen = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>


        <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto mt-4 space-y-1">
        <RouterLink
          v-for="item in menu"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-700"
          :class="[
            // base colors
            isDark ? 'text-gray-300 hover:text-gray-900 hover:bg-white' : 'text-gray-900 hover:text-gray-800 hover:bg-white',

            // active state
            route.path === item.to
              ? isDark
                ? 'bg-yellow-900/30 text-gold'
                : 'bg-yellow-100 text-gold'
              : '',

            sidebarMinimized ? 'justify-center' : 'justify-start',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!sidebarMinimized" class="whitespace-nowrap">{{ item.name }}</span>
        </RouterLink>
      </nav>


        <!-- Dark Mode Toggle -->
        <div
          class="p-4 border-t flex justify-center"
          :class="isDark ? 'border-gray-800' : 'border-gray-200'"
        >
          <DarkModeToggle />
        </div>
      </aside>
    </transition>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col">
      <!-- Navbar -->
      <header
        class="flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-20 transition-colors duration-300 glow"
        :class="
          isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'
        "
      >
        <div class="flex items-center gap-4">
          <!-- Mobile Sidebar Button -->
          <button
            class="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
            @click="sidebarOpen = true"
          >
            <Menu class="w-6 h-6 text-gold" />
          </button>

          <!-- Breadcrumb -->

        </div>

        <!-- Right Icons -->
        <div class="flex items-center gap-4">
          <!-- Notifications -->
            <button
              class="relative hover:scale-105 transition hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700 rounded-lg"
            >
              <Bell class="w-5 h-5 text-gold" />
              <span
                v-if="notifications > 0"
                class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              ></span>
            </button>

          <!-- User Dropdown -->
          <div class="relative">
            <button
              @click="dropdownOpen = !dropdownOpen"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700 transition"
            >
              <img
                :src="photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FFD700&color=000`"
                :alt="displayName"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span v-if="!sidebarMinimized" class="font-semibold hidden sm:inline">{{ displayName }}</span>
            </button>

            <transition name="fade">
              <div
                v-if="dropdownOpen"
                class="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border transition-all"
                :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
              >
                <RouterLink
                  to="/admin/profile"
                  class="block px-4 py-2 rounded-lg transition hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
                  :class="[
                    // match sidebar hover colors
                    'hover:bg-yellow-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800',
                    // base text matches breadcrumb colors
                    isDark ? 'text-white' : 'text-gray-900',
                    // active state like sidebar
                    route.path === '/admin/profile'
                      ? (isDark ? 'bg-yellow-900/30 text-gold' : 'bg-yellow-50 text-gold')
                      : ''
                  ]"
                >
                  <span class="inline-flex items-center gap-2"><User2 class="w-4 h-4"/> Profile</span>
                </RouterLink>
                <RouterLink
                  to="/change/password"
                  class="block px-4 py-2 rounded-lg transition hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
                  :class="[
                    'hover:bg-yellow-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800',
                    isDark ? 'text-white' : 'text-gray-900',
                    route.name === 'ChangePassword'
                      ? (isDark ? 'bg-yellow-900/30 text-gold' : 'bg-yellow-50 text-gold')
                      : ''
                  ]"
                >
                  <span class="inline-flex items-center gap-2"><Lock class="w-4 h-4"/> Change Password</span>
                </RouterLink>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 rounded-lg transition hover:bg-yellow-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 hover:ring-1 hover:ring-gray-300 dark:hover:ring-1 dark:hover:ring-gray-700"
                >
                  <span class="inline-flex items-center gap-2"><LogOut class="w-4 h-4"/> Logout</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Main Slot -->
      <main
        class="flex-1 overflow-y-auto p-6 transition-colors duration-300"
        :class="isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
  User2,
  Lock,
  LogOut,
} from 'lucide-vue-next'
import { useDark } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import api from '@/http/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const sidebarOpen = ref(false)
const sidebarMinimized = ref(false)
const dropdownOpen = ref(false)
const notifications = ref(3)
const isMobile = ref(false)
const adminPhoto = ref('')

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

onMounted(() => {
  const checkScreen = () => (isMobile.value = window.innerWidth < 1024)
  checkScreen()
  window.addEventListener('resize', checkScreen)
  ;(async () => {
    try {
      const { data } = await api.get('/admin/profile')
      const a = data?.administrator || data
      if (a?.photo) adminPhoto.value = a.photo
    } catch {
      //do nothing for now
    }
  })()
})



const menu = [
  { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
]

const logout = async () => {
  try {
    await auth.logout()
    toast.success('Logged out successfully.')
    // Use replace to avoid returning to protected page via Back
    await router.replace({ name: 'login' })
  } catch {
    // As a hard fallback if navigation is stuck, force reload to login
    window.location.assign('/login')
  }
}

const displayName = computed(() => auth.user?.name || 'Admin')
const photoUrl = computed(() => {
  if (!adminPhoto.value) return ''
  if (adminPhoto.value.startsWith('http')) return adminPhoto.value
  const base = import.meta.env.VITE_BACKEND_URL || ''
  return `${base}/storage/${adminPhoto.value}`
})
</script>

<style scoped>
.text-gold {
  color: #ffd700;
}
.bg-gold {
  background-color: #ffd700;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
