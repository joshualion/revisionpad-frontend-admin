import api from '@/http/api'

const tzHeader = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz ? { 'X-Request-TZ': tz } : {}
  } catch {
    return {}
  }
}

// Dashboard summary
export const getDashboard = (params = {}) =>
  api.get('/admin/dashboard', { params, headers: { ...tzHeader() } }).then(r => r.data)

// Charts
export const getTrafficChart = (params = {}) =>
  api.get('/admin/charts/traffic', { params, headers: { ...tzHeader() } }).then(r => r.data)

export const getRevenueChart = (params = {}) =>
  api.get('/admin/charts/revenue', { params, headers: { ...tzHeader() } }).then(r => r.data)

// Lists
export const getRecentUsers = (params = {}) =>
  api.get('/admin/users/recent', { params, headers: { ...tzHeader() } }).then(r => r.data)

export const getPendingTickets = (params = {}) =>
  api.get('/admin/tickets/pending', { params, headers: { ...tzHeader() } }).then(r => r.data)

export const getActivity = (params = {}) =>
  api.get('/admin/activity', { params, headers: { ...tzHeader() } }).then(r => r.data)

// System
export const getSystemHealth = () =>
  api.get('/admin/system', { headers: { ...tzHeader() } }).then(r => r.data)

// Support Tickets (Admin)
export const getTickets = (params = {}) =>
  api.get('/admin/tickets', { params, headers: { ...tzHeader() } }).then(r => r.data)

export const getTicket = (ticketId, params = {}) =>
  api.get(`/admin/tickets/${ticketId}`, { params, headers: { ...tzHeader() } }).then(r => r.data)

export const assignTicket = (ticketId, payload) =>
  api.post(`/admin/tickets/${ticketId}/assign`, payload, { headers: { ...tzHeader() } }).then(r => r.data)

export const updateTicketStatus = (ticketId, payload) =>
  api.patch(`/admin/tickets/${ticketId}/status`, payload, { headers: { ...tzHeader() } }).then(r => r.data)

export const replyTicket = (ticketId, payload) =>
  api.post(`/admin/tickets/${ticketId}/reply`, payload, { headers: { ...tzHeader() } }).then(r => r.data)
