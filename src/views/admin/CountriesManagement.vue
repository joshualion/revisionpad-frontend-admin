<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Countries Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage available countries, currencies, and activation status.
          </p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" :loading="loading" @click="refresh">Refresh</Button>
          <Button variant="primary" @click="openCreateModal">Add Country</Button>
        </div>
      </div>

      <DataTable
        :items="countries"
        :columns="columns"
        :actions="actions"
        :loading="loading"
        :items-per-page="pagination.per_page"
        search-placeholder="Search by name, ISO, or currency"
        filter-label="status"
        :filter-options="statusFilterOptions"
        @search="handleSearch"
        @filter="handleFilter"
        @sort="handleSort"
        @page-change="handlePageChange"
        @action="handleAction"
      >
        <template #column-status="{ value }">
          <Badge :label="formatStatus(value)" :variant="value === 'active' ? 'success' : 'secondary'" size="xs" />
        </template>

        <template #column-created_at="{ value }">
          {{ formatDate(value) }}
        </template>
      </DataTable>

      <Modal
        :visible="modal.visible"
        :title="modal.mode === 'create' ? 'Add Country' : 'Edit Country'"
        size="lg"
        @close="closeModal"
      >
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <FormInput v-model="form.name" label="Country Name" placeholder="Enter country name" :error="errors.name" required />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="form.iso_code"
              label="ISO Code"
              placeholder="e.g. NG"
              :error="errors.iso_code"
              required
            />
            <FormInput
              v-model="form.currency_code"
              label="Currency Code"
              placeholder="e.g. NGN"
              :error="errors.currency_code"
              required
            />
          </div>
          <FormInput
            v-model="form.currency"
            label="Currency"
            placeholder="Naira"
            :error="errors.currency"
            required
          />
          <FormInput
            v-model="form.status"
            type="select"
            label="Status"
            placeholder="Select status"
            :options="statusFilterOptions"
            :error="errors.status"
          />
        </form>

        <template #footer>
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button variant="primary" :loading="submitting" @click="handleSubmit">
            {{ modal.mode === 'create' ? 'Create Country' : 'Update Country' }}
          </Button>
        </template>
      </Modal>

      <Modal :visible="confirm.visible" title="Delete Country" @close="closeConfirm">
        <p>Are you sure you want to delete {{ confirm.country?.name }}?</p>
        <template #footer>
          <Button variant="outline" @click="closeConfirm">Cancel</Button>
          <Button variant="danger" :loading="submitting" @click="deleteCountry">Delete</Button>
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

const countries = ref([])
const loading = ref(false)
const submitting = ref(false)
const pagination = ref({
  page: 1,
  per_page: 50,
  total: 0,
  total_pages: 0,
})
const filters = ref({
  search: '',
  status: '',
})
const sort = ref({
  field: 'name',
  order: 'asc',
})

const columns = [
  { key: 'name', label: 'Country' },
  { key: 'iso_code', label: 'ISO' },
  { key: 'currency', label: 'Currency' },
  { key: 'currency_code', label: 'Currency Code' },
  { key: 'status', label: 'Status' },
  { key: 'states_count', label: 'States' },
  { key: 'created_at', label: 'Created' },
]

const actions = [
  { key: 'edit', label: 'Edit', class: 'text-yellow-600 hover:text-yellow-800' },
  { key: 'delete', label: 'Delete', class: 'text-red-600 hover:text-red-800' },
]

const statusFilterOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const modal = ref({
  visible: false,
  mode: 'create',
})

const confirm = ref({
  visible: false,
  country: null,
})

const form = ref({
  name: '',
  iso_code: '',
  currency: '',
  currency_code: '',
  status: 'active',
})

const errors = ref({})

const resetForm = () => {
  form.value = {
    name: '',
    iso_code: '',
    currency: '',
    currency_code: '',
    status: 'active',
  }
  errors.value = {}
}

const fetchCountries = async () => {
  loading.value = true
  try {
    const response = await locationService.getCountries({
      limit: pagination.value.per_page,
      page: pagination.value.page,
      q: filters.value.search || undefined,
      status: filters.value.status || undefined,
      sort_field: sort.value.field,
      sort_order: sort.value.order,
    })

    countries.value = response.data || []
    pagination.value = {
      page: response.current_page || 1,
      per_page: response.per_page || pagination.value.per_page,
      total: response.total || countries.value.length,
      total_pages: response.last_page || 1,
    }
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    toast.error('Failed to load countries')
    countries.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchCountries()
}

const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleFilter = (value) => {
  filters.value.status = value
  applyFilters()
}

const handleSort = ({ field, order }) => {
  sort.value = { field, order }
  fetchCountries()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  fetchCountries()
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
  resetForm()
}

const openEditModal = (country) => {
  modal.value = { visible: true, mode: 'edit' }
  form.value = {
    id: country.id,
    name: country.name,
    iso_code: country.iso_code,
    currency: country.currency,
    currency_code: country.currency_code,
    status: country.status,
  }
  errors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
  resetForm()
}

const openDeleteModal = (country) => {
  confirm.value = { visible: true, country }
}

const closeConfirm = () => {
  confirm.value.visible = false
  confirm.value.country = null
}

const handleSubmit = async () => {
  submitting.value = true
  errors.value = {}
  try {
    const payload = {
      name: form.value.name,
      iso_code: form.value.iso_code,
      currency: form.value.currency,
      currency_code: form.value.currency_code,
      status: form.value.status,
    }

    if (modal.value.mode === 'create') {
      await locationService.createCountry(payload)
      toast.success('Country created successfully')
    } else {
      await locationService.updateCountry(form.value.id, payload)
      toast.success('Country updated successfully')
    }
    closeModal()
    fetchCountries()
  } catch (error) {
    console.error('Failed to save country:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      toast.error('Failed to save country')
    }
  } finally {
    submitting.value = false
  }
}

const deleteCountry = async () => {
  if (!confirm.value.country) return
  submitting.value = true
  try {
    await locationService.deleteCountry(confirm.value.country.id)
    toast.success('Country deleted successfully')
    closeConfirm()
    fetchCountries()
  } catch (error) {
    console.error('Failed to delete country:', error)
    toast.error('Failed to delete country')
  } finally {
    submitting.value = false
  }
}

const refresh = () => {
  fetchCountries()
}

const formatStatus = (status) => {
  if (!status) return 'Inactive'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

onMounted(() => {
  fetchCountries()
})
</script>
