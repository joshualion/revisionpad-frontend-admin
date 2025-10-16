<!-- AdminDashboard.vue -->
<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Overview and quick insights</p>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <button class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition">
            <RefreshCw class="w-4 h-4" />
            Refresh
          </button>
          <button class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition">
            <Megaphone class="w-4 h-4" />
            Announcement
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          v-for="card in kpis"
          :key="card.label"
          class="rounded-xl border p-4 shadow-sm"
          :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</p>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="text-2xl font-bold">—</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="card.badgeClass">Loading</span>
              </div>
            </div>
            <div class="p-3 rounded-lg" :class="card.iconBg">
              <component :is="card.icon" class="w-5 h-5" />
            </div>
          </div>
          <div class="mt-4 h-2 w-full rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div class="h-full w-1/3 bg-yellow-400 animate-pulse"></div>
          </div>
          <p class="mt-2 text-xs text-gray-400">Awaiting backend data</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-12 gap-4">
        <!-- Charts / Analytics -->
        <div class="col-span-12 xl:col-span-8 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold">Traffic & Engagement</h2>
              <div class="text-xs text-gray-500 dark:text-gray-400">Last 30 days</div>
            </div>
            <!-- Chart Placeholder -->
            <div class="h-64 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <div class="text-center">
                <BarChart3 class="mx-auto w-10 h-10 text-gray-300 dark:text-gray-700" />
                <p class="text-sm text-gray-400 mt-2">Chart placeholder</p>
              </div>
            </div>
          </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">Revenue Overview</h3>
                <DollarSign class="w-5 h-5 text-yellow-500" />
              </div>
              <div class="h-48 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                <TrendingUp class="w-8 h-8 text-gray-300 dark:text-gray-700" />
              </div>
              <p class="mt-2 text-xs text-gray-400">Monthly revenue chart placeholder</p>
            </div>

            <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">System Health</h3>
                <Activity class="w-5 h-5 text-green-500" />
              </div>
              <ul class="space-y-3">
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">API Status</span>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500"><Clock class="w-3 h-3"/> Pending</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Queues</span>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500"><Clock class="w-3 h-3"/> Pending</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Storage</span>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500"><Clock class="w-3 h-3"/> Pending</span>
                </li>
              </ul>
              <div class="mt-4 h-2 w-full rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div class="h-full w-1/4 bg-green-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Widgets -->
        <div class="col-span-12 xl:col-span-4 space-y-4">
          <!-- Recent Signups -->
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">Recent Signups</h3>
              <Users class="w-5 h-5 text-yellow-500" />
            </div>
            <ul class="divide-y divide-gray-200 dark:divide-gray-800">
              <li v-for="i in 5" :key="i" class="py-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div class="h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded mt-2 animate-pulse"></div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Pending Tickets -->
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">Pending Tickets</h3>
              <AlertCircle class="w-5 h-5 text-red-500" />
            </div>
            <ul class="space-y-3">
              <li v-for="i in 4" :key="'t'+i" class="flex items-center justify-between">
                <div class="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <span class="text-xs text-gray-400">—</span>
              </li>
            </ul>
            <button class="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition">
              <Eye class="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Recent Activity</h3>
          <button class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Export</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">User</th>
                <th class="py-2 pr-4">Action</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="i in 6" :key="'row'+i">
                <td class="py-3 pr-4">
                  <div class="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
                <td class="py-3 pr-4">
                  <div class="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
                <td class="py-3 pr-4">
                  <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">Pending</span>
                </td>
                <td class="py-3 pr-4">
                  <div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
  
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { useDark } from '@vueuse/core'
import { 
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  Megaphone,
  CreditCard,
  CheckCircle,
} from 'lucide-vue-next'

const kpis = [
  { label: 'Total Users', icon: Users, iconBg: 'bg-yellow-50 dark:bg-yellow-900/20', badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
  { label: 'Active Subscriptions', icon: CreditCard, iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
  { label: 'Monthly Revenue', icon: DollarSign, iconBg: 'bg-blue-50 dark:bg-blue-900/20', badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
  { label: 'Tickets Resolved', icon: CheckCircle, iconBg: 'bg-purple-50 dark:bg-purple-900/20', badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
]

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })
</script>

<style scoped>
/* No additional styles needed; Tailwind handles layout */
</style>
