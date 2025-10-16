// stores/auth.js
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import SecureLS from 'secure-ls'
import api from '@/http/api'
import { useProfileStore } from './profile'

const ls = new SecureLS({ encodingType: 'aes', isCompression: true })

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'administrator')

  const loadStoredAuth = () => {
    try {
      const storedToken = ls.get('auth_token')
      const storedUser = ls.get('auth_user')

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = storedUser
      }
    } catch (err) {
      console.warn('[Auth] Failed to load stored credentials:', err)
      ls.remove('auth_token')
      ls.remove('auth_user')
    }
  }

  watch(token, (val) => {
    if (val) ls.set('auth_token', val)
    else ls.remove('auth_token')
  })

  watch(user, (val) => {
    if (val) ls.set('auth_user', val)
    else ls.remove('auth_user')
  })

  const loginUser = async (newToken, userData) => {
    token.value = newToken
    user.value = userData

    const profileStore = useProfileStore()

    // Fetch student profile only; admin profile will be added later
    try {
      if (userData?.role === 'student') {
        const res = await api.get('/student/profile', {
          headers: { Authorization: `Bearer ${newToken}` },
        })
        profileStore.setProfile(res.data)
      } else {
        profileStore.setProfile(null)
      }
    } catch (err) {
      console.error('[Auth] Failed to fetch profile:', err)
      profileStore.setProfile(null)
    }

    return true
  }

  const updateUser = (updatedUserData) => {
    user.value = updatedUserData
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore network/backend errors during logout
    } finally {
      token.value = null
      user.value = null
      ls.remove('auth_token')
      ls.remove('auth_user')

      const profileStore = useProfileStore()
      profileStore.clearProfile()
    }
  }

  const getToken = () => {
    return token.value || ls.get('auth_token') || null
  }

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res?.data) user.value = res.data
      return res?.data || null
    } catch {
      return null
    }
  }

  loadStoredAuth()

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    loginUser,
    logout,
    getToken,
    updateUser,
    fetchMe,
  }
})

