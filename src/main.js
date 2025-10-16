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
// Initialize auth store (do not use as plugin)
const auth = useAuthStore()

// 🧩 Global components
Object.entries(lucideIcons).forEach(([name, component]) => {
  app.component(name, component)
})

// 🚀 Mount the app
app.mount('#app')
