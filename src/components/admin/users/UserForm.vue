<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          v-if="showField('first_name')"
          v-model="form.first_name"
          label="First Name"
          placeholder="Enter first name"
          :error="errors.first_name"
          :required="isRequired('first_name')"
        />

        <FormInput
          v-if="showField('last_name')"
          v-model="form.last_name"
          label="Last Name"
          placeholder="Enter last name"
          :error="errors.last_name"
          :required="isRequired('last_name')"
        />

        <FormInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="Enter email address"
          :error="errors.email"
          required
        />

        <FormInput
          v-if="showField('phone')"
          v-model="form.phone"
          type="tel"
          label="Phone"
          placeholder="Enter phone number"
          :error="errors.phone"
          :required="isRequired('phone')"
        />

        <FormInput
          v-if="showField('gender')"
          v-model="form.gender"
          type="select"
          label="Gender"
          placeholder="Select gender"
          :options="genderOptions"
          :error="errors.gender"
          :required="isRequired('gender')"
        />

        <FormInput
          v-if="showField('date_of_birth')"
          v-model="form.date_of_birth"
          type="date"
          label="Date of Birth"
          :error="errors.date_of_birth"
          :required="isRequired('date_of_birth')"
        />
      </div>
    </div>

    <!-- Location Information -->
    <div v-if="showLocationFields" class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Location</h4>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          v-model="form.country_id"
          type="select"
          label="Country"
          placeholder="Select country"
          :options="countries"
          :error="errors.country_id"
          :required="isRequired('country_id')"
        />

        <FormInput
          v-model="form.state_id"
          type="select"
          label="State/Province"
          placeholder="Select state"
          :options="states"
          :error="errors.state_id"
          :required="isRequired('state_id')"
          :disabled="!form.country_id"
        />

        <FormInput
          v-model="form.city_id"
          type="select"
          label="City"
          placeholder="Select city"
          :options="cities"
          :error="errors.city_id"
          :required="isRequired('city_id')"
          :disabled="!form.state_id"
        />
      </div>
    </div>

    <!-- Role-specific Fields -->
    <div v-if="role === 'administrator'" class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Administrator Details</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          v-model="form.access_level"
          type="select"
          label="Access Level"
          placeholder="Select access level"
          :options="accessLevelOptions"
          :error="errors.access_level"
          required
        />
      </div>
    </div>

    <div v-if="role === 'examiner'" class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Examiner Details</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          v-model="form.occupation"
          label="Occupation"
          placeholder="Enter occupation"
          :error="errors.occupation"
          :required="isRequired('occupation')"
        />

        <FormInput
          v-model="form.area_of_expertise"
          label="Area of Expertise"
          placeholder="Enter area of expertise"
          :error="errors.area_of_expertise"
          :required="isRequired('area_of_expertise')"
        />

        <FormInput
          v-model="form.institution_affiliation"
          label="Institution Affiliation"
          placeholder="Enter institution"
          :error="errors.institution_affiliation"
          :required="isRequired('institution_affiliation')"
        />

        <FormInput
          v-model="form.access_level"
          type="select"
          label="Access Level"
          placeholder="Select access level"
          :options="accessLevelOptions"
          :error="errors.access_level"
          required
        />
      </div>

      <FormInput
        v-model="form.bio"
        type="textarea"
        label="Bio"
        placeholder="Enter bio"
        :error="errors.bio"
        :required="isRequired('bio')"
        rows="4"
      />
    </div>

    <!-- Exam-related Fields (for students) -->
    <div v-if="role === 'student'" class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Exam Preferences</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          v-model="form.exam_category_ids"
          type="select"
          label="Exam Categories"
          placeholder="Select exam categories"
          :options="examCategories"
          :error="errors.exam_category_ids"
          :required="isRequired('exam_category_ids')"
          multiple
        />

        <FormInput
          v-model="form.exam_subcategory_ids"
          type="select"
          label="Exam Subcategories"
          placeholder="Select exam subcategories"
          :options="examSubcategories"
          :error="errors.exam_subcategory_ids"
          :required="isRequired('exam_subcategory_ids')"
          multiple
        />

        <FormInput
          v-model="form.exam_ids"
          type="select"
          label="Exams"
          placeholder="Select exams"
          :options="exams"
          :error="errors.exam_ids"
          :required="isRequired('exam_ids')"
          multiple
        />
      </div>
    </div>

    <!-- Password (for new users) -->
    <div v-if="mode === 'create'" class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Security</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Enter password"
          :error="errors.password"
          required
        />

        <FormInput
          v-model="form.password_confirmation"
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          :error="errors.password_confirmation"
          required
        />
      </div>
    </div>

    <!-- Photo Upload -->
    <div class="space-y-4">
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Photo</h4>

      <FormInput
        v-model="form.photo"
        type="file"
        label="Photo"
        accept="image/*"
        :error="errors.photo"
        :required="isRequired('photo')"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import FormInput from '@/components/FormInput.vue'
import userService from '@/services/admin/userService'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (value) => ['student', 'administrator', 'examiner'].includes(value),
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value),
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'change'])

const ensureArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const extractIds = (payload, key = 'id') => {
  return ensureArray(payload)
    .map((item) => {
      if (item == null) return null
      if (typeof item === 'object') {
        return item[key] ?? item.value ?? null
      }
      return item
    })
    .filter((value) => value !== null && value !== undefined)
}

const toOptions = (payload, labelKey = 'name') => {
  return ensureArray(payload).map((item) => ({
    value: item.id ?? item.value,
    label: item[labelKey] ?? item.name ?? item.title ?? '',
  }))
}

const buildDefaultForm = (role = props.role) => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  country_id: '',
  state_id: '',
  city_id: '',
  access_level: '',
  occupation: '',
  area_of_expertise: '',
  institution_affiliation: '',
  bio: '',
  exam_category_ids: [],
  exam_subcategory_ids: [],
  exam_ids: [],
  password: '',
  password_confirmation: '',
  photo: null,
  role,
})

const form = ref(buildDefaultForm())

const resetForm = (role = props.role) => {
  form.value = buildDefaultForm(role)
}

// Field configurations based on role
const fieldConfigs = {
  student: {
    first_name: { required: true },
    last_name: { required: true },
    phone: { required: false },
    gender: { required: false },
    date_of_birth: { required: false },
    country_id: { required: false },
    state_id: { required: false },
    city_id: { required: false },
    exam_category_ids: { required: false },
    exam_subcategory_ids: { required: false },
    exam_ids: { required: false },
  },
  administrator: {
    first_name: { required: true },
    last_name: { required: true },
    phone: { required: false },
    gender: { required: false },
    date_of_birth: { required: false },
    country_id: { required: false },
    state_id: { required: false },
    city_id: { required: false },
    access_level: { required: true },
  },
  examiner: {
    first_name: { required: true },
    last_name: { required: true },
    phone: { required: false },
    country_id: { required: false },
    access_level: { required: true },
    occupation: { required: false },
    area_of_expertise: { required: false },
    institution_affiliation: { required: false },
    bio: { required: false },
  },
}

// Options data
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const accessLevelOptions = [
  { value: 'full', label: 'Full Access' },
  { value: 'limited', label: 'Limited Access' },
  { value: 'read-only', label: 'Read Only' },
]

const countries = ref([])
const states = ref([])
const cities = ref([])
const examCategories = ref([])
const examSubcategories = ref([])
const exams = ref([])

const showLocationFields = computed(() => {
  return showField('country_id') || showField('state_id') || showField('city_id')
})

const showField = (field) => fieldConfigs[props.role]?.[field] !== undefined

const isRequired = (field) => fieldConfigs[props.role]?.[field]?.required || false

const normalizeIncomingData = (data = {}) => {
  const normalized = { ...data }
  normalized.first_name =
    data.first_name ?? data.firstname ?? data.firstName ?? normalized.first_name ?? ''
  normalized.last_name =
    data.last_name ?? data.lastname ?? data.lastName ?? normalized.last_name ?? ''
  normalized.phone = data.phone ?? normalized.phone ?? ''
  normalized.gender = data.gender ?? normalized.gender ?? ''
  normalized.date_of_birth = data.date_of_birth ?? data.dob ?? normalized.date_of_birth ?? ''
  normalized.country_id = data.country_id ?? data.country?.id ?? normalized.country_id ?? ''
  normalized.state_id = data.state_id ?? data.state?.id ?? normalized.state_id ?? ''
  normalized.city_id = data.city_id ?? data.city?.id ?? normalized.city_id ?? ''
  normalized.access_level = data.access_level ?? normalized.access_level ?? ''
  normalized.occupation = data.occupation ?? normalized.occupation ?? ''
  normalized.area_of_expertise = data.area_of_expertise ?? normalized.area_of_expertise ?? ''
  normalized.institution_affiliation =
    data.institution_affiliation ?? normalized.institution_affiliation ?? ''
  normalized.bio = data.bio ?? normalized.bio ?? ''
  normalized.exam_category_ids =
    (Array.isArray(data.exam_category_ids) && data.exam_category_ids.length
      ? data.exam_category_ids
      : extractIds(data.exam_categories)) || []
  normalized.exam_subcategory_ids =
    (Array.isArray(data.exam_subcategory_ids) && data.exam_subcategory_ids.length
      ? data.exam_subcategory_ids
      : extractIds(data.exam_subcategories)) || []
  normalized.exam_ids =
    (Array.isArray(data.exam_ids) && data.exam_ids.length ? data.exam_ids : extractIds(data.exams)) ||
    []
  normalized.role = data.role ?? props.role
  normalized.photo = null
  return normalized
}

const handleSubmit = () => {
  emit('submit', {
    ...form.value,
    role: props.role,
  })
}

const loadInitialData = async () => {
  try {
    const [countriesRes, categoriesRes, subcategoriesRes, examsRes] = await Promise.all([
      userService.getCountries(),
      userService.getExamCategories(),
      userService.getExamSubcategories(),
      userService.getExams(),
    ])

    countries.value = toOptions(countriesRes)
    examCategories.value = toOptions(categoriesRes)
    examSubcategories.value = toOptions(subcategoriesRes)
    exams.value = toOptions(examsRes)
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
}

const loadStates = async (countryId, shouldResetSelection = true) => {
  if (!countryId) {
    states.value = []
    if (shouldResetSelection) {
      form.value.state_id = ''
      form.value.city_id = ''
    }
    return
  }

  try {
    const response = await userService.getStates(countryId)
    states.value = toOptions(response)

    if (shouldResetSelection) {
      form.value.state_id = ''
      form.value.city_id = ''
    } else if (
      form.value.state_id &&
      !states.value.some((state) => String(state.value) === String(form.value.state_id))
    ) {
      form.value.state_id = ''
    }
  } catch (error) {
    console.error('Failed to load states:', error)
  }
}

const loadCities = async (stateId, shouldResetSelection = true) => {
  if (!stateId) {
    cities.value = []
    if (shouldResetSelection) {
      form.value.city_id = ''
    }
    return
  }

  try {
    const response = await userService.getCities(stateId)
    cities.value = toOptions(response)

    if (shouldResetSelection) {
      form.value.city_id = ''
    } else if (
      form.value.city_id &&
      !cities.value.some((city) => String(city.value) === String(form.value.city_id))
    ) {
      form.value.city_id = ''
    }
  } catch (error) {
    console.error('Failed to load cities:', error)
  }
}

watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length) {
      form.value = {
        ...buildDefaultForm(props.role),
        ...normalizeIncomingData(newData),
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.role,
  (newRole) => {
    form.value.role = newRole
  },
)

watch(
  () => form.value.country_id,
  (newCountry, oldCountry) => {
    if (newCountry === oldCountry) return
    if (!newCountry) {
      states.value = []
      cities.value = []
      form.value.state_id = ''
      form.value.city_id = ''
      return
    }
    loadStates(newCountry, Boolean(oldCountry))
  },
)

watch(
  () => form.value.state_id,
  (newState, oldState) => {
    if (newState === oldState) return
    if (!newState) {
      cities.value = []
      form.value.city_id = ''
      return
    }
    loadCities(newState, Boolean(oldState))
  },
)

watch(
  form,
  (newForm) => {
    emit('change', { ...newForm })
  },
  { deep: true },
)

onMounted(async () => {
  await loadInitialData()
  if (form.value.country_id) {
    await loadStates(form.value.country_id, false)
  }
  if (form.value.state_id) {
    await loadCities(form.value.state_id, false)
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
