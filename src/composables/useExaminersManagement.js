import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import userService from '@/services/admin/userService'

export function useExaminersManagement() {
  const loading = ref(false)
  const examiners = ref([])
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  })
  const filters = ref({
    search: '',
    area_of_expertise: '',
    access_level: '',
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

  const normalizeExaminer = (examiner = {}) => {
    const first = examiner.first_name ?? examiner.firstname ?? ''
    const last = examiner.last_name ?? examiner.lastname ?? ''
    const fullName = examiner.name || [first, last].filter(Boolean).join(' ')

    return {
      ...examiner,
      role: examiner.role || 'examiner',
      first_name: first,
      last_name: last,
      name: fullName,
    }
  }

  const totalExaminers = computed(() => pagination.value.total)
  const hasExaminers = computed(() => examiners.value.length > 0)

  const fetchExaminers = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.per_page,
        q: filters.value.search,
        area_of_expertise: filters.value.area_of_expertise,
        access_level: filters.value.access_level,
        online: filters.value.online,
        sort_field: sort.value.field,
        sort_order: sort.value.order,
        ...params,
      }

      const response = await userService.getExaminers(queryParams)

      const examinerRecords = ensureArray(response.data || response)
      examiners.value = examinerRecords.map(normalizeExaminer)
      pagination.value = {
        page: response.current_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        total_pages: response.last_page || 0,
      }
    } catch (error) {
      console.error('Failed to fetch examiners:', error)
      toast.error('Failed to load examiners')
      examiners.value = []
    } finally {
      loading.value = false
    }
  }

  const createExaminer = async (examinerData) => {
    try {
      const response = await userService.createUser({ ...examinerData, role: 'examiner' })
      toast.success('Examiner created successfully')
      await fetchExaminers() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to create examiner:', error)
      const message = error.response?.data?.message || 'Failed to create examiner'
      toast.error(message)
      throw error
    }
  }

  const updateExaminer = async (id, examinerData) => {
    try {
      const response = await userService.updateExaminer(id, examinerData)
      toast.success('Examiner updated successfully')
      await fetchExaminers() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to update examiner:', error)
      const message = error.response?.data?.message || 'Failed to update examiner'
      toast.error(message)
      throw error
    }
  }

  const deleteExaminer = async (id) => {
    try {
      await userService.deleteUser(id)
      toast.success('Examiner deleted successfully')
      await fetchExaminers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete examiner:', error)
      const message = error.response?.data?.message || 'Failed to delete examiner'
      toast.error(message)
      throw error
    }
  }

  const getExaminerDetails = async (id) => {
    try {
      const response = await userService.getExaminer(id)
      return normalizeExaminer(response)
    } catch (error) {
      console.error('Failed to fetch examiner details:', error)
      toast.error('Failed to load examiner details')
      throw error
    }
  }

  const applyFilters = () => {
    pagination.value.page = 1
    fetchExaminers()
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      area_of_expertise: '',
      access_level: '',
      online: '',
    }
    pagination.value.page = 1
    fetchExaminers()
  }

  const changePage = (page) => {
    pagination.value.page = page
    fetchExaminers()
  }

  const changeSort = (field, order) => {
    sort.value = { field, order }
    fetchExaminers()
  }

  const refresh = () => {
    fetchExaminers()
  }

  return {
    // State
    loading,
    examiners,
    pagination,
    filters,
    sort,
    totalExaminers,
    hasExaminers,

    // Actions
    fetchExaminers,
    createExaminer,
    updateExaminer,
    deleteExaminer,
    getExaminerDetails,
    applyFilters,
    clearFilters,
    changePage,
    changeSort,
    refresh,
  }
}
