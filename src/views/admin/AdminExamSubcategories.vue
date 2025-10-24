<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Exam Subcategories</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Create and manage exam subcategories</p>
        </div>
        <button @click="openCreate" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition">
          <Plus class="w-4 h-4" /> New Subcategory
        </button>
      </div>

      <!-- Filters -->
      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="flex flex-col sm:flex-row gap-2">
            <input v-model="filters.q" @keyup.enter="applyFilters" type="text" placeholder="Search name or description" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
            <select v-model="filters.exam_category_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-[14rem]">
              <option value="">All categories</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filters.status" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-[10rem]">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                <th class="py-2 pr-4">Name</th>
                <th class="py-2 pr-4">Description</th>
                <th class="py-2 pr-4">Slug</th>
                <th class="py-2 pr-4">Category</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="r in items" :key="r.id">
                <td class="py-3 pr-4">{{ r.id }}</td>
                <td class="py-3 pr-4 font-medium">{{ r.name }}</td>
                <td class="py-3 pr-4 text-gray-600 dark:text-gray-300">{{ r.description }}</td>
                <td class="py-3 pr-4 text-gray-500">{{ r.slug }}</td>
                <td class="py-3 pr-4">{{ r.category?.name || '—' }}</td>
                <td class="py-3 pr-4">
                  <span class="px-2 py-0.5 rounded text-xs"
                        :class="(r.status || 'inactive') === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'">
                    {{ r.status || 'inactive' }}
                  </span>
                </td>
                <td class="py-3 pr-4 space-x-2">
                  <button @click="openEdit(r)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Edit</button>
                  <button @click="confirmDelete(r)" class="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs">Delete</button>
                </td>
              </tr>
              <tr v-if="!loading && (!items || !items.length)">
                <td colspan="7" class="py-6 text-center text-gray-500">No subcategories found</td>
              </tr>
              <tr v-if="loading" v-for="i in 5" :key="'sk-'+i">
                <td class="py-3 pr-4"><div class="h-3 w-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
                <td class="py-3 pr-4"><div class="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td>
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

      <!-- Create/Edit Modal -->
      <transition name="fade">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-lg rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">{{ modal.mode === 'create' ? 'New Subcategory' : 'Edit Subcategory' }}</h3>
              <button @click="closeModal" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Category</label>
                <select v-model="form.exam_category_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                  <option value="">Select category</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Name</label>
                <input v-model="form.name" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Description</label>
                <textarea v-model="form.description" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Slug (optional)</label>
                <input v-model="form.slug" type="text" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Status</label>
                <select v-model="form.status" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
const categories = ref([])
const pagination = ref({ page: 1, per_page: 20, total: 0 })
const filters = ref({ q: '', exam_category_id: '', status: '' })

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const form = ref({ id: null, exam_category_id: '', name: '', description: '', slug: '', status: 'active' })

async function fetchCategories() {
  try {
    const { data } = await api.get('/admin/exam-categories', { params: { limit: 1000 } })
    if (data?.data?.data) {
      categories.value = data.data.data
    } else if (Array.isArray(data?.data)) {
      categories.value = data.data
    } else if (Array.isArray(data)) {
      categories.value = data
    } else {
      categories.value = []
    }
  } catch { /* ignore */ }
}

async function loadSubcategories() {
  loading.value = true
  try {
    const params = {
      limit: pagination.value.per_page,
      page: pagination.value.page,
    }
    if (filters.value.q) params.q = filters.value.q
    if (filters.value.exam_category_id) params.exam_category_id = filters.value.exam_category_id
    if (filters.value.status) params.status = filters.value.status
    const { data } = await api.get('/admin/exam-subcategories', { params })
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
    if (Array.isArray(items.value)) {
      items.value.sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0))
    }
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to load subcategories')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.value.page = 1
  loadSubcategories()
}
function clearFilters() {
  filters.value.q = ''
  filters.value.exam_category_id = ''
  filters.value.status = ''
  pagination.value.page = 1
  loadSubcategories()
}
function prevPage() { if (pagination.value.page > 1) { pagination.value.page--; loadSubcategories() } }
function nextPage() { pagination.value.page++; loadSubcategories() }

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = { id: null, exam_category_id: '', name: '', description: '', slug: '', status: 'active' }
  formError.value = ''
}
function openEdit(row) {
  modal.value = { open: true, mode: 'edit' }
  form.value = { id: row.id, exam_category_id: row.exam_category_id || row.category?.id || '', name: row.name || '', description: row.description || '', slug: row.slug || '', status: row.status || 'inactive' }
  formError.value = ''
}
function closeModal() { modal.value.open = false }

async function save() {
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      exam_category_id: form.value.exam_category_id,
      name: form.value.name,
      description: form.value.description || null,
      slug: form.value.slug || null,
      status: form.value.status || null,
    }
    if (modal.value.mode === 'create') {
      await api.post('/admin/exam-subcategories', payload)
      toast.success('Subcategory created')
    } else {
      await api.patch(`/admin/exam-subcategories/${form.value.id}`, payload)
      toast.success('Subcategory updated')
    }
    closeModal()
    await loadSubcategories()
  } catch (e) {
    const msg = e?.response?.data?.message
    formError.value = msg || 'Save failed'
    toast.error(formError.value)
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  if (!row?.id) return
  const ok = window.confirm(`Delete subcategory "${row.name}"? This cannot be undone.`)
  if (!ok) return
  deleteRow(row.id)
}

async function deleteRow(id) {
  try {
    await api.delete(`/admin/exam-subcategories/${id}`)
    toast.success('Subcategory deleted')
    if (items.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await loadSubcategories()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}

onMounted(() => { fetchCategories(); loadSubcategories() })
</script>

<style scoped>
</style>
