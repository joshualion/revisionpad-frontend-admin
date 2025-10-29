import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import userService from '@/services/admin/userService'

export function useStudentsManagement() {
  const loading = ref(false)
  const students = ref([])
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  })
  const filters = ref({
    search: '',
    exam_category: '',
    exam_subcategory: '',
    exam: '',
    online: '',
  })
  const sort = ref({
    field: 'created_at',
    order: 'desc',
  })

  const ensureArray = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const extractIds = (payload, key = 'id') =>
    ensureArray(payload)
      .map((item) => {
        if (item == null) return null
        if (typeof item === 'object') {
          return item[key] ?? item.value ?? null
        }
        return item
      })
      .filter((value) => value !== null && value !== undefined)

  const normalizeStudent = (student = {}) => {
    const first = student.first_name ?? student.firstname ?? ''
    const last = student.last_name ?? student.lastname ?? ''
    const fullName = student.name || [first, last].filter(Boolean).join(' ')
    const examCategories = ensureArray(student.exam_categories)
    const examSubcategories = ensureArray(student.exam_subcategories)
    const exams = ensureArray(student.exams)

    return {
      ...student,
      role: student.role || 'student',
      first_name: first,
      last_name: last,
      name: fullName,
      exam_categories: examCategories,
      exam_subcategories: examSubcategories,
      exams,
      exam_category_ids: student.exam_category_ids || extractIds(examCategories),
      exam_subcategory_ids: student.exam_subcategory_ids || extractIds(examSubcategories),
      exam_ids: student.exam_ids || extractIds(exams),
    }
  }

  const totalStudents = computed(() => pagination.value.total)
  const hasStudents = computed(() => students.value.length > 0)

  const fetchStudents = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.per_page,
        q: filters.value.search,
        exam_category_id: filters.value.exam_category,
        exam_subcategory_id: filters.value.exam_subcategory,
        exam_id: filters.value.exam,
        online: filters.value.online,
        sort_field: sort.value.field,
        sort_order: sort.value.order,
        ...params,
      }

      const response = await userService.getStudents(queryParams)

      const studentRecords = response.data || []
      students.value = studentRecords.map(normalizeStudent)
      pagination.value = {
        page: response.current_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        total_pages: response.last_page || 0,
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast.error('Failed to load students')
      students.value = []
    } finally {
      loading.value = false
    }
  }

  const createStudent = async (studentData) => {
    try {
      const response = await userService.createUser({ ...studentData, role: 'student' })
      toast.success('Student created successfully')
      await fetchStudents() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to create student:', error)
      const message = error.response?.data?.message || 'Failed to create student'
      toast.error(message)
      throw error
    }
  }

  const updateStudent = async (id, studentData) => {
    try {
      const response = await userService.updateStudent(id, studentData)
      toast.success('Student updated successfully')
      await fetchStudents() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to update student:', error)
      const message = error.response?.data?.message || 'Failed to update student'
      toast.error(message)
      throw error
    }
  }

  const deleteStudent = async (id) => {
    try {
      await userService.deleteUser(id)
      toast.success('Student deleted successfully')
      await fetchStudents() // Refresh the list
    } catch (error) {
      console.error('Failed to delete student:', error)
      const message = error.response?.data?.message || 'Failed to delete student'
      toast.error(message)
      throw error
    }
  }

  const getStudentDetails = async (id) => {
    try {
      const response = await userService.getStudent(id)
      return normalizeStudent(response)
    } catch (error) {
      console.error('Failed to fetch student details:', error)
      toast.error('Failed to load student details')
      throw error
    }
  }

  const applyFilters = () => {
    pagination.value.page = 1
    fetchStudents()
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      exam_category: '',
      exam_subcategory: '',
      exam: '',
      online: '',
    }
    pagination.value.page = 1
    fetchStudents()
  }

  const changePage = (page) => {
    pagination.value.page = page
    fetchStudents()
  }

  const changeSort = (field, order) => {
    sort.value = { field, order }
    fetchStudents()
  }

  const refresh = () => {
    fetchStudents()
  }

  return {
    // State
    loading,
    students,
    pagination,
    filters,
    sort,
    totalStudents,
    hasStudents,

    // Actions
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails,
    applyFilters,
    clearFilters,
    changePage,
    changeSort,
    refresh,
  }
}
