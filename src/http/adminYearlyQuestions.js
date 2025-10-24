import api from './api'

const BASE_URL = '/admin/yearly-questions'

function toFormData(payload = {}) {
  const fd = new FormData()
  const entries = {
    exam_id: payload.exam_id,
    subject_id: payload.subject_id,
    year_id: payload.year_id,
    type: payload.type,
    source: payload.source,
    question: payload.question,
    option_a: payload.option_a,
    option_b: payload.option_b,
    option_c: payload.option_c,
    option_d: payload.option_d,
    option_e: payload.option_e,
    correct_option: payload.correct_option,
    explanation: payload.explanation,
  }

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, value)
    }
  })

  if (payload.marks !== undefined && payload.marks !== null && payload.marks !== '') {
    fd.append('marks', String(payload.marks))
  }

  if (payload.attachment instanceof File) {
    fd.append('attachment', payload.attachment)
  }

  return fd
}

export function listYearlyQuestions(params = {}) {
  return api.get(BASE_URL, { params })
}

export function createYearlyQuestion(payload) {
  const fd = toFormData(payload)
  return api.post(BASE_URL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updateYearlyQuestion(id, payload) {
  const fd = toFormData(payload)
  fd.append('_method', 'PATCH')
  return api.post(`${BASE_URL}/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteYearlyQuestion(id) {
  return api.delete(`${BASE_URL}/${id}`)
}

export function bulkCreateYearlyQuestions(questions = []) {
  return api.post(`${BASE_URL}/bulk`, { questions })
}

export function importYearlyQuestionsCsv(formData) {
  return api.post(`${BASE_URL}/import-csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function extractPaginated(data) {
  if (Array.isArray(data?.data)) {
    return {
      items: data.data,
      total: data?.meta?.total ?? data?.total ?? data.data.length,
      perPage: data?.meta?.per_page ?? data?.per_page ?? data.data.length,
    }
  }

  if (Array.isArray(data?.data?.data)) {
    return {
      items: data.data.data,
      total: data.data.total ?? data?.total ?? data.data.data.length,
      perPage: data.data.per_page ?? data?.per_page ?? data.data.data.length,
    }
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      perPage: data.length,
    }
  }

  return {
    items: [],
    total: 0,
    perPage: 15,
  }
}

export default {
  listYearlyQuestions,
  createYearlyQuestion,
  updateYearlyQuestion,
  deleteYearlyQuestion,
  bulkCreateYearlyQuestions,
  importYearlyQuestionsCsv,
  extractPaginated,
}
