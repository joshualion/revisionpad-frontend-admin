<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Students Management</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Manage student accounts and their exam preferences
          </p>
        </div>
        <div class="flex gap-2">
          <Button @click="refresh" :loading="loading" variant="outline"> Refresh </Button>
          <Button @click="openCreateModal" variant="primary"> Add Student </Button>
        </div>
      </div>

      <!-- Students Table -->
      <div
        class="rounded-xl border shadow-sm"
        :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <DataTable
          :items="students"
          :columns="columns"
          :actions="actions"
          :loading="loading"
          search-placeholder="Search by name, email, or username"
          filter-label="exam category"
          :filter-options="examCategoryFilterOptions"
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
              @view="viewStudent"
              @edit="editStudent"
              @delete="deleteStudentConfirm"
            />
          </template>

          <template #column-exam_categories="{ item }">
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="category in item.exam_categories || []"
                :key="category.id"
                :label="category.name"
                variant="primary"
                size="xs"
              />
            </div>
          </template>

          <template #column-online="{ item }">
            <OnlineStatusIndicator :online="item.online" :last-activity="item.last_activity" />
          </template>

          <template #column-created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </DataTable>
      </div>

      <!-- Create/Edit/View Student Modal -->
      <Modal
        :visible="modal.visible"
        :title="
          modal.mode === 'create'
            ? 'Add New Student'
            : modal.mode === 'edit'
              ? 'Edit Student'
              : 'Student Details'
        "
        size="xl"
        @close="closeModal"
      >
        <UserForm
          v-if="modal.mode !== 'view'"
          role="student"
          :mode="modal.mode"
          :initial-data="modal.student"
          :errors="formErrors"
          @submit="handleFormSubmit"
          @change="handleFormChange"
        />

        <!-- View Mode: Display student details -->
        <div v-else-if="modal.student" class="space-y-6">
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
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.student.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Email</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.student.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Username</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ modal.student.username || 'N/A' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Phone</label
                  >
                  <p class="text-gray-900 dark:text-gray-100">{{ modal.student.phone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Exam Preferences -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Exam Preferences
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Exam Categories</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="category in modal.student.exam_categories || []"
                      :key="category.id"
                      :label="category.name"
                      variant="primary"
                      size="sm"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Exam Subcategories</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="subcategory in modal.student.exam_subcategories || []"
                      :key="subcategory.id"
                      :label="subcategory.name"
                      variant="secondary"
                      size="sm"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Preferred Exams</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="exam in modal.student.exams || []"
                      :key="exam.id"
                      :label="exam.name"
                      variant="success"
                      size="sm"
                    />
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
                  :label="modal.student.online ? 'Online' : 'Offline'"
                  :variant="modal.student.online ? 'success' : 'default'"
                  size="sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Joined</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{ formatDate(modal.student.created_at) }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Last Activity</label
                >
                <p class="text-gray-900 dark:text-gray-100">
                  {{
                    modal.student.last_activity ? formatDate(modal.student.last_activity) : 'Never'
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
            @click="editStudent(modal.student)"
            variant="primary"
          >
            Edit Student
          </Button>
          <template v-else>
            <Button @click="closeModal" variant="outline"> Cancel </Button>
            <Button @click="submitForm" :loading="submitting" variant="primary">
              {{ modal.mode === 'create' ? 'Add Student' : 'Update Student' }}
            </Button>
          </template>
        </template>
      </Modal>

      <!-- Delete Confirmation Modal -->
      <Modal :visible="deleteModal.visible" title="Confirm Delete" @close="closeDeleteModal">
        <div class="space-y-4">
          <p>Are you sure you want to delete this student?</p>
          <div v-if="deleteModal.student" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p class="font-semibold">{{ deleteModal.student.name || deleteModal.student.email }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ deleteModal.student.email }}</p>
          </div>
          <p class="text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
        </div>

        <template #footer>
          <Button @click="closeDeleteModal" variant="outline"> Cancel </Button>
          <Button @click="confirmDelete" :loading="deleting" variant="danger">
            Delete Student
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
import { useStudentsManagement } from '@/composables/useStudentsManagement'

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const {
  loading,
  students,
  filters,
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentDetails,
  applyFilters,
  changePage,
  changeSort,
  refresh,
} = useStudentsManagement()

// Modal states
const modal = ref({
  visible: false,
  mode: 'create', // 'create' or 'edit'
  student: null,
})

const deleteModal = ref({
  visible: false,
  student: null,
})

const formErrors = ref({})
const submitting = ref(false)
const deleting = ref(false)

// Table configuration
const columns = [
  { key: 'name', label: 'Student' },
  { key: 'exam_categories', label: 'Exam Categories' },
  { key: 'online', label: 'Status' },
  { key: 'created_at', label: 'Joined' },
]

const actions = [
  { key: 'view', label: 'View', class: 'text-blue-600 hover:text-blue-800' },
  { key: 'edit', label: 'Edit', class: 'text-yellow-600 hover:text-yellow-800' },
  { key: 'delete', label: 'Delete', class: 'text-red-600 hover:text-red-800' },
]

const examCategoryFilterOptions = ref([])

// Event handlers
const handleSearch = (query) => {
  filters.value.search = query
  applyFilters()
}

const handleFilter = (categoryId) => {
  filters.value.exam_category = categoryId
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
      await viewStudent(item)
      break
    case 'edit':
      await editStudent(item)
      break
    case 'delete':
      deleteStudentConfirm(item)
      break
  }
}

const handleBulkDelete = async (ids) => {
  if (confirm(`Are you sure you want to delete ${ids.length} students?`)) {
    try {
      for (const id of ids) {
        await deleteStudent(id)
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
    student: null,
  }
  formErrors.value = {}
}

const closeModal = () => {
  modal.value.visible = false
  modal.value.student = null
  formErrors.value = {}
}

const handleFormChange = () => {
  // Handle form changes if needed
}

const submitForm = async () => {
  submitting.value = true
  try {
    if (modal.value.mode === 'create') {
      await createStudent(modal.value.student)
    } else {
      await updateStudent(modal.value.student.id, modal.value.student)
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
  modal.value.student = formData
  submitForm()
}

// Student actions
const viewStudent = async (student) => {
  try {
    const studentDetails = await getStudentDetails(student.id)
    // Show detailed view modal
    modal.value = {
      visible: true,
      mode: 'view',
      student: studentDetails,
    }
  } catch {
    // Error already handled
  }
}

const editStudent = async (student) => {
  try {
    const studentDetails = await getStudentDetails(student.id)
    modal.value = {
      visible: true,
      mode: 'edit',
      student: studentDetails,
    }
    formErrors.value = {}
  } catch {
    // Error already handled
  }
}

const deleteStudentConfirm = (student) => {
  deleteModal.value = {
    visible: true,
    student,
  }
}

const closeDeleteModal = () => {
  deleteModal.value.visible = false
  deleteModal.value.student = null
}

const confirmDelete = async () => {
  if (!deleteModal.value.student) return

  deleting.value = true
  try {
    await deleteStudent(deleteModal.value.student.id)
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

// Load exam categories for filter
const loadExamCategories = async () => {
  try {
    // This would come from the API
    // examCategoryFilterOptions.value = await userService.getExamCategories()
  } catch {
    console.error('Failed to load exam categories')
  }
}

// Initialize
onMounted(() => {
  fetchStudents()
  loadExamCategories()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
