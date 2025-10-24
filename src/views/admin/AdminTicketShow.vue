<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Ticket #{{ id }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">View and update ticket details</p>
        </div>
        <button @click="reload" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition">
          <RefreshCw class="w-4 h-4" />
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-semibold">{{ ticket?.subject || '—' }}</h2>
              <div class="mt-1 text-xs text-gray-500">Created {{ ticket?.created_at || '—' }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-xs" :class="statusPill(ticket?.status)">{{ ticket?.status || '—' }}</span>
              <span class="px-2 py-0.5 rounded text-xs" :class="priorityClass(ticket?.priority)">{{ ticket?.priority || '—' }}</span>
            </div>
          </div>

          <div class="mt-4 space-y-2 text-sm">
            <div class="whitespace-pre-wrap">{{ ticket?.description || ticket?.body || 'No description' }}</div>
          </div>
          </div>

          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">Conversation</h3>
            </div>
            <ul class="space-y-3" v-if="thread && thread.length">
              <li v-for="(m,idx) in thread" :key="m.id || idx" class="rounded-lg border p-3" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="font-medium text-gray-700 dark:text-gray-200">{{ m.author?.name || m.user?.name || m.admin?.name || 'User' }}</div>
                  <div>{{ m.created_at || m.date || '' }}</div>
                </div>
                <div class="mt-2 text-sm whitespace-pre-wrap">{{ m.message || m.body || m.text }}</div>
              </li>
            </ul>
            <div v-else class="text-sm text-gray-500">No replies yet.</div>

            <div class="mt-4">
              <label class="block text-xs text-gray-500 mb-1">Reply</label>
              <textarea v-model="replyText" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent p-2 text-sm" placeholder="Write your reply..."></textarea>
              <div class="mt-2 flex justify-end">
                <button @click="onReply" :disabled="!replyText || loading" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition disabled:opacity-50">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Requester</h3>
            <div class="text-sm">{{ ticket?.requester?.name || ticket?.user?.name || '—' }}</div>
            <div class="text-xs text-gray-500">{{ ticket?.requester?.email || ticket?.user?.email || '' }}</div>
          </div>

          <div class="rounded-xl border p-4 shadow-sm space-y-3" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="font-semibold">Actions</h3>
            <div class="space-y-2">
              <label class="block text-xs text-gray-500">Assign to Admin (ID)</label>
              <input v-model.number="assigneeId" type="number" placeholder="Administrator ID" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
              <button @click="onAssign" :disabled="!assigneeId || loading" class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition disabled:opacity-50">
                <UserPlus class="w-4 h-4"/> Assign
              </button>
            </div>
            <div class="space-y-2">
              <label class="block text-xs text-gray-500">Update Status</label>
              <select v-model="newStatus" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                <option disabled value="">Select status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button @click="onUpdateStatus" :disabled="!newStatus || loading" class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition disabled:opacity-50">
                <CheckCircle class="w-4 h-4"/> Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'
import { RefreshCw, UserPlus, CheckCircle } from 'lucide-vue-next'
import { useAdminTickets } from '@/composables/useAdminTickets'

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })
const route = useRoute()
const id = computed(() => route.params.id)

const { loading, ticket, loadTicket, assign, updateStatus, reply } = useAdminTickets()

const assigneeId = ref()
const newStatus = ref('')
const replyText = ref('')

onMounted(() => {
  if (id.value) loadTicket(id.value)
})

function reload() { if (id.value) loadTicket(id.value) }
async function onAssign() { if (id.value && assigneeId.value) await assign(id.value, assigneeId.value) }
async function onUpdateStatus() { if (id.value && newStatus.value) await updateStatus(id.value, newStatus.value) }
async function onReply() { if (id.value && replyText.value) { await reply(id.value, replyText.value); replyText.value = '' } }

const thread = computed(() => ticket.value?.messages || ticket.value?.replies || ticket.value?.comments || [])

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
