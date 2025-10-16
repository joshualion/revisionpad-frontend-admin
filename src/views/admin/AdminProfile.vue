<template>
  <AdminLayout>
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Admin Profile</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Account details and preferences</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Summary Card -->
        <div class="lg:col-span-1 rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User2 class="w-8 h-8" />
            </div>
            <div>
              <h2 class="text-lg font-semibold">{{ auth.user?.name || '—' }}</h2>
              <p class="text-xs text-gray-500">{{ auth.user?.email || '—' }}</p>
              <span class="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">{{ auth.user?.role || 'administrator' }}</span>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            <p>Member since —  {{ sinceDate }}</p>
          </div>
        </div>

        <!-- Details -->
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Basic Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500">Full Name</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ auth.user?.name || '—' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Email</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ auth.user?.email || '—' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Role</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ auth.user?.role || 'administrator' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Status</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Security</h3>
            <div class="flex flex-wrap gap-2">
              <RouterLink to="/change/password" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition">
                <Lock class="w-4 h-4" /> Change Password
              </RouterLink>
              <button @click="logout" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
                <LogOut class="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { User2, Lock, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const router = useRouter()

const sinceDate = computed(() => {
  if (!auth.user?.created_at) return '—'
  const date = new Date(auth.user.created_at)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
})

const logout = async () => {
  await auth.logout()
  toast.info('Logged out successfully.')
  router.push('/')
}

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })
</script>

<style scoped>
</style>
