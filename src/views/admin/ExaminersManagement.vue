<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Examiners Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage examiner accounts and their expertise areas
          </p>
        </div>
        <div class="flex gap-2">
          <Button @click="refresh" :loading="loading" variant="outline"> Refresh </Button>
          <Button @click="openCreateModal" variant="primary"> Add Examiner </Button>
        </div>
      </div>

      <!-- Examiners Table -->
      <div
        class="rounded-xl border shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <DataTable
          :items="examiners"
          :columns="columns"
          :actions="actions"
          :loading="loading"
          search-placeholder="Search by name, email, or expertise"
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
              @view="viewExaminer"
              @edit="editExaminer"
              @delete="deleteExaminerConfirm"
            />
          </template>

          <template #column-area_of_expertise="{ item }">
            <Badge :label="item.area_of_expertise || 'Not specified'" variant="success" size="sm" />
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

      <!-- Create/Edit/View Examiner Modal -->
      <Modal
        :visible="modal.visible"
        :title="
          modal.mode === 'create'
            ? 'Add New Examiner'
            : modal.mode === 'edit'
              ? 'Edit Examiner'
              : 'Examiner Details'
        "
        size="xl"
        @close="closeModal"
      >
        <UserForm
          v-if="modal.mode !== 'view'"
          role="examiner"
          :mode="modal.mode"
          :initial-data="modal.examiner"
          :errors="formErrors"
          @submit="handleFormSubmit"
          @change="handleFormChange"
        />

        <!-- View Mode: Display examiner details -->
        <div v-else-if="modal.examiner" class="space-y-6">
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
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.examiner.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Email</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.examiner.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Username</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.examiner.username || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Phone</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.examiner.phone || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Professional Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Professional Information
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Area of Expertise</label
                  >
                  <Badge
                    :label="modal.examiner.area_of_expertise || 'Not specified'"
                    variant="success"
                    size="sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Occupation</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.examiner.occupation || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Institution</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.examiner.institution_affiliation || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Access Level</label
                  >
                  <Badge
                    :label="getAccessLevelLabel(modal.examiner.access_level)"
                    :variant="getAccessLevelVariant(modal.examiner.access_level)"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Bio and Account Information -->
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Bio</h3>
              <p class="text-gray-700 dark:text-gray-300 mt-2">
                {{ modal.examiner.bio || 'No bio provided' }}
              </p>
            </div>
          </div>

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
                  :label="modal.examiner.online ? 'Online' : 'Offline'"
                  :variant="modal.examiner.online ? 'success' : 'default'"
                  size="sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Joined</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{ formatDate(modal.examiner.created_at) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Last Activity</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{
                    modal.examiner.last_activity
                      ? formatDate(modal.examiner.last_activity)
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
            @click="editExaminer(modal.examiner)"
            variant="primary"
          >
            Edit Examiner
          </Button>
          <template v-else>
            <Button @click="closeModal" variant="outline"> Cancel </Button>
            <Button @click="submitForm" :loading="submitting" variant="primary">
              {{ modal.mode === 'create' ? 'Add Examiner' : 'Update Examiner' }}
            </Button>
          </template>
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :visible="deleteModal.visible" title="Confirm Delete" @close="closeDeleteModal">
        <div class="space-y-4">
          <p>Are you sure you want to delete this examiner?</p>
          <div v-if="deleteModal.examiner" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p class="font-semibold">
              {{ deleteModal.examiner.name || deleteModal.examiner.email }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ deleteModal.examiner.email }}</p>
          </div>
          <p class="text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
        </div>

        <template #footer>
          <Button @click="closeDeleteModal" variant="outline"> Cancel </Button>
          <Button @click="confirmDelete" :loading="deleting" variant="danger">
            Delete Examiner
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
import { useExaminersManagement } from '@/composables/useExaminersManagement'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const {
  loading,
  examiners,
  filters,
  fetchExaminers,
  createExaminer,
  updateExaminer,
  deleteExaminer,
  getExaminerDetails,
  applyFilters,
  changePage,
  changeSort,
  refresh,
} = useExaminersManagement()

// Modal states
const modal = ref({
  visible: false,
  mode: 'create', // 'create' or 'edit'
  examiner: null,
})

const deleteModal = ref({
  visible: false,
  examiner: null,
})

const formErrors = ref({})
const submitting = ref(false)
const deleting = ref(false)

// Table configuration
const columns = [
  { key: 'name', label: 'Examiner' },
  { key: 'area_of_expertise', label: 'Expertise' },
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
      await viewExaminer(item)
      break
    case 'edit':
      await editExaminer(item)
      break
    case 'delete':
      deleteExaminerConfirm(item)
      break
  }
}

const handleBulkDelete = async (ids) => {
  if (confirm(`Are you sure you want to delete ${ids.length} examiners?`)) {
    try {
      for (const id of ids) {
        await deleteExaminer(id)
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
    examiner: null,
  }
  formErrors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
  modal.value.examiner = null
  formErrors.value = {}
}

const handleFormChange = () => {
  // Handle form changes if needed
}

const submitForm = async () => {
  submitting.value = true
  try {
    if (modal.value.mode === 'create') {
      await createExaminer(modal.value.examiner)
    } else {
      await updateExaminer(modal.value.examiner.id, modal.value.examiner)
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
  modal.value.examiner = formData
  submitForm()
}

// Examiner actions
const viewExaminer = async (examiner) => {
  try {
    const examinerDetails = await getExaminerDetails(examiner.id)
    // Show detailed view modal
    modal.value = {
      visible: true,
      mode: 'view',
      examiner: examinerDetails,
    }
  } catch {
    // Error already handled
  }
}

const editExaminer = async (examiner) => {
  try {
    const examinerDetails = await getExaminerDetails(examiner.id)
    modal.value = {
      visible: true,
      mode: 'edit',
      examiner: examinerDetails,
    }
    formErrors.value = {}
  } catch {
    // Error already handled
  }
}

const deleteExaminerConfirm = (examiner) => {
  deleteModal.value = {
    visible: true,
    examiner,
  }
}

const closeDeleteModal = () => {
  deleteModal.value.visible = false
  deleteModal.value.examiner = null
}

const confirmDelete = async () => {
  if (!deleteModal.value.examiner) return

  deleting.value = true
  try {
    await deleteExaminer(deleteModal.value.examiner.id)
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

// Initialize
onMounted(() => {
  fetchExaminers()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
