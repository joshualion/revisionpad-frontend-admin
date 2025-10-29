import api from '@/http/api'

class UserService {
  // Main Users API
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params })
    return response.data
  }

  async createUser(data) {
    const response = await api.post('/admin/users', data)
    return response.data
  }

  async getUser(id) {
    const response = await api.get(`/admin/users/${id}`)
    return response.data?.data || response.data
  }

  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  }

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  }

  // Students API
  async getStudents(params = {}) {
    const response = await api.get('/admin/students', { params })
    return response.data
  }

  async getStudent(id) {
    const response = await api.get(`/admin/students/${id}`)
    return response.data?.data || response.data
  }

  async updateStudent(id, data) {
    const response = await api.put(`/admin/students/${id}`, data)
    return response.data
  }

  // Administrators API
  async getAdministrators(params = {}) {
    const response = await api.get('/admin/administrators', { params })
    return response.data
  }

  async getAdministrator(id) {
    const response = await api.get(`/admin/administrators/${id}`)
    return response.data?.data || response.data
  }

  async updateAdministrator(id, data) {
    const response = await api.put(`/admin/administrators/${id}`, data)
    return response.data
  }

  // Examiners API
  async getExaminers(params = {}) {
    const response = await api.get('/admin/examiners', { params })
    return response.data
  }

  async getExaminer(id) {
    const response = await api.get(`/admin/examiners/${id}`)
    return response.data?.data || response.data
  }

  async updateExaminer(id, data) {
    const response = await api.put(`/admin/examiners/${id}`, data)
    return response.data
  }

  // Utility methods
  async getCountries() {
    const response = await api.get('/countries')
    return response.data
  }

  async getStates(countryId) {
    const response = await api.get(`/countries/${countryId}/states`)
    return response.data
  }

  async getCities(stateId) {
    const response = await api.get(`/states/${stateId}/cities`)
    return response.data
  }

  async getExamCategories() {
    const response = await api.get('/exam-categories')
    return response.data
  }

  async getExamSubcategories() {
    const response = await api.get('/exam-subcategories')
    return response.data
  }

  async getExams() {
    const response = await api.get('/exams')
    return response.data
  }
}

export default new UserService()
