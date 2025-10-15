import './assets/tailwind.css'
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
//import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import * as lucideIcons from 'lucide-vue-next'
import LogoImage from './components/LogoImage.vue'
import { useAuthStore } from '@/stores/auth'
import { isDark, toggleDark } from './composables/useTheme'

const app = createApp(App)

// 🌒 Global theme toggles
app.config.globalProperties.isDark = isDark
app.config.globalProperties.toggleDark = toggleDark

// ✅ Create Pinia and apply persistedstate plugin
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 🧭 Routing
app.use(router)

// // 🔥 Toastify setup
// app.use('', {
//   autoClose: 30000,
//   position: toast.POSITION.TOP_CENTER,
//   theme: 'dark',
//   hideProgressBar: false,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   newestOnTop: true,
// })

// 👤 Setup auth store (optional)
const auth = useAuthStore()
app.use(auth) // <- this `app.use(auth)` is unnecessary unless `auth` is a plugin — probably safe to remove

// 🧩 Global components
Object.entries(lucideIcons).forEach(([name, component]) => {
  app.component(name, component)
})
app.component('LogoImage', LogoImage)

// 🚀 Mount the app
app.mount('#app')
