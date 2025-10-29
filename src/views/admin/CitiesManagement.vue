<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Cities Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage cities and keep them organized by country & state.
          </p>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" :loading="loading" @click="refresh">Refresh</Button>
          <Button variant="secondary" @click="openBulkCreateModal">Bulk Add Cities</Button>
          <Button variant="primary" @click="openCreateModal">Add City</Button>
        </div>
      </div>


      <div
        class="rounded-xl border p-4 shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex flex-col gap-4">
          <div>
            <h2 class="text-lg font-semibold">Bulk City Status</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Toggle cities under a country or a specific state in one action.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormInput
              v-model="bulkCityToggle.country_id"
              type="select"
              label="Country"
              placeholder="Select country"
              :options="countryOptions"
              @change="handleBulkCountryChange"
            />
            <FormInput
              v-model="bulkCityToggle.state_id"
              type="select"
              label="State (optional)"
              placeholder="All states"
              :options="bulkStateOptions"
              :disabled="!bulkCityToggle.country_id"
              @change="handleBulkStateChange"
            />
            <FormInput
              v-model="bulkCityToggle.status"
              type="select"
              label="Set Status"
              placeholder="Select status"
              :options="statusOptions"
            />
            <div class="flex items-end">
              <Button
                class="w-full"
                :loading="bulkCityLoading"
                :disabled="!bulkCityToggle.country_id"
                @click="toggleCitiesStatus"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        :items="cities"
        :columns="columns"
        :actions="actions"
        :loading="loading"
        :items-per-page="pagination.per_page"
        search-placeholder="Search by city name"
        @search="handleSearch"
        @sort="handleSort"
        @page-change="handlePageChange"
        @action="handleAction"
      >
        <template #column-state="{ item }">
          {{ item.state?.name || 'N/A' }}
        </template>
        <template #column-country="{ item }">
          {{ item.state?.country?.name || 'N/A' }}
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
        :title="modal.mode === 'create' ? 'Add City' : 'Edit City'"
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
            required
            @change="handleFormCountryChange"
            :error="errors.country_id"
          />
          <FormInput
            v-model="form.state_id"
            type="select"
            label="State"
            placeholder="Select state"
            :options="formStateOptions"
            required
            :disabled="!form.country_id"
            :error="errors.state_id"
          />
          <FormInput
            v-model="form.name"
            label="City Name"
            placeholder="Enter city name"
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
            {{ modal.mode === 'create' ? 'Create City' : 'Update City' }}
          </Button>
        </template>
      </Modal>

      <Modal :visible="bulkCreateModal.visible" title="Bulk Add Cities" size="lg" @close="closeBulkCreateModal">
        <div class="space-y-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Select where the cities belong and enter a comma or newline separated list. Each entry will be saved as a
            city.
          </p>
          <FormInput
            v-model="bulkCreateForm.country_id"
            type="select"
            label="Country"
            placeholder="Select country"
            :options="countryOptions"
            :error="bulkCreateErrors.country_id"
            required
            @change="handleBulkCreateCountryChange"
          />
          <FormInput
            v-model="bulkCreateForm.state_id"
            type="select"
            label="State"
            placeholder="Select state"
            :options="bulkCreateStateOptions"
            :disabled="!bulkCreateForm.country_id"
            :error="bulkCreateErrors.state_id"
            required
          />
          <FormInput
            v-model="bulkCreateForm.names"
            type="textarea"
            label="City Names"
            placeholder="e.g. Lagos, Abuja, Port Harcourt"
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
            Add Cities
          </Button>
        </template>
      </Modal>

      <Modal :visible="confirm.visible" title="Delete City" @close="closeConfirm">
        <p>Delete {{ confirm.city?.name }}?</p>
        <template #footer>
          <Button variant="outline" @click="closeConfirm">Cancel</Button>
          <Button variant="danger" :loading="submitting" @click="deleteCity">Delete</Button>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
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

const cities = ref([])
const loading = ref(false)
const submitting = ref(false)
const countryOptions = ref([])
const stateOptions = ref([])
const formStateOptions = ref([])
const bulkStateOptions = ref([])
const bulkCreateStateOptions = ref([])

const pagination = ref({
  page: 1,
  per_page: 100,
  total: 0,
  total_pages: 0,
})

const filters = ref({
  search: '',
  country_id: '',
  state_id: '',
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
  { key: 'name', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'status', label: 'Status' },
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
  city: null,
})

const form = ref({
  id: null,
  country_id: '',
  state_id: '',
  name: '',
  status: 'active',
})

const errors = ref({})
const bulkCreateErrors = ref({})

const bulkCityToggle = ref({
  country_id: '',
  state_id: '',
  status: 'active',
})

const bulkCityLoading = ref(false)
const bulkCreateSubmitting = ref(false)

const bulkCreateForm = ref({
  country_id: '',
  state_id: '',
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

const loadStateOptions = async (target = 'filter', countryId = '') => {
  if (!countryId && target === 'filter') {
    stateOptions.value = []
    filters.value.state_id = ''
    return
  }

  try {
    const response = await locationService.getStateOptions({
      status: 'active',
      country_id: countryId || undefined,
    })
    const mapped = mapToOptions(response)
    if (target === 'form') {
      formStateOptions.value = mapped
    } else if (target === 'bulk') {
      bulkStateOptions.value = mapped
    } else if (target === 'bulk-create') {
      bulkCreateStateOptions.value = mapped
      if (
        bulkCreateForm.value.state_id &&
        !mapped.find((opt) => String(opt.value) === String(bulkCreateForm.value.state_id))
      ) {
        bulkCreateForm.value.state_id = ''
      }
    } else {
      stateOptions.value = mapped
      if (
        filters.value.state_id &&
        !mapped.find((opt) => String(opt.value) === String(filters.value.state_id))
      ) {
        filters.value.state_id = ''
      }
    }
  } catch (error) {
    console.error('Failed to load states:', error)
  }
}

const fetchCities = async () => {
  loading.value = true
  try {
    const response = await locationService.getCities({
      limit: pagination.value.per_page,
      page: pagination.value.page,
      q: filters.value.search || undefined,
      status: filters.value.status || undefined,
      country_id: filters.value.country_id || undefined,
      state_id: filters.value.state_id || undefined,
      sort_field: sort.value.field,
      sort_order: sort.value.order,
    })
    cities.value = response.data || []
    pagination.value = {
      page: response.current_page || 1,
      per_page: response.per_page || pagination.value.per_page,
      total: response.total || cities.value.length,
      total_pages: response.last_page || 1,
    }
  } catch (error) {
    console.error('Failed to fetch cities:', error)
    toast.error('Failed to load cities')
    cities.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchCities()
}

const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleSort = ({ field, order }) => {
  sort.value = { field, order }
  fetchCities()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchCities()
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
    state_id: '',
    name: '',
    status: 'active',
  }
  formStateOptions.value = []
  errors.value = {}
}

const openEditModal = (city) => {
  modal.value = { visible: true, mode: 'edit' }
  form.value = {
    id: city.id,
    country_id: city.state?.country_id ?? city.state?.country?.id ?? '',
    state_id: city.state_id ?? city.state?.id ?? '',
    name: city.name,
    status: city.status,
  }
  errors.value = {}
  if (form.value.country_id) {
    loadStateOptions('form', form.value.country_id).then(() => {
      if (
        form.value.state_id &&
        !formStateOptions.value.find((opt) => String(opt.value) === String(form.value.state_id))
      ) {
        form.value.state_id = ''
      }
    })
  } else {
    formStateOptions.value = []
  }
}

const closeModal = () => {
  modal.value.visible = false
}

const resetBulkCreateForm = () => {
  bulkCreateForm.value = {
    country_id: '',
    state_id: '',
    names: '',
    status: 'active',
  }
  bulkCreateErrors.value = {}
  bulkCreateStateOptions.value = []
}

const openBulkCreateModal = () => {
  resetBulkCreateForm()
  bulkCreateModal.value.visible = true
}

const closeBulkCreateModal = () => {
  bulkCreateModal.value.visible = false
  resetBulkCreateForm()
}

const openDeleteModal = (city) => {
  confirm.value = { visible: true, city }
}

const closeConfirm = () => {
  confirm.value.visible = false
  confirm.value.city = null
}

const handleCountryFilter = (value) => {
  filters.value.country_id = value
  if (value) {
    loadStateOptions('filter', value)
  } else {
    stateOptions.value = []
    filters.value.state_id = ''
  }
  applyFilters()
}

const handleFormCountryChange = (value) => {
  form.value.country_id = value
  form.value.state_id = ''
  if (value) {
    loadStateOptions('form', value)
  } else {
    formStateOptions.value = []
  }
}

const handleBulkCreateCountryChange = (value) => {
  bulkCreateForm.value.country_id = value
  bulkCreateForm.value.state_id = ''
  if (value) {
    loadStateOptions('bulk-create', value)
  } else {
    bulkCreateStateOptions.value = []
  }
}

const handleSubmit = async () => {
  submitting.value = true
  errors.value = {}
  try {
    const payload = {
      state_id: form.value.state_id,
      name: form.value.name,
      status: form.value.status,
    }
    if (modal.value.mode === 'create') {
      await locationService.createCity(payload)
      toast.success('City created successfully')
    } else {
      await locationService.updateCity(form.value.id, payload)
      toast.success('City updated successfully')
    }
    closeModal()
    fetchCities()
  } catch (error) {
    console.error('Failed to save city:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      toast.error('Failed to save city')
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
  if (!bulkCreateForm.value.state_id) {
    bulkCreateErrors.value.state_id = 'State is required'
  }
  if (!entries.length) {
    bulkCreateErrors.value.names = 'Enter at least one city name'
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
      await locationService.createCity({
        state_id: bulkCreateForm.value.state_id,
        name,
        status: bulkCreateForm.value.status,
      })
      successCount++
    } catch (error) {
      console.error('Failed to create city:', name, error)
      failureCount++
    }
  }

  bulkCreateSubmitting.value = false

  if (successCount) {
    const label = successCount === 1 ? 'city' : 'cities'
    toast.success(`Added ${successCount} ${label}`)
    fetchCities()
  }
  if (failureCount) {
    toast.error(`Failed to add ${failureCount} entr${failureCount === 1 ? 'y' : 'ies'}. See console for details.`)
  }
  if (!failureCount) {
    closeBulkCreateModal()
  }
}

const deleteCity = async () => {
  if (!confirm.value.city) return
  submitting.value = true
  try {
    await locationService.deleteCity(confirm.value.city.id)
    toast.success('City deleted successfully')
    closeConfirm()
    fetchCities()
  } catch (error) {
    console.error('Failed to delete city:', error)
    toast.error('Failed to delete city')
  } finally {
    submitting.value = false
  }
}

const refresh = () => {
  fetchCities()
}

const formatStatus = (status) => {
  if (!status) return 'Inactive'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

const handleBulkCountryChange = (value) => {
  bulkCityToggle.value.country_id = value
  bulkCityToggle.value.state_id = ''
  handleCountryFilter(value)
  if (value) {
    loadStateOptions('bulk', value)
  } else {
    bulkStateOptions.value = []
  }
}

const handleBulkStateChange = (value) => {
  bulkCityToggle.value.state_id = value
  filters.value.state_id = value
  applyFilters()
}

const toggleCitiesStatus = async () => {
  if (!bulkCityToggle.value.country_id) {
    toast.error('Select a country to update cities')
    return
  }
  bulkCityLoading.value = true
  try {
    const count = await locationService.bulkUpdateCities({
      countryId: bulkCityToggle.value.country_id,
      stateId: bulkCityToggle.value.state_id || undefined,
      status: bulkCityToggle.value.status || 'inactive',
    })
    toast.success(`Updated ${count} cities`)
    fetchCities()
  } catch (error) {
    console.error('Failed bulk city update:', error)
    const message = error.response?.data?.message || error.message || 'Failed to update cities'
    toast.error(message)
  } finally {
    bulkCityLoading.value = false
  }
}

watch(
  () => modal.value.visible,
  (visible) => {
    if (!visible) {
      formStateOptions.value = []
    }
  },
)

onMounted(async () => {
  await Promise.allSettled([loadCountryOptions(), fetchCities()])
})
</script>
