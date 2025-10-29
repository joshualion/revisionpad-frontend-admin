import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import userService from '@/services/admin/userService'

export function useUsersManagement() {
  const loading = ref(false)
  const users = ref([])
  const pagination = ref({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  })
  const filters = ref({
    search: '',
    role: '',
    online: '',
  })
  const sort = ref({
    field: 'created_at',
    order: 'desc',
  })

  const totalUsers = computed(() => pagination.value.total)
  const hasUsers = computed(() => users.value.length > 0)

  const fetchUsers = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.per_page,
        q: filters.value.search,
        role: filters.value.role,
        online: filters.value.online,
        sort_field: sort.value.field,
        sort_order: sort.value.order,
        ...params,
      }

      const response = await userService.getUsers(queryParams)

      const userRecords = response.data || []
      users.value = userRecords.map((record) => normalizeBaseUser(record))
      pagination.value = {
        page: response.current_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        total_pages: response.last_page || 0,
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    try {
      const response = await userService.createUser(userData)
      toast.success('User created successfully')
      await fetchUsers() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to create user:', error)
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
      throw error
    }
  }

  const updateUser = async (id, userData) => {
    try {
      const response = await userService.updateUser(id, userData)
      toast.success('User updated successfully')
      await fetchUsers() // Refresh the list
      return response
    } catch (error) {
      console.error('Failed to update user:', error)
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      await userService.deleteUser(id)
      toast.success('User deleted successfully')
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error)
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
      throw error
    }
  }

  const bulkDeleteUsers = async (ids) => {
    loading.value = true
    try {
      // Delete users one by one or implement bulk delete if API supports it
      for (const id of ids) {
        await userService.deleteUser(id)
      }
      toast.success(`${ids.length} users deleted successfully`)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete users:', error)
      toast.error('Failed to delete some users')
      throw error
    } finally {
      loading.value = false
    }
  }

  const mapCollection = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.data)) return payload.data
    return []
  }

  const extractIds = (collection, key = 'id') => {
    return mapCollection(collection)
      .map((item) => {
        if (item == null) return null
        if (typeof item === 'object') {
          return item[key] ?? item.value ?? null
        }
        return item
      })
      .filter((value) => value !== null && value !== undefined)
  }

  const normalizeBaseUser = (user = {}) => {
    const firstName =
      user.first_name ?? user.firstname ?? user.firstName ?? user?.profile?.first_name ?? ''
    const lastName =
      user.last_name ?? user.lastname ?? user.lastName ?? user?.profile?.last_name ?? ''
    const fullName = user.name || [firstName, lastName].filter(Boolean).join(' ')

    return {
      ...user,
      role: user.role || user.user_type || '',
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      phone: user.phone ?? '',
      gender: user.gender ?? '',
      date_of_birth: user.date_of_birth ?? user.dob ?? '',
      country_id: user.country_id ?? user.country?.id ?? '',
      state_id: user.state_id ?? user.state?.id ?? '',
      city_id: user.city_id ?? user.city?.id ?? '',
    }
  }

  const normalizeStudentProfile = (student = {}) => {
    const normalized = normalizeBaseUser(student)
    const examCategories = mapCollection(student.exam_categories || student.examCategories)
    const examSubcategories = mapCollection(
      student.exam_subcategories || student.examSubcategories,
    )
    const exams = mapCollection(student.exams || student.exam_preferences)

    return {
      ...normalized,
      role: 'student',
      exam_categories: examCategories,
      exam_subcategories: examSubcategories,
      exams,
      exam_category_ids: student.exam_category_ids || extractIds(examCategories),
      exam_subcategory_ids: student.exam_subcategory_ids || extractIds(examSubcategories),
      exam_ids: student.exam_ids || extractIds(exams),
    }
  }

  const normalizeAdministratorProfile = (administrator = {}) => {
    const normalized = normalizeBaseUser(administrator)
    return {
      ...normalized,
      role: 'administrator',
      access_level: administrator.access_level ?? administrator.permission_level ?? '',
    }
  }

  const normalizeExaminerProfile = (examiner = {}) => {
    const normalized = normalizeBaseUser(examiner)
    return {
      ...normalized,
      role: 'examiner',
      access_level: examiner.access_level ?? '',
      occupation: examiner.occupation ?? '',
      area_of_expertise: examiner.area_of_expertise ?? examiner.specialty ?? '',
      institution_affiliation: examiner.institution_affiliation ?? examiner.institution ?? '',
      bio: examiner.bio ?? '',
    }
  }

  const getUserDetails = async (id) => {
    try {
      const user = await userService.getUser(id)
      const baseUser = normalizeBaseUser(user)
      let roleSpecific = {}

      switch (baseUser.role) {
        case 'student':
          if (user.student) {
            roleSpecific = normalizeStudentProfile(user.student)
          }
          break
        case 'administrator':
          if (user.administrator) {
            roleSpecific = normalizeAdministratorProfile(user.administrator)
          }
          break
        case 'examiner':
          if (user.examiner) {
            roleSpecific = normalizeExaminerProfile(user.examiner)
          }
          break
        default:
          roleSpecific = {}
      }

      return {
        ...baseUser,
        ...roleSpecific,
        student: user.student || null,
        administrator: user.administrator || null,
        examiner: user.examiner || null,
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error('Failed to load user details')
      throw error
    }
  }

  const applyFilters = () => {
    pagination.value.page = 1
    fetchUsers()
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      role: '',
      online: '',
    }
    pagination.value.page = 1
    fetchUsers()
  }

  const changePage = (page) => {
    pagination.value.page = page
    fetchUsers()
  }

  const changeSort = (field, order) => {
    sort.value = { field, order }
    fetchUsers()
  }

  const refresh = () => {
    fetchUsers()
  }

  return {
    // State
    loading,
    users,
    pagination,
    filters,
    sort,
    totalUsers,
    hasUsers,

    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    getUserDetails,
    applyFilters,
    clearFilters,
    changePage,
    changeSort,
    refresh,
  }
}
