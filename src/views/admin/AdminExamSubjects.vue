<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Exam Subjects</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Map exams to subjects by year and type</p>
        </div>
        <button @click="openCreate" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition">
          <Plus class="w-4 h-4" /> New Mapping
        </button>
      </div>

      <!-- Filters -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
            <select v-model="filters.exam_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All exams</option>
              <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option>
            </select>
            <select v-model="filters.subject_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All subjects</option>
              <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <select v-model="filters.year_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All years</option>
              <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
            </select>
            <select v-model="filters.type" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="">All types</option>
              <option value="objective">Objective</option>
              <option value="theory">Theory</option>
              <option value="subjective">Subjective</option>
              <option value="practical">Practical</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button @click="clearFilters" class="px-3 h-10 rounded border border-gray-300 dark:border-gray-700 text-sm">Clear</button>
            <div class="text-xs text-gray-500">Total: {{ pagination.total }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Exam</th>
                <th class="py-2 pr-4">Subject</th>
                <th class="py-2 pr-4">Year</th>
                <th class="py-2 pr-4">Type</th>
                <th class="py-2 pr-4">Code</th>
                <th class="py-2 pr-4">Duration (min)</th>
                <th class="py-2 pr-4">Price</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="m in items" :key="m.id">
                <td class="py-3 pr-4">{{ m.id }}</td>
                <td class="py-3 pr-4">{{ m.exam?.title || m.exam_title || m.exam_id }}</td>
                <td class="py-3 pr-4">{{ m.subject?.name || m.subject_name || m.subject_id }}</td>
                <td class="py-3 pr-4">{{ m.year?.name || m.year_name || m.year_id }}</td>
                <td class="py-3 pr-4">
                  <span class="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{{ m.type }}</span>
                </td>
                <td class="py-3 pr-4">{{ m.code || '—' }}</td>
                <td class="py-3 pr-4">{{ m.duration || '—' }}</td>
                <td class="py-3 pr-4">{{ formatPrice(m.price) }}</td>
                <td class="py-3 pr-4 space-x-2">
                  <button @click="openEdit(m)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Edit</button>
                  <button @click="confirmDelete(m)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs">Delete</button>
                </td>
              </tr>
              <tr v-if="!loading && (!items || !items.length)">
                <td colspan="8" class="py-6 text-center text-gray-500">No mappings found</td>
              </tr>
              <tr v-if="loading" v-for="i in 5" :key="'sk-'+i">
                <td class="py-3 pr-4" colspan="8"><div class="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
              </tr>
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
              <h3 class="font-semibold">{{ modal.mode === 'create' ? 'New Mapping' : 'Edit Mapping' }}</h3>
              <button @click="closeModal" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-500">Exam</label>
                  <select v-model="form.exam_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select exam</option>
                    <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Subject</label>
                  <select v-model="form.subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select subject</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Year</label>
                  <select v-model="form.year_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select year</option>
                    <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Type</label>
                  <select v-model="form.type" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="objective">Objective</option>
                    <option value="theory">Theory</option>
                    <option value="subjective">Subjective</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Code</label>
                  <input v-model="form.code" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" placeholder="e.g. OBJ-01" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Duration (minutes)</label>
                  <input v-model.number="form.duration" type="number" min="1" step="1" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" placeholder="e.g. 60" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Price</label>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" placeholder="0.00" />
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
const filters = ref({ exam_id: '', subject_id: '', year_id: '', type: '' })

const exams = ref([])
const subjects = ref([])
const years = ref([])

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const form = ref({ id: null, exam_id: '', subject_id: '', year_id: '', type: 'objective', code: '', duration: null, price: null })

async function fetchExams() {
  try {
    const { data } = await api.get('/admin/exams', { params: { limit: 1000 } })
    const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : []))
    exams.value = payload.map(e => ({ id: e.id, title: e.title }))
  } catch {}
}

async function fetchSubjects() {
  try {
    const { data } = await api.get('/admin/subjects', { params: { limit: 1000 } })
    const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : []))
    subjects.value = payload.map(s => ({ id: s.id, name: s.name }))
    subjects.value.sort((a,b) => Number(a.id) - Number(b.id))
  } catch {}
}

async function fetchYears() {
  try {
    const { data } = await api.get('/admin/academic-years', { params: { limit: 1000 } })
    const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.data?.data) ? data.data.data : []))
    years.value = payload.map(y => ({ id: y.id, name: y.name }))
  } catch {}
}

async function loadMappings() {
  loading.value = true
  try {
    const params = { limit: pagination.value.per_page, page: pagination.value.page }
    if (filters.value.exam_id) params.exam_id = filters.value.exam_id
    if (filters.value.subject_id) params.subject_id = filters.value.subject_id
    if (filters.value.year_id) params.year_id = filters.value.year_id
    if (filters.value.type) params.type = filters.value.type

    const { data } = await api.get('/admin/exam-subjects', { params })
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
    toast.error(e?.response?.data?.message || 'Failed to load mappings')
  } finally {
    loading.value = false
  }
}

function applyFilters() { pagination.value.page = 1; loadMappings() }
function clearFilters() { filters.value = { exam_id: '', subject_id: '', year_id: '', type: '' }; pagination.value.page = 1; loadMappings() }
function prevPage() { if (pagination.value.page > 1) { pagination.value.page--; loadMappings() } }
function nextPage() { pagination.value.page++; loadMappings() }

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = { id: null, exam_id: '', subject_id: '', year_id: '', type: 'objective', code: '', duration: null }
  formError.value = ''
}
function openEdit(m) {
  modal.value = { open: true, mode: 'edit' }
  form.value = {
    id: m.id,
    exam_id: m.exam_id || m.exam?.id || '',
    subject_id: m.subject_id || m.subject?.id || '',
    year_id: m.year_id || m.year?.id || '',
    type: m.type || 'objective',
    code: m.code || '',
    duration: m.duration ?? null,
    price: m.price ?? null,
  }
  formError.value = ''
}
function closeModal() { modal.value.open = false }

async function save() {
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      exam_id: form.value.exam_id,
      subject_id: form.value.subject_id,
      year_id: form.value.year_id,
      type: form.value.type,
      code: form.value.code || null,
      duration: form.value.duration ? Number(form.value.duration) : null,
      price: form.value.price !== null && form.value.price !== '' ? Number(form.value.price) : null,
    }
    if (!payload.exam_id || !payload.subject_id || !payload.year_id || !payload.type) {
      formError.value = 'Exam, Subject, Year and Type are required'
      saving.value = false
      return
    }
    if (modal.value.mode === 'create') {
      await api.post('/admin/exam-subjects', payload)
      toast.success('Mapping created')
    } else {
      await api.patch(`/admin/exam-subjects/${form.value.id}`, payload)
      toast.success('Mapping updated')
    }
    closeModal()
    await loadMappings()
  } catch (e) {
    const msg = e?.response?.data?.message
    formError.value = msg || 'Save failed'
    toast.error(formError.value)
  } finally {
    saving.value = false
  }
}

function confirmDelete(m) {
  if (!m?.id) return
  const ok = window.confirm(`Delete mapping #${m.id}? This cannot be undone.`)
  if (!ok) return
  deleteMapping(m.id)
}

async function deleteMapping(id) {
  try {
    await api.delete(`/admin/exam-subjects/${id}`)
    toast.success('Mapping deleted')
    if (items.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await loadMappings()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}

onMounted(async () => { await Promise.all([fetchExams(), fetchSubjects(), fetchYears()]); loadMappings() })

function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '—'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2 }).format(num)
  } catch {
    return num.toFixed(2)
  }
}
</script>

<style scoped>
</style>
