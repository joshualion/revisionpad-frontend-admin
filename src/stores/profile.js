import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    data: null
  }),
  actions: {
    setProfile(profile) {
      this.data = profile
    },
    clearProfile() {
      this.data = null
    }
  },
  persist: true // <-- This makes the profile persist like auth
})
