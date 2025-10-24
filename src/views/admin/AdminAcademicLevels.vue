<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Academic Levels</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Create and manage academic levels</p>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition"
        >
          <Plus class="w-4 h-4" /> New Level
        </button>
      </div>

      <!-- Filters -->
      <div
        class="rounded-xl border p-4 shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="filters.q"
              @keyup.enter="applyFilters"
              type="text"
              placeholder="Search name"
              class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"
            />
            <button
              @click="clearFilters"
              class="px-3 h-10 rounded border border-gray-300 dark:border-gray-700 text-sm"
            >
              Clear
            </button>
          </div>
          <div class="text-xs text-gray-500">Total: {{ pagination.total }}</div>
        </div>
      </div>

      <!-- Table -->
      <div
        class="rounded-xl border p-4 shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Name</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="l in items" :key="l.id">
                <td class="py-3 pr-4">{{ l.id }}</td>
                <td class="py-3 pr-4 font-medium">{{ l.name }}</td>
                <td class="py-3 pr-4 space-x-2">
                  <button
                    @click="openEdit(l)"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(l)"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="!loading && (!items || !items.length)">
                <td colspan="3" class="py-6 text-center text-gray-500">No levels found</td>
              </tr>
              <tr v-for="i in 5" :key="'sk-'+i" v-if="loading">
                <td class="py-3 pr-4">
                  <div class="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
                <td class="py-3 pr-4">
                  <div class="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
                <td class="py-3 pr-4">
                  <div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end gap-2 mt-4">
          <button
            :disabled="pagination.page <= 1 || loading"
            @click="prevPage"
            class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <div class="text-xs text-gray-500">Page {{ pagination.page }}</div>
          <button
            :disabled="items.length < pagination.per_page || loading"
            @click="nextPage"
            class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <transition name="fade">
        <div
          v-if="modal.open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            class="w-full max-w-lg rounded-xl border shadow-sm"
            :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
          >
            <div
              class="flex items-center justify-between p-4 border-b"
              :class="isDark ? 'border-gray-800' : 'border-gray-200'"
            >
              <h3 class="font-semibold">
                {{ modal.mode === 'create' ? 'New Level' : 'Edit Level' }}
              </h3>
              <button
                @click="closeModal"
                class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <label class="block text-xs text-gray-500">Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"
                  placeholder="e.g. SS1"
                />
              </div>
              <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>
            </div>
            <div
              class="p-4 flex items-center justify-end gap-2 border-t"
              :class="isDark ? 'border-gray-800' : 'border-gray-200'"
            >
              <button
                @click="closeModal"
                class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm"
              >
                Cancel
              </button>
              <button
                @click="save"
                :disabled="saving"
                class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>Save</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { ref, onMounted } from 'vue'
import { useDark } from '@vueuse/core'
import { Plus, X } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import api from '@/http/api'

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })

const loading = ref(false)
const items = ref([])
const pagination = ref({ page: 1, per_page: 20, total: 0 })
const filters = ref({ q: '' })

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const form = ref({ id: null, name: '' })

async function loadLevels() {
  loading.value = true
  try {
    const params = { limit: pagination.value.per_page, page: pagination.value.page }
    if (filters.value.q) params.q = filters.value.q
    const { data } = await api.get('/admin/academic-levels', { params })
    if (data?.data && Array.isArray(data.data)) {
      items.value = data.data
      pagination.value.total = data?.meta?.total ?? data?.total ?? items.value.length
      pagination.value.per_page = data?.meta?.per_page ?? pagination.value.per_page
    } else if (data?.data && data.data?.data && Array.isArray(data.data.data)) {
      items.value = data.data.data
      pagination.value.total = data.data.total
      pagination.value.per_page = data.data.per_page
    } else if (Array.isArray(data)) {
      items.value = data
      pagination.value.total = data.length
    } else {
      items.value = []
      pagination.value.total = 0
    }
    if (Array.isArray(items.value)) {
      items.value.sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0))
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to load levels')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.value.page = 1
  loadLevels()
}
function clearFilters() {
  filters.value.q = ''
  pagination.value.page = 1
  loadLevels()
}
function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadLevels()
  }
}
function nextPage() {
  pagination.value.page++
  loadLevels()
}

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = { id: null, name: '' }
  formError.value = ''
}
function openEdit(l) {
  modal.value = { open: true, mode: 'edit' }
  form.value = { id: l.id, name: l.name || '' }
  formError.value = ''
}
function closeModal() {
  modal.value.open = false
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { name: form.value.name }
    if (!payload.name || !String(payload.name).trim()) {
      formError.value = 'Name is required'
      saving.value = false
      return
    }
    if (modal.value.mode === 'create') {
      await api.post('/admin/academic-levels', payload)
      toast.success('Level created')
    } else {
      await api.patch(`/admin/academic-levels/${form.value.id}`, payload)
      toast.success('Level updated')
    }
    closeModal()
    await loadLevels()
  } catch (e) {
    const msg = e?.response?.data?.message
    formError.value = msg || 'Save failed'
    toast.error(formError.value)
  } finally {
    saving.value = false
  }
}

function confirmDelete(l) {
  if (!l?.id) return
  const ok = window.confirm(`Delete level "${l.name}"? This cannot be undone.`)
  if (!ok) return
  deleteLevel(l.id)
}

async function deleteLevel(id) {
  try {
    await api.delete(`/admin/academic-levels/${id}`)
    toast.success('Level deleted')
    if (items.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await loadLevels()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}

onMounted(() => loadLevels())
</script>

<style scoped></style>
