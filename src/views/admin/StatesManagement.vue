<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">States Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Maintain states/provinces and keep them linked to their countries.
          </p>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" :loading="loading" @click="refresh">Refresh</Button>
          <Button variant="secondary" @click="openBulkCreateModal">Bulk Add States</Button>
          <Button variant="primary" @click="openCreateModal">Add State</Button>
        </div>
      </div>

      <div
        class="rounded-xl border p-4 shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 class="text-lg font-semibold">Bulk State Status</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Toggle every state under a selected country at once.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 md:max-w-3xl">
            <FormInput
              v-model="bulkStateToggle.country_id"
              type="select"
              label="Country"
              placeholder="Select country"
              :options="countryOptions"
              @change="handleBulkCountrySelect"
            />
            <FormInput
              v-model="bulkStateToggle.status"
              type="select"
              label="Set Status"
              placeholder="Choose status"
              :options="statusOptions"
            />
            <div class="flex items-end">
              <Button
                class="w-full"
                :loading="bulkLoading"
                :disabled="!bulkStateToggle.country_id"
                @click="toggleStatesStatus"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        :items="states"
        :columns="columns"
        :actions="actions"
        :loading="loading"
        :items-per-page="pagination.per_page"
        search-placeholder="Search by state name"
        @search="handleSearch"
        @sort="handleSort"
        @page-change="handlePageChange"
        @action="handleAction"
      >
        <template #column-country="{ item }">
          {{ item.country?.name || 'N/A' }}
        </template>

        <template #column-status="{ value }">
          <Badge :label="formatStatus(value)" :variant="value === 'active' ? 'success' : 'secondary'" size="xs" />
        </template>

        <template #column-created_at="{ value }">
          {{ formatDate(value) }}
        </template>
      </DataTable>

      <Modal
        :visible="modal.visible"
        :title="modal.mode === 'create' ? 'Add State/Province' : 'Edit State/Province'"
        size="lg"
        @close="closeModal"
      >
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <FormInput
            v-model="form.country_id"
            type="select"
            label="Country"
            placeholder="Select country"
            :options="countryOptions"
            :error="errors.country_id"
            required
          />
          <FormInput
            v-model="form.name"
            label="State/Province Name"
            placeholder="Enter state name"
            :error="errors.name"
            required
          />
          <FormInput
            v-model="form.status"
            type="select"
            label="Status"
            placeholder="Select status"
            :options="statusOptions"
            :error="errors.status"
          />
        </form>

        <template #footer>
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button variant="primary" :loading="submitting" @click="handleSubmit">
            {{ modal.mode === 'create' ? 'Create State' : 'Update State' }}
          </Button>
        </template>
      </Modal>

      <Modal :visible="bulkCreateModal.visible" title="Bulk Add States/Provinces" size="lg" @close="closeBulkCreateModal">
        <div class="space-y-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Choose a country and enter a comma or newline separated list of state/province names. Each entry will be
            created individually.
          </p>
          <FormInput
            v-model="bulkCreateForm.country_id"
            type="select"
            label="Country"
            placeholder="Select country"
            :options="countryOptions"
            :error="bulkCreateErrors.country_id"
            required
          />
          <FormInput
            v-model="bulkCreateForm.names"
            type="textarea"
            label="State Names"
            placeholder="e.g. Lagos, Abuja, Kano"
            :rows="4"
            :help="'Separate by commas or new lines'"
            :error="bulkCreateErrors.names"
            required
          />
          <FormInput
            v-model="bulkCreateForm.status"
            type="select"
            label="Status"
            placeholder="Select status"
            :options="statusOptions"
            :error="bulkCreateErrors.status"
          />
        </div>

        <template #footer>
          <Button variant="outline" @click="closeBulkCreateModal">Cancel</Button>
          <Button variant="primary" :loading="bulkCreateSubmitting" @click="handleBulkCreateSubmit">
            Add States
          </Button>
        </template>
      </Modal>

      <Modal :visible="confirm.visible" title="Delete State" @close="closeConfirm">
        <p>Delete {{ confirm.state?.name }}? This cannot be undone.</p>
        <template #footer>
          <Button variant="outline" @click="closeConfirm">Cancel</Button>
          <Button variant="danger" :loading="submitting" @click="deleteState">Delete</Button>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useDark } from '@vueuse/core'
import { toast } from 'vue3-toastify'
import AdminLayout from '@/layouts/AdminLayOut.vue'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import FormInput from '@/components/FormInput.vue'
import Badge from '@/components/Badge.vue'
import locationService from '@/services/admin/locationService'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})
void isDark

const states = ref([])
const countryOptions = ref([])
const loading = ref(false)
const submitting = ref(false)
const pagination = ref({
  page: 1,
  per_page: 100,
  total: 0,
  total_pages: 0,
})
const filters = ref({
  search: '',
  country_id: '',
  status: '',
})
const sort = ref({
  field: 'name',
  order: 'asc',
})

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const columns = [
  { key: 'name', label: 'State/Province' },
  { key: 'country', label: 'Country' },
  { key: 'status', label: 'Status' },
  { key: 'cities_count', label: 'Cities' },
  { key: 'created_at', label: 'Created' },
]

const actions = [
  { key: 'edit', label: 'Edit', class: 'text-yellow-600 hover:text-yellow-800' },
  { key: 'delete', label: 'Delete', class: 'text-red-600 hover:text-red-800' },
]

const modal = ref({
  visible: false,
  mode: 'create',
})

const bulkCreateModal = ref({
  visible: false,
})

const confirm = ref({
  visible: false,
  state: null,
})

const bulkStateToggle = ref({
  country_id: '',
  status: 'active',
})

const bulkLoading = ref(false)
const bulkCreateSubmitting = ref(false)

const form = ref({
  id: null,
  country_id: '',
  name: '',
  status: 'active',
})

const errors = ref({})
const bulkCreateErrors = ref({})

const bulkCreateForm = ref({
  country_id: '',
  names: '',
  status: 'active',
})

const mapToOptions = (items = []) =>
  items.map((item) => ({
    value: item.id,
    label: item.name,
  }))

const parseBulkEntries = (value = '') =>
  value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)

const loadCountryOptions = async () => {
  try {
    const response = await locationService.getCountryOptions({ status: 'active' })
    countryOptions.value = mapToOptions(response)
  } catch (error) {
    console.error('Failed to load countries:', error)
  }
}

const fetchStates = async () => {
  loading.value = true
  try {
    const response = await locationService.getStates({
      limit: pagination.value.per_page,
      page: pagination.value.page,
      q: filters.value.search || undefined,
      status: filters.value.status || undefined,
      country_id: filters.value.country_id || undefined,
      sort_field: sort.value.field,
      sort_order: sort.value.order,
    })

    const payload = response.data || []
    states.value = payload.map((state) => ({
      ...state,
      country_id: state.country_id ?? state.country?.id ?? null,
    }))
    pagination.value = {
      page: response.current_page || 1,
      per_page: response.per_page || pagination.value.per_page,
      total: response.total || states.value.length,
      total_pages: response.last_page || 1,
    }
  } catch (error) {
    console.error('Failed to fetch states:', error)
    toast.error('Failed to load states')
    states.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchStates()
}

const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleSort = ({ field, order }) => {
  sort.value = { field, order }
  fetchStates()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchStates()
}

const handleAction = ({ action, item }) => {
  if (action === 'edit') {
    openEditModal(item)
  } else if (action === 'delete') {
    openDeleteModal(item)
  }
}

const openCreateModal = () => {
  modal.value = { visible: true, mode: 'create' }
  form.value = {
    id: null,
    country_id: '',
    name: '',
    status: 'active',
  }
  errors.value = {}
}

const openEditModal = (state) => {
  modal.value = { visible: true, mode: 'edit' }
  form.value = {
    id: state.id,
    country_id: state.country_id ?? state.country?.id ?? '',
    name: state.name,
    status: state.status,
  }
  errors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
}

const resetBulkCreateForm = () => {
  bulkCreateForm.value = {
    country_id: '',
    names: '',
    status: 'active',
  }
  bulkCreateErrors.value = {}
}

const openBulkCreateModal = () => {
  resetBulkCreateForm()
  bulkCreateModal.value.visible = true
}

const closeBulkCreateModal = () => {
  bulkCreateModal.value.visible = false
  resetBulkCreateForm()
}

const openDeleteModal = (state) => {
  confirm.value = { visible: true, state }
}

const closeConfirm = () => {
  confirm.value.visible = false
  confirm.value.state = null
}

const handleSubmit = async () => {
  submitting.value = true
  errors.value = {}
  try {
    const payload = {
      country_id: form.value.country_id,
      name: form.value.name,
      status: form.value.status,
    }
    if (modal.value.mode === 'create') {
      await locationService.createState(payload)
      toast.success('State created successfully')
    } else {
      await locationService.updateState(form.value.id, payload)
      toast.success('State updated successfully')
    }
    closeModal()
    fetchStates()
  } catch (error) {
    console.error('Failed to save state:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      toast.error('Failed to save state')
    }
  } finally {
    submitting.value = false
  }
}

const handleBulkCreateSubmit = async () => {
  bulkCreateErrors.value = {}
  const entries = parseBulkEntries(bulkCreateForm.value.names)

  if (!bulkCreateForm.value.country_id) {
    bulkCreateErrors.value.country_id = 'Country is required'
  }
  if (!entries.length) {
    bulkCreateErrors.value.names = 'Enter at least one state/province'
  }

  if (Object.keys(bulkCreateErrors.value).length) {
    toast.error('Please fix the highlighted bulk add fields')
    return
  }

  bulkCreateSubmitting.value = true
  let successCount = 0
  let failureCount = 0

  for (const name of entries) {
    try {
      await locationService.createState({
        country_id: bulkCreateForm.value.country_id,
        name,
        status: bulkCreateForm.value.status,
      })
      successCount++
    } catch (error) {
      console.error('Failed to create state:', name, error)
      failureCount++
    }
  }

  bulkCreateSubmitting.value = false

  if (successCount) {
    const label = successCount === 1 ? 'state' : 'states'
    toast.success(`Added ${successCount} ${label}`)
    fetchStates()
  }
  if (failureCount) {
    toast.error(`Failed to add ${failureCount} entr${failureCount === 1 ? 'y' : 'ies'}. See console for details.`)
  }
  if (!failureCount) {
    closeBulkCreateModal()
  }
}

const deleteState = async () => {
  if (!confirm.value.state) return
  submitting.value = true
  try {
    await locationService.deleteState(confirm.value.state.id)
    toast.success('State deleted successfully')
    closeConfirm()
    fetchStates()
  } catch (error) {
    console.error('Failed to delete state:', error)
    toast.error('Failed to delete state')
  } finally {
    submitting.value = false
  }
}

const refresh = () => {
  fetchStates()
}

const formatStatus = (status) => {
  if (!status) return 'Inactive'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

const handleBulkCountrySelect = (value) => {
  bulkStateToggle.value.country_id = value
  filters.value.country_id = value
  applyFilters()
}

const toggleStatesStatus = async () => {
  if (!bulkStateToggle.value.country_id) {
    toast.error('Select a country to update states')
    return
  }
  bulkLoading.value = true
  try {
    const count = await locationService.bulkUpdateStatesByCountry(
      bulkStateToggle.value.country_id,
      bulkStateToggle.value.status || 'inactive',
    )
    toast.success(`Updated ${count} states`)
    fetchStates()
  } catch (error) {
    console.error('Failed bulk state update:', error)
    const message = error.response?.data?.message || error.message || 'Failed to update states'
    toast.error(message)
  } finally {
    bulkLoading.value = false
  }
}

onMounted(async () => {
  await Promise.allSettled([loadCountryOptions(), fetchStates()])
})
</script>
