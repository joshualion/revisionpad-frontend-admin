<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Administrators Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage administrator accounts and access levels
          </p>
        </div>
        <div class="flex gap-2">
          <Button @click="refresh" :loading="loading" variant="outline"> Refresh </Button>
          <Button @click="openCreateModal" variant="primary"> Add Administrator </Button>
        </div>
      </div>

      <!-- Administrators Table -->
      <div
        class="rounded-xl border shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <DataTable
          :items="administrators"
          :columns="columns"
          :actions="actions"
          :loading="loading"
          search-placeholder="Search by name, email, or username"
          filter-label="access level"
          :filter-options="accessLevelFilterOptions"
          :show-bulk-actions="true"
          @search="handleSearch"
          @filter="handleFilter"
          @sort="handleSort"
          @page-change="handlePageChange"
          @action="handleAction"
          @bulk-delete="handleBulkDelete"
        >
          <!-- Custom column templates -->
          <template #column-name="{ item }">
            <UserProfileCard
              :user="item"
              show-actions
              @view="viewAdministrator"
              @edit="editAdministrator"
              @delete="deleteAdministratorConfirm"
            />
          </template>

          <template #column-access_level="{ item }">
            <Badge
              :label="getAccessLevelLabel(item.access_level)"
              :variant="getAccessLevelVariant(item.access_level)"
              size="sm"
            />
          </template>

          <template #column-online="{ item }">
            <OnlineStatusIndicator :online="item.online" :last-activity="item.last_activity" />
          </template>

          <template #column-created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </DataTable>
      </div>

      <!-- Create/Edit/View Administrator Modal -->
      <Modal
        :visible="modal.visible"
        :title="
          modal.mode === 'create'
            ? 'Add New Administrator'
            : modal.mode === 'edit'
              ? 'Edit Administrator'
              : 'Administrator Details'
        "
        size="xl"
        @close="closeModal"
      >
        <UserForm
          v-if="modal.mode !== 'view'"
          role="administrator"
          :mode="modal.mode"
          :initial-data="modal.administrator"
          :errors="formErrors"
          @submit="handleFormSubmit"
          @change="handleFormChange"
        />

        <!-- View Mode: Display administrator details -->
        <div v-else-if="modal.administrator" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Name</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.administrator.name || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Email</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.administrator.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Username</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.administrator.username || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Phone</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.administrator.phone || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Access Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Access Information
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Access Level</label
                  >
                  <Badge
                    :label="getAccessLevelLabel(modal.administrator.access_level)"
                    :variant="getAccessLevelVariant(modal.administrator.access_level)"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Role</label
                  >
                  <RoleBadge :role="modal.administrator.role" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Permissions</label
                  >
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ getPermissionsDescription(modal.administrator.access_level) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Account Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Status</label
                >
                <Badge
                  :label="modal.administrator.online ? 'Online' : 'Offline'"
                  :variant="modal.administrator.online ? 'success' : 'default'"
                  size="sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Joined</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{ formatDate(modal.administrator.created_at) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Last Activity</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{
                    modal.administrator.last_activity
                      ? formatDate(modal.administrator.last_activity)
                      : 'Never'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <Button @click="closeModal" variant="outline"> Close </Button>
          <Button
            v-if="modal.mode === 'view'"
            @click="editAdministrator(modal.administrator)"
            variant="primary"
          >
            Edit Administrator
          </Button>
          <template v-else>
            <Button @click="closeModal" variant="outline"> Cancel </Button>
            <Button @click="submitForm" :loading="submitting" variant="primary">
              {{ modal.mode === 'create' ? 'Add Administrator' : 'Update Administrator' }}
            </Button>
          </template>
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :visible="deleteModal.visible" title="Confirm Delete" @close="closeDeleteModal">
        <div class="space-y-4">
          <p>Are you sure you want to delete this administrator?</p>
          <div v-if="deleteModal.administrator" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p class="font-semibold">
              {{ deleteModal.administrator.name || deleteModal.administrator.email }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ deleteModal.administrator.email }}
            </p>
          </div>
          <p class="text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
        </div>

        <template #footer>
          <Button @click="closeDeleteModal" variant="outline"> Cancel </Button>
          <Button @click="confirmDelete" :loading="deleting" variant="danger">
            Delete Administrator
          </Button>
        </template>
      </Modal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDark } from '@vueuse/core'
import AdminLayout from '@/layouts/AdminLayOut.vue'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import UserForm from '@/components/admin/users/UserForm.vue'
import UserProfileCard from '@/components/admin/users/UserProfileCard.vue'
import Badge from '@/components/Badge.vue'
import OnlineStatusIndicator from '@/components/admin/users/OnlineStatusIndicator.vue'
import { useAdministratorsManagement } from '@/composables/useAdministratorsManagement'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const {
  loading,
  administrators,
  filters,
  fetchAdministrators,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator,
  getAdministratorDetails,
  applyFilters,
  changePage,
  changeSort,
  refresh,
} = useAdministratorsManagement()

// Modal states
const modal = ref({
  visible: false,
  mode: 'create', // 'create' or 'edit'
  administrator: null,
})

const deleteModal = ref({
  visible: false,
  administrator: null,
})

const formErrors = ref({})
const submitting = ref(false)
const deleting = ref(false)

// Table configuration
const columns = [
  { key: 'name', label: 'Administrator' },
  { key: 'access_level', label: 'Access Level' },
  { key: 'online', label: 'Status' },
  { key: 'created_at', label: 'Joined' },
]

const actions = [
  { key: 'view', label: 'View', class: 'text-blue-600 hover:text-blue-800' },
  { key: 'edit', label: 'Edit', class: 'text-yellow-600 hover:text-yellow-800' },
  { key: 'delete', label: 'Delete', class: 'text-red-600 hover:text-red-800' },
]

const accessLevelFilterOptions = [
  { value: 'full', label: 'Full Access' },
  { value: 'limited', label: 'Limited Access' },
  { value: 'read-only', label: 'Read Only' },
]

// Event handlers
const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleFilter = (accessLevel) => {
  filters.value.access_level = accessLevel
  applyFilters()
}

const handleSort = ({ field, order }) => {
  changeSort(field, order)
}

const handlePageChange = (page) => {
  changePage(page)
}

const handleAction = async ({ action, item }) => {
  switch (action) {
    case 'view':
      await viewAdministrator(item)
      break
    case 'edit':
      await editAdministrator(item)
      break
    case 'delete':
      deleteAdministratorConfirm(item)
      break
  }
}

const handleBulkDelete = async (ids) => {
  if (confirm(`Are you sure you want to delete ${ids.length} administrators?`)) {
    try {
      for (const id of ids) {
        await deleteAdministrator(id)
      }
    } catch {
      // Error already handled in composable
    }
  }
}

// Modal handlers
const openCreateModal = () => {
  modal.value = {
    visible: true,
    mode: 'create',
    administrator: null,
  }
  formErrors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
  modal.value.administrator = null
  formErrors.value = {}
}

const handleFormChange = () => {
  // Handle form changes if needed
}

const submitForm = async () => {
  submitting.value = true
  try {
    if (modal.value.mode === 'create') {
      await createAdministrator(modal.value.administrator)
    } else {
      await updateAdministrator(modal.value.administrator.id, modal.value.administrator)
    }
    closeModal()
  } catch (error) {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
    }
  } finally {
    submitting.value = false
  }
}

const handleFormSubmit = (formData) => {
  modal.value.administrator = formData
  submitForm()
}

// Administrator actions
const viewAdministrator = async (administrator) => {
  try {
    const administratorDetails = await getAdministratorDetails(administrator.id)
    // Show detailed view modal
    modal.value = {
      visible: true,
      mode: 'view',
      administrator: administratorDetails,
    }
  } catch {
    // Error already handled
  }
}

const editAdministrator = async (administrator) => {
  try {
    const administratorDetails = await getAdministratorDetails(administrator.id)
    modal.value = {
      visible: true,
      mode: 'edit',
      administrator: administratorDetails,
    }
    formErrors.value = {}
  } catch {
    // Error already handled
  }
}

const deleteAdministratorConfirm = (administrator) => {
  deleteModal.value = {
    visible: true,
    administrator,
  }
}

const closeDeleteModal = () => {
  deleteModal.value.visible = false
  deleteModal.value.administrator = null
}

const confirmDelete = async () => {
  if (!deleteModal.value.administrator) return

  deleting.value = true
  try {
    await deleteAdministrator(deleteModal.value.administrator.id)
    closeDeleteModal()
  } catch {
    // Error already handled
  } finally {
    deleting.value = false
  }
}

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const getAccessLevelLabel = (level) => {
  switch (level) {
    case 'full':
      return 'Full Access'
    case 'limited':
      return 'Limited Access'
    case 'read-only':
      return 'Read Only'
    default:
      return level || 'Unknown'
  }
}

const getAccessLevelVariant = (level) => {
  switch (level) {
    case 'full':
      return 'danger'
    case 'limited':
      return 'warning'
    case 'read-only':
      return 'info'
    default:
      return 'default'
  }
}

const getPermissionsDescription = (level) => {
  switch (level) {
    case 'full':
      return 'Full administrative access to all system features and settings'
    case 'limited':
      return 'Limited access to user management and basic administrative functions'
    case 'read-only':
      return 'Read-only access to view system data and reports'
    default:
      return 'Unknown access level'
  }
}

// Initialize
onMounted(() => {
  fetchAdministrators()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
