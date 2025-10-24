import api from './api'

const BASE_URL = '/admin/topical-questions'

function toFormData(payload = {}) {
  const fd = new FormData()
  const entries = {
    exam_id: payload.exam_id,
    subject_id: payload.subject_id,
    topic_id: payload.topic_id,
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

export function listTopicalQuestions(params = {}) {
  return api.get(BASE_URL, { params })
}

export function createTopicalQuestion(payload) {
  const fd = toFormData(payload)
  return api.post(BASE_URL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updateTopicalQuestion(id, payload) {
  const fd = toFormData(payload)
  fd.append('_method', 'PATCH')
  return api.post(`${BASE_URL}/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteTopicalQuestion(id) {
  return api.delete(`${BASE_URL}/${id}`)
}

export function bulkCreateTopicalQuestions(questions = []) {
  return api.post(`${BASE_URL}/bulk`, { questions })
}

export function importTopicalQuestionsCsv(formData) {
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
    return { items: data, total: data.length, perPage: data.length }
  }

  return { items: [], total: 0, perPage: 20 }
}

export default {
  listTopicalQuestions,
  createTopicalQuestion,
  updateTopicalQuestion,
  deleteTopicalQuestion,
  bulkCreateTopicalQuestions,
  importTopicalQuestionsCsv,
  extractPaginated,
}
