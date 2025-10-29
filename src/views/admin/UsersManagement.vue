<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Users Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage all users across different roles
          </p>
        </div>
        <div class="flex gap-2">
          <Button @click="refresh" :loading="loading" variant="outline"> Refresh </Button>
          <Button @click="openCreateModal" variant="primary"> Create User </Button>
        </div>
      </div>

      <!-- Users Table -->
      <div
        class="rounded-xl border shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <DataTable
          :items="users"
          :columns="columns"
          :actions="actions"
          :loading="loading"
          search-placeholder="Search by name, email, or username"
          filter-label="role"
          :filter-options="roleFilterOptions"
          :show-bulk-actions="true"
          @search="handleSearch"
          @filter="handleFilter"
          @sort="handleSort"
          @page-change="handlePageChange"
          @action="handleAction"
          @bulk-delete="handleBulkDelete"
        >
          <!-- Custom column templates -->
          <template #column-role="{ item }">
            <RoleBadge :role="item.role" />
          </template>

          <template #column-online="{ item }">
            <OnlineStatusIndicator :online="item.online" :last-activity="item.last_activity" />
          </template>

          <template #column-created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </DataTable>
      </div>

      <!-- Create/Edit User Modal -->
      <Modal
        :visible="modal.visible"
        :title="modal.mode === 'create' ? 'Create New User' : 'Edit User'"
        size="xl"
        @close="closeModal"
      >
        <div
          v-if="modal.mode === 'create'"
          class="mb-6 p-3 rounded-lg border"
          :class="isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'"
        >
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Role</p>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in roleOptions"
              :key="option.value"
              size="sm"
              :variant="selectedRole === option.value ? 'primary' : 'outline'"
              @click.prevent="selectRole(option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <UserForm
          :key="`${selectedRole}-${modal.mode}-${modal.user?.id || 'new'}`"
          :role="selectedRole"
          :mode="modal.mode"
          :initial-data="modal.user"
          :errors="formErrors"
          @submit="handleFormSubmit"
          @change="handleFormChange"
        />

        <template #footer>
          <Button @click="closeModal" variant="outline"> Cancel </Button>
          <Button @click="submitForm" :loading="submitting" variant="primary">
            {{ modal.mode === 'create' ? 'Create User' : 'Update User' }}
          </Button>
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :visible="deleteModal.visible" title="Confirm Delete" @close="closeDeleteModal">
        <div class="space-y-4">
          <p>Are you sure you want to delete this user?</p>
          <div v-if="deleteModal.user" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p class="font-semibold">{{ deleteModal.user.name || deleteModal.user.email }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ deleteModal.user.email }}</p>
          </div>
          <p class="text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
        </div>

        <template #footer>
          <Button @click="closeDeleteModal" variant="outline"> Cancel </Button>
          <Button @click="confirmDelete" :loading="deleting" variant="danger"> Delete User </Button>
        </template>
      </Modal>

      <UserDetailsModal
        :visible="detailsModal.visible"
        :user="detailsModal.user"
        @close="closeDetailsModal"
        @edit="editUser"
      />
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
import RoleBadge from '@/components/admin/users/RoleBadge.vue'
import OnlineStatusIndicator from '@/components/admin/users/OnlineStatusIndicator.vue'
import UserDetailsModal from '@/components/admin/users/UserDetailsModal.vue'
import { useUsersManagement } from '@/composables/useUsersManagement'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const {
  loading,
  users,
  filters,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUserDetails,
  applyFilters,
  changePage,
  changeSort,
  refresh,
} = useUsersManagement()

// Modal states
const modal = ref({
  visible: false,
  mode: 'create', // 'create' or 'edit'
  user: null,
})

const deleteModal = ref({
  visible: false,
  user: null,
})

const selectedRole = ref('student')
const formErrors = ref({})
const submitting = ref(false)
const deleting = ref(false)
const detailsModal = ref({
  visible: false,
  user: null,
})

// Table configuration
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'online', label: 'Status' },
  { key: 'created_at', label: 'Created' },
]

const actions = [
  { key: 'view', label: 'View', class: 'text-blue-600 hover:text-blue-800' },
  { key: 'edit', label: 'Edit', class: 'text-yellow-600 hover:text-yellow-800' },
  { key: 'delete', label: 'Delete', class: 'text-red-600 hover:text-red-800' },
]

const roleFilterOptions = [
  { value: 'student', label: 'Student' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'examiner', label: 'Examiner' },
]

const roleOptions = roleFilterOptions

// Event handlers
const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleFilter = (role) => {
  filters.value.role = role
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
      await viewUser(item)
      break
    case 'edit':
      await editUser(item)
      break
    case 'delete':
      deleteUserConfirm(item)
      break
  }
}

const handleBulkDelete = async (ids) => {
  if (confirm(`Are you sure you want to delete ${ids.length} users?`)) {
    try {
      await bulkDeleteUsers(ids)
    } catch {
      // Error already handled in composable
    }
  }
}

const selectRole = (role) => {
  selectedRole.value = role
}

// Modal handlers
const openCreateModal = () => {
  modal.value = {
    visible: true,
    mode: 'create',
    user: null,
  }
  selectedRole.value = 'student'
  formErrors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
  modal.value.user = null
  formErrors.value = {}
  selectedRole.value = 'student'
}

const handleFormChange = (formData) => {
  // Update selected role if changed
  if (formData.role && formData.role !== selectedRole.value) {
    selectedRole.value = formData.role
  }

  modal.value.user = {
    ...(modal.value.user || {}),
    ...formData,
  }
}

const submitForm = async () => {
  if (!modal.value.user) return

  submitting.value = true
  const payload = {
    ...modal.value.user,
    role: selectedRole.value,
  }
  const { id, ...userData } = payload

  try {
    if (modal.value.mode === 'create') {
      await createUser(userData)
    } else {
      await updateUser(id, userData)
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
  modal.value.user = {
    ...formData,
    role: selectedRole.value,
  }
  submitForm()
}

// User actions
const viewUser = async (user) => {
  try {
    const userDetails = await getUserDetails(user.id)
    detailsModal.value = {
      visible: true,
      user: userDetails,
    }
  } catch {
    // Error already handled
  }
}

const editUser = async (user) => {
  try {
    const userDetails = await getUserDetails(user.id)
    closeDetailsModal()
    selectedRole.value = userDetails.role
    modal.value = {
      visible: true,
      mode: 'edit',
      user: userDetails,
    }
    formErrors.value = {}
  } catch {
    // Error already handled
  }
}

const deleteUserConfirm = (user) => {
  closeDetailsModal()
  deleteModal.value = {
    visible: true,
    user,
  }
}

const closeDeleteModal = () => {
  deleteModal.value.visible = false
  deleteModal.value.user = null
}

const closeDetailsModal = () => {
  detailsModal.value.visible = false
  detailsModal.value.user = null
}

const confirmDelete = async () => {
  if (!deleteModal.value.user) return

  deleting.value = true
  try {
    await deleteUser(deleteModal.value.user.id)
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

// Initialize
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
