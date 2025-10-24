<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Subject Topics</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Create and manage subject topics</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="openImport" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Import CSV</button>
          <button @click="downloadTemplate" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">CSV Template</button>
          <button @click="openCreate" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition">
            <Plus class="w-4 h-4" /> New Topic
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
            <input v-model="filters.q" @keyup.enter="applyFilters" type="text" placeholder="Search by name or description" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
            <select v-model="filters.subject_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All subjects</option>
              <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <select v-model="filters.academic_level_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All levels</option>
              <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
            <button @click="clearFilters" class="px-3 h-10 rounded border border-gray-300 dark:border-gray-700 text-sm">Clear</button>
          </div>
          <div class="text-xs text-gray-500">Total: {{ pagination.total }}</div>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Name</th>
                <th class="py-2 pr-4">Subject</th>
                <th class="py-2 pr-4">Level</th>
                <th class="py-2 pr-4">Slug</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="t in items" :key="t.id">
                <td class="py-3 pr-4">{{ t.id }}</td>
                <td class="py-3 pr-4 font-medium">{{ t.name }}</td>
                <td class="py-3 pr-4">{{ t.subject?.name || t.subject_name || t.subject_id }}</td>
                <td class="py-3 pr-4">{{ t.academic_level?.name || t.level_name || t.academic_level_id }}</td>
                <td class="py-3 pr-4 text-gray-500">{{ t.slug || '—' }}</td>
                <td class="py-3 pr-4 space-x-2">
                  <button @click="openEdit(t)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Edit</button>
                  <button @click="confirmDelete(t)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs">Delete</button>
                </td>
              </tr>
              <tr v-if="!loading && (!items || !items.length)">
                <td colspan="6" class="py-6 text-center text-gray-500">No topics found</td>
              </tr>
              <template v-if="loading">
                <tr v-for="i in 5" :key="'sk-'+i">
                  <td class="py-3 pr-4" colspan="6"><div class="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end gap-2 mt-4">
          <button :disabled="pagination.page <= 1 || loading" @click="prevPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Prev</button>
          <div class="text-xs text-gray-500">Page {{ pagination.page }}</div>
          <button :disabled="items.length < pagination.per_page || loading" @click="nextPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Next</button>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <transition name="fade">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-lg rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">{{ modal.mode === 'create' ? 'New Topic' : 'Edit Topic' }}</h3>
              <button @click="closeModal" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-500">Subject</label>
                  <select v-model="form.subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select subject</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Academic Level</label>
                  <select v-model="form.academic_level_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select level</option>
                    <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-500">Name</label>
                  <input v-model="form.name" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" placeholder="e.g. Algebra Basics" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-500">Description</label>
                  <textarea v-model="form.description" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-500">Slug (optional)</label>
                  <input v-model="form.slug" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" placeholder="leave blank to auto-generate" />
                </div>
              </div>
              <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>
            </div>
            <div class="p-4 flex items-center justify-end gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <button @click="closeModal" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Cancel</button>
              <button @click="save" :disabled="saving" class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm">
                <span v-if="saving">Saving...</span>
                <span v-else>Save</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Import CSV Modal -->
      <transition name="fade">
        <div v-if="importModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-2xl rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">Import Topics (CSV)</h3>
              <button @click="importModal = false" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-4 text-sm">
              <div class="space-y-2">
                <label class="block text-xs text-gray-500">CSV File</label>
                <input ref="importFile" type="file" accept=".csv,text/csv" class="block w-full text-xs" />
                <p class="text-xs text-gray-500">Headers accepted: name, description, subject_id, academic_level_id, slug. Aliases supported: subject, academic_level/level/level_id, topic/title, desc.</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label class="block text-xs text-gray-500">Default Subject</label>
                  <select v-model="importDefaults.default_subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Optional</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Academic Level</label>
                  <select v-model="importDefaults.default_academic_level_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Optional</option>
                    <option v-for="l in levels" :key="l.id" :value="l.id">{{ l.name }}</option>
                  </select>
                </div>
                <div class="flex items-end gap-2">
                  <label class="inline-flex items-center gap-2 text-xs mb-1">
                    <input type="checkbox" v-model="importDefaults.stop_on_error" /> Stop on first error
                  </label>
                </div>
              </div>
              <div class="text-xs text-gray-500">If a row omits subject or level, the defaults (when provided) are applied. Slug is auto-generated when blank.</div>
            </div>
            <div class="p-4 flex items-center justify-end gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <button @click="importModal = false" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Cancel</button>
              <button @click="submitImport" :disabled="importing" class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm">
                <span v-if="importing">Importing...</span>
                <span v-else>Import</span>
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
const subjects = ref([])
const levels = ref([])
const pagination = ref({ page: 1, per_page: 20, total: 0 })
const filters = ref({ q: '', subject_id: '', academic_level_id: '' })

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const form = ref({ id: null, subject_id: '', academic_level_id: '', name: '', description: '', slug: '' })

// Import CSV state
const importModal = ref(false)
const importing = ref(false)
const importFile = ref(null)
const importDefaults = ref({ default_subject_id: '', default_academic_level_id: '', stop_on_error: false })

async function fetchSubjects() {
  try {
    const { data } = await api.get('/admin/subjects', { params: { limit: 1000 } })
    const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : []))
    subjects.value = payload.map(s => ({ id: s.id, name: s.name }))
    subjects.value.sort((a,b) => Number(a.id) - Number(b.id))
  } catch {
    // nothing
  }
}

async function fetchLevels() {
  // assuming conventional endpoint name
  try {
    const { data } = await api.get('/admin/academic-levels', { params: { limit: 1000 } })
    const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : []))
    levels.value = payload.map(l => ({ id: l.id, name: l.name }))
  } catch {
    // nothing
  }
}

async function loadTopics() {
  loading.value = true
  try {
    const params = { limit: pagination.value.per_page, page: pagination.value.page }
    if (filters.value.q) params.q = filters.value.q
    if (filters.value.subject_id) params.subject_id = filters.value.subject_id
    if (filters.value.academic_level_id) params.academic_level_id = filters.value.academic_level_id
    const { data } = await api.get('/admin/topics', { params })
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
    toast.error(e?.response?.data?.message || 'Failed to load topics')
  } finally {
    loading.value = false
  }
}

function applyFilters() { pagination.value.page = 1; loadTopics() }
function clearFilters() { filters.value = { q: '', subject_id: '', academic_level_id: '' }; pagination.value.page = 1; loadTopics() }
function prevPage() { if (pagination.value.page > 1) { pagination.value.page--; loadTopics() } }
function nextPage() { pagination.value.page++; loadTopics() }

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = { id: null, subject_id: '', academic_level_id: '', name: '', description: '', slug: '' }
  formError.value = ''
}
function openEdit(t) {
  modal.value = { open: true, mode: 'edit' }
  form.value = { id: t.id, subject_id: t.subject_id || t.subject?.id || '', academic_level_id: t.academic_level_id || t.academic_level?.id || '', name: t.name || '', description: t.description || '', slug: t.slug || '' }
  formError.value = ''
}
function closeModal() { modal.value.open = false }

async function save() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { subject_id: form.value.subject_id, academic_level_id: form.value.academic_level_id, name: form.value.name, description: form.value.description || null, slug: form.value.slug || null }
    if (!payload.subject_id || !payload.academic_level_id || !payload.name?.trim()) {
      formError.value = 'Subject, Academic Level and Name are required'
      saving.value = false
      return
    }
    if (modal.value.mode === 'create') {
      await api.post('/admin/topics', payload)
      toast.success('Topic created')
    } else {
      await api.patch(`/admin/topics/${form.value.id}`, payload)
      toast.success('Topic updated')
    }
    closeModal(); await loadTopics()
  } catch (e) {
    const msg = e?.response?.data?.message
    formError.value = msg || 'Save failed'
    toast.error(formError.value)
  } finally {
    saving.value = false
  }
}

function confirmDelete(t) {
  if (!t?.id) return
  const ok = window.confirm(`Delete topic "${t.name}"? This cannot be undone.`)
  if (!ok) return
  deleteTopic(t.id)
}

async function deleteTopic(id) {
  try {
    await api.delete(`/admin/topics/${id}`)
    toast.success('Topic deleted')
    if (items.value.length === 1 && pagination.value.page > 1) { pagination.value.page-- }
    await loadTopics()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}

function openImport() {
  importDefaults.value.default_subject_id = filters.value.subject_id || ''
  importDefaults.value.default_academic_level_id = filters.value.academic_level_id || ''
  importDefaults.value.stop_on_error = false
  importModal.value = true
}

async function submitImport() {
  if (!importFile.value?.files?.[0]) { toast.error('Choose a CSV file'); return }
  importing.value = true
  try {
    const fd = new FormData()
    fd.append('file', importFile.value.files[0])
    Object.entries(importDefaults.value).forEach(([k,v]) => {
      if (v !== '' && v !== null && v !== false) fd.append(k, String(v))
      if (k === 'stop_on_error') fd.append(k, v ? '1' : '0')
    })
    const { data } = await api.post('/admin/topics/import-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    const ok = data?.success !== false
    const created = data?.created_count ?? 0
    toast[ok ? 'success' : 'error'](`Imported ${created} topic(s)${ok ? '' : ' with errors'}`)
    importModal.value = false
    await loadTopics()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Import failed')
  } finally {
    importing.value = false
  }
}

function downloadTemplate() {
  const headers = ['name','description','subject_id','academic_level_id','slug']
  const csv = headers.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'topics_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => { fetchSubjects(); fetchLevels(); loadTopics() })
</script>

<style scoped>
</style>
