import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import userService from '@/services/admin/userService'

export function useAdministratorsManagement() {
  const loading = ref(false)
  const administrators = ref([])
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  })
  const filters = ref({
    search: '',
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

  const normalizeAdministrator = (administrator = {}) => {
    const first = administrator.first_name ?? administrator.firstname ?? ''
    const last = administrator.last_name ?? administrator.lastname ?? ''
    const fullName = administrator.name || [first, last].filter(Boolean).join(' ')

    return {
      ...administrator,
      role: administrator.role || 'administrator',
      first_name: first,
      last_name: last,
      name: fullName,
    }
  }

  const totalAdministrators = computed(() => pagination.value.total)
  const hasAdministrators = computed(() => administrators.value.length > 0)

  const fetchAdministrators = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.per_page,
        q: filters.value.search,
        access_level: filters.value.access_level,
        online: filters.value.online,
        sort_field: sort.value.field,
        sort_order: sort.value.order,
        ...params,
      }

      const response = await userService.getAdministrators(queryParams)

      const adminRecords = ensureArray(response.data || response)
      administrators.value = adminRecords.map(normalizeAdministrator)
      pagination.value = {
        page: response.current_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        total_pages: response.last_page || 0,
      }
    } catch (error) {
      console.error('Failed to fetch administrators:', error)
      toast.error('Failed to load administrators')
      administrators.value = []
    } finally {
      loading.value = false
    }
  }

  const createAdministrator = async (adminData) => {
    try {
      const response = await userService.createUser({ ...adminData, role: 'administrator' })
      toast.success('Administrator created successfully')
      await fetchAdministrators() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to create administrator:', error)
      const message = error.response?.data?.message || 'Failed to create administrator'
      toast.error(message)
      throw error
    }
  }

  const updateAdministrator = async (id, adminData) => {
    try {
      const response = await userService.updateAdministrator(id, adminData)
      toast.success('Administrator updated successfully')
      await fetchAdministrators() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to update administrator:', error)
      const message = error.response?.data?.message || 'Failed to update administrator'
      toast.error(message)
      throw error
    }
  }

  const deleteAdministrator = async (id) => {
    try {
      await userService.deleteUser(id)
      toast.success('Administrator deleted successfully')
      await fetchAdministrators() // Refresh the list
    } catch (error) {
      console.error('Failed to delete administrator:', error)
      const message = error.response?.data?.message || 'Failed to delete administrator'
      toast.error(message)
      throw error
    }
  }

  const getAdministratorDetails = async (id) => {
    try {
      const response = await userService.getAdministrator(id)
      return normalizeAdministrator(response)
    } catch (error) {
      console.error('Failed to fetch administrator details:', error)
      toast.error('Failed to load administrator details')
      throw error
    }
  }

  const applyFilters = () => {
    pagination.value.page = 1
    fetchAdministrators()
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      access_level: '',
      online: '',
    }
    pagination.value.page = 1
    fetchAdministrators()
  }

  const changePage = (page) => {
    pagination.value.page = page
    fetchAdministrators()
  }

  const changeSort = (field, order) => {
    sort.value = { field, order }
    fetchAdministrators()
  }

  const refresh = () => {
    fetchAdministrators()
  }

  return {
    // State
    loading,
    administrators,
    pagination,
    filters,
    sort,
    totalAdministrators,
    hasAdministrators,

    // Actions
    fetchAdministrators,
    createAdministrator,
    updateAdministrator,
    deleteAdministrator,
    getAdministratorDetails,
    applyFilters,
    clearFilters,
    changePage,
    changeSort,
    refresh,
  }
}
