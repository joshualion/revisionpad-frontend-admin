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
        class="fixed lg:static z-40 h-full top-0 left-0 transition-all duration-300 flex flex-col border-r"
        :class="[
          isDark
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200',
          sidebarMinimized ? 'w-20' : 'w-64',
        ]"
      >
        <!-- Logo / Toggle Section -->
        <div
          class="flex items-center justify-between p-4 border-b"
          :class="isDark ? 'border-gray-900' : 'border-gray-200'"
        >
          <h1
            class="font-extrabold text-gold transition-all duration-300"
            :class="sidebarMinimized ? 'text-2xl' : 'text-xl'"
          >
            <span class="text-3xl">R</span><span v-if="!sidebarMinimized">evisionPad</span>
          </h1>
          <!-- Sidebar toggles -->
          <div class="flex gap-2">
            <!-- Collapse for desktop -->
            <button
              class="hidden lg:block p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              @click="sidebarMinimized = !sidebarMinimized"
            >
              <ChevronLeft v-if="!sidebarMinimized" class="w-5 h-5" />
              <ChevronRight v-else class="w-5 h-5" />
            </button>
            <!-- Close for mobile -->
            <button
              class="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-gray-900 dark:hover:text-gray-100"
            :class="[
              route.path === item.to
                ? isDark
                  ? 'bg-yellow-900/30 text-gold'
                  : 'bg-yellow-50 text-gold'
                : '',
              sidebarMinimized ? 'justify-center' : 'justify-start',
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!sidebarMinimized" class="whitespace-nowrap">{{
              item.name
            }}</span>
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
        :class="isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'"
      >
        <div class="flex items-center gap-4">
          <!-- Mobile Sidebar Button -->
          <button
            class="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            @click="sidebarOpen = true"
          >
            <Menu class="w-6 h-6 text-gold" />
          </button>

          <!-- Breadcrumb -->
          <div class="flex items-center space-x-2 text-sm">
            <Home class="w-4 h-4 text-gold" />
            <span v-for="(crumb, index) in breadcrumbs" :key="index">
              <span v-if="index !== 0" class="mx-1 text-gray-400">/</span>
              <span :class="index === breadcrumbs.length - 1 ? 'font-semibold' : ''">
                {{ crumb }}
              </span>
            </span>
          </div>
        </div>

        <!-- Right Icons -->
        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <button class="relative hover:scale-105 transition hover:text-gray-900 dark:hover:text-gray-100">
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
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=FFD700&color=000"
                alt="Admin"
                class="w-8 h-8 rounded-full"
              />
              <span v-if="!sidebarMinimized" class="font-semibold hidden sm:inline"
                >Admin</span
              >
            </button>

            <transition name="fade">
              <div
                v-if="dropdownOpen"
                class="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border transition-all"
                :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
              >
                <RouterLink
                  to="/admin/profile"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition"
                >
                  Profile
                </RouterLink>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Main Slot -->
      <main class="flex-1 overflow-y-auto p-6 transition-colors duration-300"
        :class="isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-vue-next'
import { useDark } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import DarkModeToggle from '@/components/DarkModeToggle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const sidebarOpen = ref(false)
const sidebarMinimized = ref(false)
const dropdownOpen = ref(false)
const notifications = ref(3)
const isMobile = ref(false)

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
})

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
})

const menu = [
  { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
]

const logout = () => {
  auth.logout()
  toast.success('Logged out successfully.')
  router.push('/')
}
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
