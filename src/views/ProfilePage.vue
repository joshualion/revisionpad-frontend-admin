<template>
  <div class="min-h-screen flex flex-col" :class="isDark ? 'text-white ' : 'text-gray-800 '">
    <!-- Header -->
    <LandingHeader />

    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Step Indicator -->
      <div class="flex justify-between items-center mb-8 flex-wrap gap-4 text-sm">
        <div v-for="(step, index) in steps" :key="index" class="flex items-center gap-2">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
              stepIndex === index ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-800',
            ]"
          >
            {{ index + 1 }}
          </div>
          <div :class="['font-medium', stepIndex === index ? 'text-yellow-600' : 'text-gray-600']">
            {{ step }}
          </div>
          <div v-if="index !== steps.length - 1" class="w-8 h-1 bg-gray-300"></div>
        </div>
      </div>

      <form
        @submit.prevent="submitProfile"
        class="shadow-md rounded-lg p-6 space-y-6 max-w-5xl mx-auto"
        :class="isDark ? 'bg-[#1f2937] text-white' : 'bg-white text-dark'"
      >
        <!-- Step 1: Personal Info -->
        <div v-if="stepIndex === 0" class="space-y-4">
          <h2 class="text-lg font-semibold">Personal Information</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
              <input
                v-model="firstName"
                id="firstName"
                type="text"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
              <input
                v-model="lastName"
                id="lastName"
                type="text"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium mb-1">Phone Number</label>
              <input
                v-model="phone"
                id="phone"
                type="text"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <label for="dob" class="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                v-model="dob"
                id="dob"
                type="date"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>

            <div>
              <label for="gender" class="block text-sm font-medium mb-1">Gender</label>
              <select
                v-model="gender"
                id="gender"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>


        <div class="md:col-span-2">
          <label for="photo" class="block text-sm font-medium mb-1">Profile Photo</label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            @change="handlePhotoUpload"
            class="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                  file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700
                  hover:file:bg-yellow-100"
          />

          <!-- 🖼️ Move preview here -->
          <div v-if="previewPhoto" class="mt-4">
            <p class="text-sm text-gray-500 mb-1">Preview:</p>
            <img
              :src="previewPhoto"
              alt="Profile Preview"
              class="w-32 h-32 object-cover rounded-full border border-gray-300 shadow-sm"
            />
          </div>
        </div>





          </div>
        </div>

        <!-- Step 2: Location Info -->
        <div v-if="stepIndex === 1" class="space-y-4">
          <h2 class="text-lg font-semibold">Location Information</h2>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label for="country" class="block text-sm font-medium mb-1">Country</label>
              <select
                v-model="countryId"
                @change="onCountryChange"
                id="country"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select Country</option>
                <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div>
              <label for="state" class="block text-sm font-medium mb-1">State / Province</label>
              <select
                v-model="stateId"
                @change="fetchCities"
                id="state"
                :disabled="!states.length"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select State / Province</option>
                <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label for="city" class="block text-sm font-medium mb-1">City</label>
              <select
                v-model="cityId"
                id="city"
                :disabled="!cities.length"
                class="form-select w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select City</option>
                <option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 3: Exam Info -->
<div v-if="stepIndex === 2" class="space-y-6">
  <h2 class="text-lg font-semibold">Exam Preferences</h2>

  <!-- Exam Categories -->
  <div>
    <label class="block text-sm font-medium mb-1">Exam Categories</label>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <div v-for="cat in examCategories" :key="cat.id" class="flex items-center gap-2">
        <input
          type="checkbox"
          :value="cat.id"
          v-model="selectedExamCategoryIds"
          :id="'exam-cat-' + cat.id"
          class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
        />
        <label :for="'exam-cat-' + cat.id" class="text-sm">{{ cat.name }}</label>
      </div>
    </div>
  </div>

  <!-- Exam Subcategories -->
  <div>
    <label class="block text-sm font-medium mb-1">Exam Subcategories</label>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <div v-for="sub in examSubcategories" :key="sub.id" class="flex items-center gap-2">
        <input
          type="checkbox"
          :value="sub.id"
          v-model="selectedSubcategoryIds"
          :id="'exam-subcat-' + sub.id"
          class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
        />
        <label :for="'exam-subcat-' + sub.id" class="text-sm">{{ sub.name }}</label>
      </div>
    </div>
  </div>

  <!-- Exams -->
  <div v-if="exams.length">
    <label class="block text-sm font-medium mb-1">Exams</label>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <div v-for="exam in exams" :key="exam.id" class="flex items-center gap-2">
        <input
          type="checkbox"
          :value="exam.id"
          v-model="selectedExamIds"
          :id="'exam-' + exam.id"
          class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
        />
        <label :for="'exam-' + exam.id" class="text-sm">{{ exam.title }}</label>
      </div>
    </div>
  </div>
</div>


        <!-- Navigation -->
        <div class="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="prevStep"
            :disabled="stepIndex === 0"
            class="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            ← Back
          </button>

          <button
            v-if="stepIndex < steps.length - 1"
            type="button"
            @click="nextStep"
            class="btn btn-secondary px-4 py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
          >
            Next →
          </button>

          <button
            v-if="stepIndex === steps.length - 1"
            type="submit"
            :disabled="loading"
            class="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Finish' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import router from '@/router'
import LandingHeader from '@/components/LandingPageHeader.vue'
import AppFooter from '@/components/LandingPageFooter.vue'
import { useAuthStore } from '@/stores/auth'
import debounce from 'lodash/debounce'
import { useDark } from '@vueuse/core'

const auth = useAuthStore()

// Form Fields
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const gender = ref('')
const dob = ref('')
const countryId = ref('')
const stateId = ref('')
const cityId = ref('')
const photo = ref(null)
const previewPhoto = ref('')


// Handle photo upload and preview
const handlePhotoUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    photo.value = file
    previewPhoto.value = URL.createObjectURL(file)
  }
}


// Location & Exam Data
const countries = ref([])
const states = ref([])
const cities = ref([])
const examCategories = ref([])
const examSubcategories = ref([])

const selectedExamCategoryIds = ref([])
const selectedSubcategoryIds = ref([])
const selectedExamIds = ref([])

const loading = ref(false)
const stepIndex = ref(0)
const steps = ['Personal', 'Location', 'Exams']

const nextStep = () => stepIndex.value++
const prevStep = () => stepIndex.value--

// Theme toggle (dark/light)
const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
})
watch(isDark, (dark) => {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
})

// Fetch countries on mount
onMounted(() => {
  fetchCountries()
  fetchProfile() // Load and prefill after countries load
})

// Fetch initial data
const fetchProfile = async () => {
  try {
    const { data } = await api.get('/student/profile')

    if (!data?.student) return

    const s = data.student

    // Personal info
    firstName.value = s.first_name || ''
    lastName.value = s.last_name || ''
    phone.value = s.phone || ''
    gender.value = s.gender || ''
    dob.value = s.date_of_birth ? s.date_of_birth.slice(0, 10) : ''
    // Photo
        photo.value = null // Reset photo input
        previewPhoto.value = null // Reset preview
        if (s.photo && s.photo.startsWith('http')) {
          previewPhoto.value = s.photo // Use full URL if available
        } else {
          const backendURL = import.meta.env.VITE_BACKEND_URL;
          previewPhoto.value = `${backendURL}/storage/${s.photo}`;
        }



    // Location
    countryId.value = s.country_id
    await fetchStates()
    stateId.value = s.state_id
    await fetchCities()
    cityId.value = s.city_id

     // Fetch options before setting selected values
    await fetchExamCategories()
    selectedExamCategoryIds.value = s.exam_category_ids || []

    await fetchExamSubcategories()
    selectedSubcategoryIds.value = s.exam_subcategory_ids || []

    await fetchExams()
    selectedExamIds.value = s.exam_ids || []

  } catch (err) {
    toast.error('Error loading profile: ' + (err.response?.data?.message || ''))
  }
}


// ========== API Functions ==========

const fetchCountries = async () => {
  try {
    const { data } = await api.get('/student/countries')
    countries.value = data.data.sort((a, b) => a.name.localeCompare(b.name))
    states.value = []
    cities.value = []
    stateId.value = ''
    cityId.value = ''
  } catch (error) {
    toast.error('Failed to fetch countries.' + (error.response?.data?.message || ''))
  }
}

const onCountryChange = () => {
  stateId.value = ''
  cityId.value = ''
  states.value = []
  cities.value = []
  examCategories.value = []
  selectedExamCategoryIds.value = []
  fetchStates()
  fetchExamCategories()
}

const fetchStates = async () => {
  if (!countryId.value) return
  const { data } = await api.get('/student/states', {
    params: { country_id: countryId.value },
  })
  states.value = data.data
  cities.value = []
}

const fetchCities = async () => {
  if (!stateId.value) return
  const { data } = await api.get('/student/cities', {
    params: { state_id: stateId.value },
  })
  cities.value = data.data
}

const fetchExamCategories = async () => {
  if (!countryId.value) return
  const { data } = await api.get('/student/exam-categories', {
    params: { country_id: countryId.value },
  })
  examCategories.value = data
}

const fetchExamSubcategories = async () => {
  if (!selectedExamCategoryIds.value.length) {
    examSubcategories.value = []
    return
  }

  const { data } = await api.get('/student/exam-subcategories', {
    params: { category_ids: selectedExamCategoryIds.value },
  })

  examSubcategories.value = data.data
}

const exams = ref([])

const fetchExams = debounce(async () => {
  if (!selectedSubcategoryIds.value.length) {
    exams.value = []
    return
  }

  const { data } = await api.get('/student/exams', {
    params: { subcategory_ids: selectedSubcategoryIds.value },
  })

  exams.value = data.data ?? data // Just in case Laravel wraps it
}, 500)


// ========== Watchers ==========

watch(selectedExamCategoryIds, () => {
  selectedSubcategoryIds.value = []
  selectedExamIds.value = []
  examSubcategories.value = []
  exams.value = {}
  fetchExamSubcategories()
})

watch(selectedSubcategoryIds, () => {
  selectedExamIds.value = []
  fetchExams()
})

// ========== Form Submission ==========

const submitProfile = async () => {
  loading.value = true
  try {
    const formData = new FormData()

    formData.append('first_name', firstName.value)
    formData.append('last_name', lastName.value)
    formData.append('phone', phone.value)
    formData.append('gender', gender.value)
    formData.append('date_of_birth', dob.value)
    formData.append('country_id', countryId.value)
    formData.append('state_id', stateId.value)
    formData.append('city_id', cityId.value)

    if (photo.value) {
      formData.append('photo', photo.value)
    }

    selectedExamCategoryIds.value.forEach(id => formData.append('exam_category_ids[]', id))
    selectedSubcategoryIds.value.forEach(id => formData.append('exam_subcategory_ids[]', id))
    selectedExamIds.value.forEach(id => formData.append('exam_ids[]', id))

    const response = await api.post('student/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.success) {
      auth.updateUser({
        ...auth.user,
        email_verified_at: new Date().toISOString(),
      })
    }

    toast.success('Profile saved!', {
      autoClose: 3000,
      pauseOnHover: true,
      draggable: true,
    })

    if (response.data?.user) {
      auth.setUser(response.data.user)
    }

    await router.push('/')
  } catch (err) {
    toast.error('Error: ' + (err.response?.data?.message || 'Could not save profile.'))
  } finally {
    loading.value = false
  }
}


</script>

<style scoped>
.form-select {
  background-color: #f9fafb; /* light gray */
  color: #374151; /* gray-800 */
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem; /* rounded-md */
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-select:hover,
.form-select:focus {
  background-color: #fff !important; /* or your brand color */
  border-color: #f59e0b !important;
  box-shadow: none !important;
  color: #374151 !important;
}
</style>

