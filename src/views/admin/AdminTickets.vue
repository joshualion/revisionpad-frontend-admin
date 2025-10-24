<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Support Tickets</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Manage and triage support tickets</p>
        </div>
        <button @click="refresh" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition">
          <RefreshCw class="w-4 h-4" />
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <div class="flex gap-2">
            <input v-model="filters.search" @keyup.enter="applyFilters" type="text" placeholder="Search subject or requester" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
            <select v-model="filters.status" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button @click="clearFilters" class="px-3 h-10 rounded border border-gray-300 dark:border-gray-700 text-sm">Clear</button>
          </div>
          <div class="text-xs text-gray-500">
            Total: {{ pagination.total }}
          </div>
        </div>

        <!-- Make table scroll on small screens both directions -->
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Subject</th>
                <th class="py-2 pr-4">Priority</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Requester</th>
                <th class="py-2 pr-4">Assigned</th>
                <th class="py-2 pr-4">Created</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="t in tickets" :key="t.id">
                <td class="py-3 pr-4">{{ t.id }}</td>
                <td class="py-3 pr-4">
                  <div class="font-medium">{{ t.subject }}</div>
                  <div class="text-xs text-gray-500">{{ t.snippet || t.summary || '' }}</div>
                </td>
                <td class="py-3 pr-4"><span class="px-2 py-0.5 rounded text-xs" :class="priorityClass(t.priority)">{{ t.priority || '—' }}</span></td>
                <td class="py-3 pr-4"><span class="px-2 py-0.5 rounded text-xs" :class="statusPill(t.status)">{{ t.status }}</span></td>
                <td class="py-3 pr-4">{{ t.requester?.name || t.user?.name || '—' }}</td>
                <td class="py-3 pr-4">{{ t.assignee?.name || t.assigned_to?.name || t.assignee_name || '—' }}</td>
                <td class="py-3 pr-4">{{ t.created_at }}</td>
                <td class="py-3 pr-4">
                  <RouterLink :to="{ name: 'admin-ticket-show', params: { id: t.id } }" class="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition">
                    <Eye class="w-4 h-4"/> View
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="!loading && (!tickets || !tickets.length)">
                <td colspan="8" class="py-6 text-center text-gray-500">No tickets found</td>
              </tr>
              <tr v-if="loading" v-for="i in 5" :key="'sk-'+i">
                <td class="py-3 pr-4"><div class="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-end gap-2 mt-4">
          <button :disabled="pagination.page <= 1 || loading" @click="prevPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Prev</button>
          <div class="text-xs text-gray-500">Page {{ pagination.page }}</div>
          <button :disabled="tickets.length < pagination.per_page || loading" @click="nextPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  </AdminLayout>
  
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useDark } from '@vueuse/core'
import { Eye, RefreshCw } from 'lucide-vue-next'
import { useAdminTickets } from '@/composables/useAdminTickets'

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })

const { loading, tickets, pagination, filters, loadTickets } = useAdminTickets()

const router = useRouter()

onMounted(() => {
  loadTickets()
})

function refresh() { loadTickets() }
function applyFilters() { pagination.value.page = 1; loadTickets() }
function clearFilters() { filters.value.search = ''; filters.value.status = ''; pagination.value.page = 1; loadTickets() }
function prevPage() { if (pagination.value.page > 1) { pagination.value.page--; loadTickets() } }
function nextPage() { pagination.value.page++; loadTickets() }

function priorityClass(p) {
  switch ((p || '').toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function statusPill(s) {
  switch ((s || '').toLowerCase()) {
    case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    case 'closed': return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}
</script>

<style scoped>
</style>
