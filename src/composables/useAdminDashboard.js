import { ref } from 'vue'
import {
  getDashboard,
} from '@/http/admin'

const cache = {
  data: null,
  ts: 0,
}

export function useAdminDashboard() {
  const loading = ref(false)
  const error = ref('')
  const range = ref('30d')

  const kpis = ref({})
  const charts = ref({ traffic: [], revenue: [] })
  const systemHealth = ref({})
  const recentSignups = ref([])
  const pendingTickets = ref([])
  const activity = ref([])

  async function load(force = false) {
    if (!force && cache.data && Date.now() - cache.ts < 60_000) {
      apply(cache.data)
      return
    }
    loading.value = true
    error.value = ''
    try {
      const data = await getDashboard({ range: range.value })
      cache.data = data
      cache.ts = Date.now()
      apply(data)
    } catch (e) {
      error.value = e?.response?.data?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  function apply(data) {
    kpis.value = data?.kpis || {}
    charts.value = data?.charts || { traffic: [], revenue: [] }
    systemHealth.value = data?.system_health || {}
    recentSignups.value = data?.recent_signups || []
    pendingTickets.value = data?.pending_tickets || []
    activity.value = data?.recent_activity || []
  }

  async function refresh() {
    await load(true)
  }

  async function setRange(newRange) {
    range.value = newRange
    await load(true)
  }

  return {
    loading,
    error,
    range,
    kpis,
    charts,
    systemHealth,
    recentSignups,
    pendingTickets,
    activity,
    load,
    refresh,
    setRange,
  }
}

