import api from '@/http/api'
import { markProfiler, profileAsync } from '@/utils/profiler'

const extractData = (response) => {
  if (!response) return {}
  if (response.success !== undefined && response.data !== undefined) {
    return { data: response.data }
  }
  return response
}

const CACHE_TTL = 1000 * 60 * 5 // 5 minutes
const OPTION_CACHE_PREFIX = {
  countries: 'country-options',
  states: 'state-options',
  cities: 'city-options',
}

const normalizeParams = (params = {}) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})

class LocationService {
  constructor() {
    this.cache = new Map()
    this.pendingRequests = new Map()
  }

  getCacheKey(resource, params = {}) {
    return `${resource}:${JSON.stringify(normalizeParams(params))}`
  }

  async fetchWithCache(resource, params, fetcher, { force = false } = {}) {
    const key = this.getCacheKey(resource, params)

    if (!force) {
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        markProfiler(`${resource} cache-hit`)
        return cached.data
      }

      if (this.pendingRequests.has(key)) {
        markProfiler(`${resource} request-join`)
        return this.pendingRequests.get(key)
      }
    }

    const request = profileAsync(`${resource} fetch`, async () => {
      const data = await fetcher()
      this.cache.set(key, { data, timestamp: Date.now() })
      return data
    })

    this.pendingRequests.set(key, request)
    try {
      return await request
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  invalidateCache(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  invalidateOptions(...types) {
    types.forEach((type) => {
      if (type && OPTION_CACHE_PREFIX[type]) {
        this.invalidateCache(OPTION_CACHE_PREFIX[type])
      }
    })
  }

  async getCountries(params = {}) {
    return profileAsync('locations:getCountries', async () => {
      const response = await api.get('/admin/locations/countries', { params })
      return response.data
    })
  }

  async createCountry(data) {
    const response = await profileAsync('locations:createCountry', () =>
      api.post('/admin/locations/countries', data),
    )
    this.invalidateOptions('countries', 'states', 'cities')
    return response.data
  }

  async updateCountry(id, data) {
    const response = await profileAsync('locations:updateCountry', () =>
      api.put(`/admin/locations/countries/${id}`, data),
    )
    this.invalidateOptions('countries', 'states', 'cities')
    return response.data
  }

  async deleteCountry(id) {
    const response = await profileAsync('locations:deleteCountry', () =>
      api.delete(`/admin/locations/countries/${id}`),
    )
    this.invalidateOptions('countries', 'states', 'cities')
    return response.data
  }

  async getStates(params = {}) {
    return profileAsync('locations:getStates', async () => {
      const response = await api.get('/admin/locations/states', { params })
      return response.data
    })
  }

  async createState(data) {
    const response = await profileAsync('locations:createState', () =>
      api.post('/admin/locations/states', data),
    )
    this.invalidateOptions('states', 'cities')
    return response.data
  }

  async updateState(id, data) {
    const response = await profileAsync('locations:updateState', () =>
      api.put(`/admin/locations/states/${id}`, data),
    )
    this.invalidateOptions('states', 'cities')
    return response.data
  }

  async deleteState(id) {
    const response = await profileAsync('locations:deleteState', () =>
      api.delete(`/admin/locations/states/${id}`),
    )
    this.invalidateOptions('states', 'cities')
    return response.data
  }

  async getCities(params = {}) {
    return profileAsync('locations:getCities', async () => {
      const response = await api.get('/admin/locations/cities', { params })
      return response.data
    })
  }

  async createCity(data) {
    const response = await profileAsync('locations:createCity', () =>
      api.post('/admin/locations/cities', data),
    )
    this.invalidateOptions('cities')
    return response.data
  }

  async updateCity(id, data) {
    const response = await profileAsync('locations:updateCity', () =>
      api.put(`/admin/locations/cities/${id}`, data),
    )
    this.invalidateOptions('cities')
    return response.data
  }

  async deleteCity(id) {
    const response = await profileAsync('locations:deleteCity', () =>
      api.delete(`/admin/locations/cities/${id}`),
    )
    this.invalidateOptions('cities')
    return response.data
  }

  async getCountryOptions(params = {}, { force = false } = {}) {
    return this.fetchWithCache(
      OPTION_CACHE_PREFIX.countries,
      params,
      async () => {
        const response = await this.getCountries({ all: true, ...params })
        return extractData(response).data || []
      },
      { force },
    )
  }

  async getStateOptions(params = {}, { force = false } = {}) {
    return this.fetchWithCache(
      OPTION_CACHE_PREFIX.states,
      params,
      async () => {
        const response = await this.getStates({ all: true, ...params })
        return extractData(response).data || []
      },
      { force },
    )
  }

  async getCityOptions(params = {}, { force = false } = {}) {
    return this.fetchWithCache(
      OPTION_CACHE_PREFIX.cities,
      params,
      async () => {
        const response = await this.getCities({ all: true, ...params })
        return extractData(response).data || []
      },
      { force },
    )
  }

  async bulkUpdateStatesByCountry(countryId, status) {
    if (!countryId) {
      throw new Error('countryId is required to bulk update states')
    }
    if (!status) {
      throw new Error('status is required to bulk update states')
    }

    const states = await this.getStateOptions({ country_id: countryId }, { force: true })
    for (const state of states) {
      await this.updateState(state.id, { status })
    }
    this.invalidateOptions('states')
    return states.length
  }

  async bulkUpdateCities({ countryId, stateId, status }) {
    if (!status) {
      throw new Error('status is required to bulk update cities')
    }
    let cityOptions = []
    if (stateId) {
      cityOptions = await this.getCityOptions({ state_id: stateId }, { force: true })
    } else if (countryId) {
      cityOptions = await this.getCityOptions({ country_id: countryId }, { force: true })
    } else {
      throw new Error('Provide a country or state to bulk update cities')
    }

    for (const city of cityOptions) {
      await this.updateCity(city.id, { status })
    }
    this.invalidateOptions('cities')
    return cityOptions.length
  }
}

export default new LocationService()
