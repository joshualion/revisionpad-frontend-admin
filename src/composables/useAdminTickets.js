import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { getTickets, getTicket, assignTicket, updateTicketStatus, replyTicket } from '@/http/admin'

export function useAdminTickets() {
  const loading = ref(false)
  const error = ref('')

  // List state
  const tickets = ref([])
  const pagination = ref({ page: 1, per_page: 15, total: 0 })
  const filters = ref({ search: '', status: '' })

  // Single ticket state
  const ticket = ref(null)

  async function loadTickets(extra = {}) {
    loading.value = true
    error.value = ''
    try {
      const params = { page: pagination.value.page, per_page: pagination.value.per_page, ...filters.value, ...extra }
      const data = await getTickets(params)
      // Support both paginated and simple arrays
      if (Array.isArray(data)) {
        tickets.value = data
        pagination.value.total = data.length
      } else {
        tickets.value = data.data || data.items || data.tickets || []
        const meta = data.meta || {}
        pagination.value.page = meta.current_page || meta.page || pagination.value.page
        pagination.value.per_page = meta.per_page || pagination.value.per_page
        pagination.value.total = meta.total || tickets.value.length
      }
    } catch (e) {
      error.value = e?.response?.data?.message || 'Failed to load tickets'
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  async function loadTicket(id) {
    loading.value = true
    error.value = ''
    try {
      const data = await getTicket(id)
      ticket.value = data?.ticket || data
    } catch (e) {
      error.value = e?.response?.data?.message || 'Failed to load ticket'
      toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  async function assign(id, assignee_id) {
    if (!id || !assignee_id) {
      toast.error('Ticket and assignee are required')
      return
    }
    loading.value = true
    try {
      const res = await assignTicket(id, { assignee_id })
      toast.success('Ticket assigned')
      // refresh
      await loadTicket(id)
      return res
    } catch (e) {
      const msg = e?.response?.data?.message || 'Assign failed'
      toast.error(msg)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id, status) {
    if (!id || !status) {
      toast.error('Ticket and status are required')
      return
    }
    loading.value = true
    try {
      const res = await updateTicketStatus(id, { status })
      toast.success('Status updated')
      await loadTicket(id)
      return res
    } catch (e) {
      const msg = e?.response?.data?.message || 'Update failed'
      toast.error(msg)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function reply(id, message) {
    if (!id || !message) return
    loading.value = true
    try {
      const res = await replyTicket(id, { message })
      await loadTicket(id)
      return res
    } catch (e) {
      const msg = e?.response?.data?.message || 'Reply failed'
      toast.error(msg)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    tickets,
    pagination,
    filters,
    ticket,
    loadTickets,
    loadTicket,
    assign,
    updateStatus,
    reply,
  }
}
