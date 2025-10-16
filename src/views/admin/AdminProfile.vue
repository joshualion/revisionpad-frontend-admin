<template>
  <AdminLayout>
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold">Admin Profile</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Account details and preferences</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Summary Card -->
        <div class="lg:col-span-1 rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              <template v-if="previewUrl || adminPhoto">
                <img :src="previewUrl || photoUrl" alt="Profile" class="w-16 h-16 object-cover" />
              </template>
              <template v-else>
                <User2 class="w-8 h-8" />
              </template>
            </div>
            <div>
              <h2 class="text-lg font-semibold">{{ firstName + ' ' + lastName || '—' }}</h2>
              <p class="text-xs text-gray-500">{{ auth.user?.email || '—' }}</p>
              <span class="mt-2 inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">{{ auth.user?.role || 'administrator' }}</span>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            <p>Member since —  {{ sinceDate }}</p>
          </div>
          <div class="mt-4">
            <label class="block text-xs text-gray-500 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" @change="onPhotoSelect" class="block w-full text-sm" />
            <button
              class="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition disabled:opacity-50"
              :disabled="photoUploading || !photoFile"
              @click="updatePhoto"
            >
              <span v-if="photoUploading">Uploading...</span>
              <span v-else>Upload Photo</span>
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="lg:col-span-2 space-y-4">
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Basic Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500">Full Name</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ firstName + ' ' + lastName || '—' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Email</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ auth.user?.email || '—' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Role</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">{{ auth.user?.role || 'administrator' }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500">Status</label>
                <div class="mt-1 h-10 rounded border border-gray-200 dark:border-gray-800 flex items-center px-3">
                  <span class="text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Profile -->
          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Edit Profile</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500">First Name</label>
                <input v-model="firstName" type="text" class="form form-control" />
              </div>
              <div>
                <label class="block text-xs text-gray-500">Last Name</label>
                <input v-model="lastName" type="text" class="form form-control" />
              </div>
              <div>
                <label class="block text-xs text-gray-500">Phone</label>
                <input v-model="phone" type="text" class="form form-control" />
              </div>
              <div>
                <label class="block text-xs text-gray-500">Date of Birth</label>
                <input v-model="dob" type="date" class="form form-control" />
              </div>
              <div>
                <label class="block text-xs text-gray-500">Gender</label>
                <select v-model="gender" class="form-select">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label class="block text-xs text-gray-500">Country</label>
                <select v-model="countryId" @change="onCountryChange" class="form-select">
                  <option value="">Select Country</option>
                  <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500">State</label>
                <select v-model="stateId" @change="onStateChange" class="form-select" :disabled="!states.length">
                  <option value="">Select State</option>
                  <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500">City</label>
                <select v-model="cityId" class="form-select" :disabled="!cities.length">
                  <option value="">Select City</option>
                  <option v-for="ci in cities" :key="ci.id" :value="ci.id">{{ ci.name }}</option>
                </select>
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <button @click="saveProfile" :disabled="saving" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-800 transition disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save Profile' }}
              </button>
              <button @click="completeProfile" :disabled="saving" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition disabled:opacity-50">
                Complete Profile
              </button>
            </div>
          </div>

          <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
            <h3 class="font-semibold mb-3">Security</h3>
            <div class="flex flex-wrap gap-2">
              <RouterLink to="/change/password" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition">
                <Lock class="w-4 h-4" /> Change Password
              </RouterLink>
              <button @click="logout" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">
                <LogOut class="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDark } from '@vueuse/core'
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { User2, Lock, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/http/api'


const auth = useAuthStore()
const router = useRouter()

const sinceDate = computed(() => {
  if (!auth.user?.created_at) return '—'
  const date = new Date(auth.user.created_at)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
})

const logout = async () => {
  await auth.logout()
  toast.info('Logged out successfully.')
  router.push('/')
}

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })

// Form state
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const dob = ref('')
const gender = ref('')
const countryId = ref('')
const stateId = ref('')
const cityId = ref('')
const countries = ref([])
const states = ref([])
const cities = ref([])
const saving = ref(false)
const photoFile = ref(null)
const photoUploading = ref(false)
const adminPhoto = ref('')
const previewUrl = ref('')

onMounted(async () => {
  await fetchCountries()
  await loadProfile()
})

async function fetchCountries() {
  try {
    const { data } = await api.get('/admin/countries')
    countries.value = data?.data || data || []
  } catch { /* empty */ }
}

async function fetchStates() {
  if (!countryId.value) { states.value = []; return }
  try {
    const { data } = await api.get('/admin/states', { params: { country_id: countryId.value } })
    states.value = data?.data || data || []
  } catch {
    //do nothing for now
  }
}

async function fetchCities() {
  if (!stateId.value) { cities.value = []; return }
  try {
    const { data } = await api.get('/admin/cities', { params: { state_id: stateId.value } })
    cities.value = data?.data || data || []
  } catch {
    //do nothing for now
  }
}

function onCountryChange() {
  stateId.value = ''
  cityId.value = ''
  states.value = []
  cities.value = []
  fetchStates()
}

function onStateChange() {
  cityId.value = ''
  cities.value = []
  fetchCities()
}

async function loadProfile() {
  try {
    const { data } = await api.get('/admin/profile')
    const a = data?.administrator || data
    if (a) {
      firstName.value = a.first_name || a.firstname || ''
      lastName.value = a.last_name || a.lastname || ''
      phone.value = a.phone || ''
      dob.value = a.date_of_birth || ''
      gender.value = a.gender || ''
      countryId.value = a.country_id || ''
      stateId.value = a.state_id || ''
      cityId.value = a.city_id || ''
      adminPhoto.value = a.photo || ''
      if (countryId.value) await fetchStates()
      if (stateId.value) await fetchCities()
    }
  } catch {
    //do nothing for now
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const payload = {
      firstname: firstName.value,
      lastname: lastName.value,
      phone: phone.value,
      date_of_birth: dob.value,
      gender: gender.value,
      country_id: countryId.value || null,
      state_id: stateId.value || null,
      city_id: cityId.value || null,
    }
    await api.post('/admin/profile', payload)
    toast.success('Profile saved')
    await loadProfile()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Save failed')
  } finally {
    saving.value = false
  }
}

async function completeProfile() {
  saving.value = true
  try {
    const payload = {
      firstname: firstName.value,
      lastname: lastName.value,
      date_of_birth: dob.value,
      country_id: countryId.value,
      phone: phone.value,
      gender: gender.value,
      state_id: stateId.value || null,
      city_id: cityId.value || null,
    }
    await api.post('/admin/complete-profile', payload)
    toast.success('Profile completed')
    await loadProfile()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Complete failed')
  } finally {
    saving.value = false
  }
}

function onPhotoSelect(e) {
  const f = e?.target?.files?.[0]
  photoFile.value = f || null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  if (photoFile.value) {
    previewUrl.value = URL.createObjectURL(photoFile.value)
  }
}

async function updatePhoto() {
  if (!(photoFile.value instanceof File)) {
    toast.error('Please choose an image file')
    return
  }
  photoUploading.value = true
  try {
    const fd = new FormData()
    fd.append('photo', photoFile.value)
    // Support servers that require method spoofing for file uploads
    fd.append('_method', 'PATCH')
    const { data } = await api.post('/admin/profile/photo', fd)
    const newPhoto = data?.photo || data?.administrator?.photo
    if (newPhoto) adminPhoto.value = newPhoto
    toast.success('Photo updated')
    // clear selection and preview
    photoFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.response?.data?.errors?.photo?.[0] || 'Photo upload failed'
    toast.error(msg)
  } finally {
    photoUploading.value = false
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const photoUrl = computed(() => {
  if (!adminPhoto.value) return ''
  if (adminPhoto.value.startsWith('http')) return adminPhoto.value
  const base = import.meta.env.VITE_BACKEND_URL || ''
  return `${base}/storage/${adminPhoto.value}`
})
</script>

<style scoped>
</style>
