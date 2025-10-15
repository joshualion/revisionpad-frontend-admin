<template>
  <div class="min-h-screen bg-[#fdf7e3] flex flex-col justify-between">
    <!-- Header -->
    <LandingHeader />

    <div class="flex flex-col items-center justify-center py-6 px-4 text-center">
      <h2 class="text-2xl font-bold text-[#1f2937] mb-4">Verify Your Email 📧</h2>
      <p class="text-[#555] mb-6 max-w-md">
        We’ve sent a 6-digit code to your email. Please enter it below to verify your account.
      </p>

      <input
        v-model="verificationCode"
        type="text"
        maxlength="6"
        class="text-center form  text-gray-900 px-4 py-2 border  rounded-md w-40 text-lg tracking-widest font-mono"
        placeholder="______"
      />



      <button
        @click="submitCode"
        class="mt-6 bg-[#f59e0b] hover:bg-[#e48d07] text-white px-6 py-2 rounded shadow"
        :disabled="loading"
      >
        {{ loading ? 'Verifying...' : 'Verify Code' }}
      </button>

      <p class="mt-4 text-sm text-[#666]">
        Didn’t get the email?
        <a href="#" @click.prevent="resendCode" class="text-[#f59e0b] font-semibold">Resend</a>
      </p>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/http/api'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const auth = useAuthStore()

const verificationCode = ref('')
const loading = ref(false)

onMounted(() => {
  // ✅ If already verified, bounce to profile
  if (auth.authStage !== 'unverifiedEmail') {
    router.replace('/profile')
  }
})

async function submitCode() {
  loading.value = true
  try {
    const response = await api.post(
      '/auth/verify-code',
      { code: verificationCode.value },
      {
        headers: {
          Authorization: `Bearer ${auth.getToken()}`,
        },
      }
    )

    if (response.data.success) {
      // ✅ Update user in store
      const updatedUser = response.data.user || {
        ...auth.user,
        email_verified_at: new Date().toISOString(),
      }

      auth.updateUser(updatedUser)

      toast.success('Email verified successfully!', { autoClose: 2000 })

      // ✅ Go to profile setup
      router.push('/profile')
    }
  } catch (error) {
    toast.error('Verification failed: ' + (error.response?.data?.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  try {
    await api.post('/auth/resend-code', {}, {
      headers: {
        Authorization: `Bearer ${auth.getToken()}`,
      },
    })
    toast.success('Verification code resent!')
  } catch (error) {
    toast.error('Failed to resend code. ' + (error.response?.data?.message || 'Unknown error'))
  }
}
</script>



<style scoped>
input {
  transition: border-color 0.3s ease;
}
input:focus {
  border-color: #f59e0b;
  outline: none;
}
button:disabled {
  background-color: #f59e0b;
  cursor: not-allowed;
}
button:hover:disabled {
  background-color: #f59e0b;
}
</style>
