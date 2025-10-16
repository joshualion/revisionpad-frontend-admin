<template>
  <AdminLayout>
    <div class="min-h-[60vh] flex items-center justify-center px-4">
      <div
        v-if="formVisible"
        class="w-full max-w-xl mx-auto p-6 rounded-lg shadow-lg"
        :class="isDark ? 'bg-gray-900 text-white border border-gray-800' : 'bg-white text-gray-800 border border-gray-200'"
      >
      <!-- Banner/Header -->
      <div class="mb-6 text-center bg-gray-700 p-6 rounded-lg">
        <h1 class="text-3xl font-extrabold mb-2 text-white">🔒 Change Password</h1>
        <p class="text-sm text-gold">Keep your account safe and secure.</p>
      </div>

      <!-- Change Password Form -->
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Current Password -->
        <div class="relative">
          <Lock class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.current_password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="     Current Password"
            class="form form-control w-full pl-10 pr-12"
          />
        </div>

        <!-- New Password -->
        <div class="relative">
          <Lock class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="     New Password"
            class="form form-control w-full pl-10 pr-12"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>

        <!-- Confirm Password -->
        <div class="relative">
          <LockKeyhole class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            v-model="form.password_confirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="     Confirm Password"
            class="form form-control w-full pl-10 pr-12"
          />
          <button
            type="button"
            @click="togglePasswordVisibility"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn-secondary text-white w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          :disabled="loading"
        >
          <component
            :is="loading ? Loader : LockOpen"
            :class="{ 'animate-spin w-5 h-5': loading, 'w-5 h-5': !loading }"
          />
          <span>{{ loading ? 'Updating...' : 'Change Password' }}</span>
        </button>
      </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayOut.vue'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import { Lock, Loader, LockOpen, LockKeyhole, Eye, EyeOff } from 'lucide-vue-next'
import { useDark } from '@vueuse/core'

//const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const formVisible = ref(true)

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submit = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/change-password', form.value)
    toast.success(response.data.message || 'Password changed successfully')
    form.value.current_password = ''
    form.value.password = ''
    form.value.password_confirmation = ''
  } catch (error) {
    toast.error(error.response?.data?.message || 'Change password failed')
  } finally {
    loading.value = false
  }
}
</script>
