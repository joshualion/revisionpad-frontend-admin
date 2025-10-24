<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Exams</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Create and manage exams</p>
        </div>
        <button @click="openCreate" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition">
          <Plus class="w-4 h-4" /> New Exam
        </button>
      </div>

      <!-- Filters -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="flex flex-col sm:flex-row gap-2">
            <input v-model="filters.q" @keyup.enter="applyFilters" type="text" placeholder="Search title or description" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />

            <select v-model="filters.exam_subcategory_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-[14rem]">
              <option value="">All subcategories</option>
              <option v-for="s in subcategories" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>

            <select v-model="filters.status" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-[10rem]">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select v-model="filters.visibility" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-[10rem]">
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="draft">Draft</option>
            </select>

            <button @click="clearFilters" class="px-3 h-10 rounded border border-gray-300 dark:border-gray-700 text-sm">Clear</button>
          </div>
          <div class="text-xs text-gray-500">Total: {{ pagination.total }}</div>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <!-- Make table scroll on small screens both directions -->
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Image</th>
                <th class="py-2 pr-4">Title</th>
                <th class="py-2 pr-4">Description</th>
                <th class="py-2 pr-4">Subcategory</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Visibility</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="e in items" :key="e.id">
                <td class="py-3 pr-4">{{ e.id }}</td>
                <td class="py-3 pr-4">
                  <div class="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                    <img v-if="e.image" :src="imageUrl(e.image)" alt="Cover" class="w-10 h-10 object-cover" />
                    <span v-else class="text-[10px] text-gray-400">No image</span>
                  </div>
                </td>
                <td class="py-3 pr-4 font-medium">{{ e.title }}</td>
                <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ e.description }}</td>
                <td class="py-3 pr-4">{{ e.subcategory?.name || '—' }}</td>
                <td class="py-3 pr-4">
                  <span class="px-2 py-0.5 rounded text-xs" :class="(e.status || 'inactive') === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'">{{ e.status || 'inactive' }}</span>
                </td>
                <td class="py-3 pr-4">
                  <span class="px-2 py-0.5 rounded text-xs"
                        :class="visibilityPill(e.visibility)">{{ e.visibility || 'draft' }}</span>
                </td>
                <td class="py-3 pr-4 space-x-2">
                  <button @click="openEdit(e)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Edit</button>
                  <button @click="confirmDelete(e)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 text-xs">Delete</button>
                </td>
              </tr>

              <tr v-if="!loading && (!items || !items.length)">
                <td colspan="8" class="py-4 text-center text-gray-500">No exams found</td>
              </tr>

              <tr v-if="loading" v-for="i in 5" :key="'s'+i">
                <td class="py-3 pr-4"><div class="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
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

      <!-- Modal -->
      <transition name="fade">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
          <div class="relative w-full max-w-xl rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">{{ modal.mode === 'create' ? 'Create Exam' : 'Edit Exam' }}</h3>
              <button @click="closeModal" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-white"><X class="w-4 h-4" /></button>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-500">Title</label>
                  <input v-model="form.title" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Subcategory</label>
                  <select v-model="form.exam_subcategory_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">None</option>
                    <option v-for="s in subcategories" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-500">Description</label>
                  <textarea v-model="form.description" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Status</label>
                  <select v-model="form.status" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Visibility</label>
                  <select v-model="form.visibility" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs text-gray-500">Image</label>
                  <input type="file" accept="image/*" @change="onImageSelect" class="block w-full text-sm" />
                  <div class="mt-2 flex items-center gap-3">
                    <div class="w-16 h-16 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                      <img v-if="previewUrl || form.image" :src="previewUrl || imageUrl(form.image)" alt="Preview" class="w-16 h-16 object-cover" />
                      <span v-else class="text-[10px] text-gray-400">No image</span>
                    </div>
                    <button v-if="previewUrl" @click="clearImage" class="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Clear</button>
                  </div>
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
const subcategories = ref([])
const pagination = ref({ page: 1, per_page: 20, total: 0 })
const filters = ref({ q: '', exam_subcategory_id: '', status: '', visibility: '' })

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const form = ref({ id: null, exam_subcategory_id: '', title: '', description: '', status: 'active', visibility: 'public', image: '' })
const imageFile = ref(null)
const previewUrl = ref('')

function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_BACKEND_URL || ''
  return `${base}/storage/${path}`
}

async function fetchSubcategories() {
  try {
    const { data } = await api.get('/admin/exam-subcategories', { params: { limit: 1000 } })
    const payload = data?.data || data || []
    subcategories.value = Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : [])
  } catch { /* ignore */ }
}

async function loadExams() {
  loading.value = true
  try {
    const params = { limit: pagination.value.per_page, page: pagination.value.page }
    if (filters.value.q) params.q = filters.value.q
    if (filters.value.exam_subcategory_id) params.exam_subcategory_id = filters.value.exam_subcategory_id
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.visibility) params.visibility = filters.value.visibility

    const { data } = await api.get('/admin/exams', { params })
    const payload = data?.data && data?.meta ? { data: data.data, meta: data.meta } : data
    if (Array.isArray(payload?.data)) {
      items.value = payload.data
      pagination.value.total = payload?.meta?.total ?? payload?.total ?? 0
      pagination.value.per_page = payload?.meta?.per_page ?? pagination.value.per_page
    } else if (Array.isArray(data?.data)) {
      items.value = data.data
      pagination.value.total = data?.meta?.total ?? 0
      pagination.value.per_page = data?.meta?.per_page ?? pagination.value.per_page
    } else if (data?.data && Array.isArray(data.data.data)) {
      items.value = data.data.data
      pagination.value.total = data.data.total
      pagination.value.per_page = data.data.per_page
    } else if (data && Array.isArray(data.data)) {
      items.value = data.data
      pagination.value.total = data.total ?? items.value.length
    } else if (data && Array.isArray(data)) {
      items.value = data
      pagination.value.total = data.length
    } else {
      items.value = []
      pagination.value.total = 0
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to load exams')
  } finally {
    loading.value = false
  }
}

function applyFilters() { pagination.value.page = 1; loadExams() }
function clearFilters() {
  filters.value.q = ''
  filters.value.exam_subcategory_id = ''
  filters.value.status = ''
  filters.value.visibility = ''
  pagination.value.page = 1
  loadExams()
}
function prevPage() { if (pagination.value.page > 1) { pagination.value.page--; loadExams() } }
function nextPage() { pagination.value.page++; loadExams() }

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = { id: null, exam_subcategory_id: '', title: '', description: '', status: 'active', visibility: 'public', image: '' }
  imageFile.value = null
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
  formError.value = ''
}

function openEdit(row) {
  modal.value = { open: true, mode: 'edit' }
  form.value = { id: row.id, exam_subcategory_id: row.exam_subcategory_id || row.subcategory?.id || '', title: row.title || '', description: row.description || '', status: row.status || 'inactive', visibility: row.visibility || 'draft', image: row.image || '' }
  imageFile.value = null
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
  formError.value = ''
}

function closeModal() { modal.value.open = false }

function onImageSelect(e) {
  const f = e?.target?.files?.[0]
  imageFile.value = f || null
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
  if (imageFile.value) { previewUrl.value = URL.createObjectURL(imageFile.value) }
}

function clearImage() {
  imageFile.value = null
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = '' }
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (!form.value.title) {
      formError.value = 'Title is required'
      saving.value = false
      return
    }
    const fd = new FormData()
    if (form.value.exam_subcategory_id) fd.append('exam_subcategory_id', form.value.exam_subcategory_id)
    fd.append('title', form.value.title)
    if (form.value.description) fd.append('description', form.value.description)
    if (form.value.status) fd.append('status', form.value.status)
    if (form.value.visibility) fd.append('visibility', form.value.visibility)
    if (imageFile.value instanceof File) fd.append('image', imageFile.value)

    if (modal.value.mode === 'create') {
      await api.post('/admin/exams', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Exam created')
    } else {
      fd.append('_method', 'PATCH')
      await api.post(`/admin/exams/${form.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Exam updated')
    }
    closeModal()
    await loadExams()
  } catch (e) {
    const msg = e?.response?.data?.message || 'Save failed'
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

function visibilityPill(v) {
  const vv = (v || 'draft').toLowerCase()
  switch (vv) {
    case 'public': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'private': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    default: return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  }
}

function confirmDelete(row) {
  if (!row?.id) return
  if (!confirm('Delete this exam?')) return
  deleteExam(row.id)
}

async function deleteExam(id) {
  try {
    await api.delete(`/admin/exams/${id}`)
    toast.success('Exam deleted')
    await loadExams()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}

onMounted(async () => {
  await fetchSubcategories()
  await loadExams()
})
</script>

<style scoped>
</style>

