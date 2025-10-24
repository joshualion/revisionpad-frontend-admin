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
          <button @click="refresh" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition">
            <RefreshCw class="w-4 h-4" />
            {{ loading ? 'Refreshing�' : 'Refresh' }}
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
          v-for="card in cards"
          :key="card.label"
          class="rounded-xl border p-4 shadow-sm"
          :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</p>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="text-2xl font-bold">{{ card.display }}</span>
              </div>
            </div>
            <div class="p-3 rounded-md" :class="card.iconBg">
              <component :is="card.icon" class="w-5 h-5 text-gray-800" />
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-400">{{ loading ? 'Loading...' : 'Updated' }}</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-12 gap-4">
        <!-- Charts / Analytics -->
        <div class="col-span-12 xl:col-span-8 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold">Traffic & Engagement</h2>
              <div class="text-xs text-gray-500 dark:text-gray-400">Last {{ range }}</div>
            </div>
            <div class="h-64 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-2">
              <ChartCanvas :type="'line'" :labels="trafficLabels" :datasets="trafficSeries" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">Revenue Overview</h3>
                <DollarSign class="w-5 h-5 text-yellow-500" />
              </div>
              <div class="h-48 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-2">
                <ChartCanvas :type="'bar'" :labels="revenueLabels" :datasets="revenueSeries" />
              </div>
              <p class="mt-2 text-xs text-gray-400">Revenue in {{ kpiData?.currency || 'USD' }}</p>
            </div>

            <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold">System Health</h3>
                <Activity class="w-5 h-5 text-green-500" />
              </div>
              <ul class="space-y-3">
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">API Status</span>
                  <span class="inline-flex items-center gap-1 text-xs" :class="statusClass(systemHealth.api?.status)"><Clock class="w-3 h-3"/> {{ systemHealth.api?.status || '�' }}</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Queues</span>
                  <span class="inline-flex items-center gap-1 text-xs" :class="statusClass(systemHealth.queues?.status)"><Clock class="w-3 h-3"/> {{ systemHealth.queues?.status || '�' }}</span>
                </li>
                <li class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Storage</span>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500">{{ systemHealth.storage?.percent != null ? (systemHealth.storage.percent + '%') : '�' }}</span>
                </li>
              </ul>
              <div class="mt-4 h-2 w-full rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div class="h-full w-1/4 bg-green-400"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Widgets -->
        <div class="col-span-12 xl:col-span-4 space-y-4">
          <!-- Recent Signups -->
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">Recent Signups</h3>
              <Users class="w-5 h-5 text-yellow-500" />
            </div>
            <ul v-if="recentSignups && recentSignups.length" class="divide-y divide-gray-200 dark:divide-gray-800">
              <li v-for="u in recentSignups" :key="u.id || u.user_id || u.email" class="py-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                  <template v-if="photoUrlFor(u)">
                    <img :src="photoUrlFor(u)" :alt="u.name || u.email" class="w-8 h-8 object-cover" />
                  </template>
                  <template v-else>
                    <img :alt="u.name || u.email" class="w-8 h-8 object-cover" :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.email || 'U')}&background=FFD700&color=000`" />
                  </template>
                </div>
                <div class="flex-1">
                  <div class="text-sm">{{ u.name }}</div>
                  <div class="text-xs text-gray-500">{{ u.email }}</div>
                </div>
              </li>
            </ul>
            <ul v-else class="divide-y divide-gray-200 dark:divide-gray-800">
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
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">Pending Tickets</h3>
              <AlertCircle class="w-5 h-5 text-red-500" />
            </div>
            <ul v-if="pendingTickets && pendingTickets.length" class="space-y-3">
              <li v-for="t in pendingTickets" :key="t.id" class="flex items-center justify-between">
                <div class="text-sm">{{ t.subject }}</div>
                <span class="text-xs text-gray-500">{{ t.priority }}</span>
              </li>
            </ul>
            <ul v-else class="space-y-3">
              <li v-for="i in 4" :key="'t'+i" class="flex items-center justify-between">
                <div class="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                <span class="text-xs text-gray-400">�</span>
              </li>
            </ul>
            <button @click="goToTickets" class="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition">
              <Eye class="w-4 h-4" /> View All
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Recent Activity</h3>
          <button class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Export</button>
        </div>
        <!-- Allow scroll on small screens -->
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">User</th>
                <th class="py-2 pr-4">Action</th>
                <th class="py-2 pr-4">Subject</th>
                <th class="py-2 pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="(a,idx) in activity" :key="idx">
                <td class="py-3 pr-4">{{ a.actor?.name || '�' }}</td>
                <td class="py-3 pr-4">{{ a.action }}</td>
                <td class="py-3 pr-4">{{ a.subject_type }} #{{ a.subject_id }}</td>
                <td class="py-3 pr-4">{{ a.created_at }}</td>
              </tr>
              <tr v-if="!activity || !activity.length">
                <td colspan="4" class="py-4 text-center text-gray-500">No recent activity</td>
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
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users,
  Activity,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  Megaphone,
  CreditCard,
  CheckCircle,
  Clock,
} from 'lucide-vue-next'
import ChartCanvas from '@/components/ChartCanvas.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const { loading, range, kpis: kpiData, charts, systemHealth, recentSignups, pendingTickets, activity, load, refresh } = useAdminDashboard()
const router = useRouter()

onMounted(() => { load() })

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })

const formatCurrency = (amount, currency) => {
  if (amount == null) return '�'
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount) } catch { return amount }
}

const cards = computed(() => {
  const currency = kpiData.value?.currency
  return [
    { label: 'Total Users', icon: Users, iconBg: 'bg-yellow-500 dark:bg-yellow-900/20', display: kpiData.value?.total_users ?? '�' },
    { label: 'Active Subscriptions', icon: CreditCard, iconBg: 'bg-green-500 dark:bg-green-900/20', display: kpiData.value?.active_subscriptions ?? '�' },
    { label: 'Monthly Revenue', icon: DollarSign, iconBg: 'bg-blue-500 dark:bg-blue-900/20', display: formatCurrency(kpiData.value?.monthly_revenue, currency) },
    { label: 'Tickets Resolved', icon: CheckCircle, iconBg: 'bg-purple-500 dark:bg-purple-900/20', display: kpiData.value?.tickets_resolved ?? '�' },
  ]
})

function statusClass(status) {
  switch (status) { case 'ok': return 'text-green-500'; case 'degraded': return 'text-yellow-500'; case 'down': return 'text-red-500'; default: return 'text-gray-500' }
}

const buildPhotoUrl = (rel) => {
  if (!rel) return ''
  if (typeof rel === 'string' && /^https?:\/\//i.test(rel)) return rel
  const base = import.meta.env.VITE_BACKEND_URL || ''
  return `${base}/storage/${rel}`
}

// Resolves a user's photo across related role tables (student/administrator/examiner)
const photoUrlFor = (u) => {
  if (!u) return ''
  const p =
    u.photo ||
    u.student?.photo ||
    u.administrator?.photo ||
    u.examiner?.photo ||
    u.profile?.photo ||
    u.user?.photo ||
    u.user?.student?.photo ||
    u.user?.administrator?.photo ||
    u.user?.examiner?.photo
  return buildPhotoUrl(p)
}

const trafficLabels = computed(() => (charts.value?.traffic || []).map(p => p.date))
const trafficSeries = computed(() => [
  {
    label: 'Visits',
    data: (charts.value?.traffic || []).map(p => p.visits ?? 0),
    borderColor: '#6b7280',
    backgroundColor: 'rgba(107,114,128,0.25)',
    tension: 0.25,
    fill: true,
  },
  {
    label: 'Signups',
    data: (charts.value?.traffic || []).map(p => p.signups ?? 0),
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245,158,11,0.25)',
    tension: 0.25,
    fill: true,
  },
])

const revenueLabels = computed(() => (charts.value?.revenue || []).map(p => p.date))
const revenueSeries = computed(() => [{
  label: 'Revenue',
  data: (charts.value?.revenue || []).map(p => p.amount ?? 0),
  backgroundColor: '#f59e0b',
  borderColor: '#f59e0b',
}])

function goToTickets() {
  router.push({ name: 'admin-tickets' })
}
</script>

<style scoped>
/* No additional styles needed; Tailwind handles layout */
</style>
