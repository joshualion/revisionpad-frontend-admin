<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="handleBackdropClick"
      >
        <div
          class="w-full max-w-2xl rounded-xl border shadow-xl"
          :class="[isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200', sizeClass]"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-6 border-b"
            :class="isDark ? 'border-gray-700' : 'border-gray-200'"
          >
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <button
              v-if="closable"
              @click="close"
              class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 max-h-96 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 p-6 border-t"
            :class="isDark ? 'border-gray-700' : 'border-gray-200'"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { X } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  closable: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(value),
  },
  backdropClosable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-md'
    case 'md':
      return 'max-w-lg'
    case 'lg':
      return 'max-w-2xl'
    case 'xl':
      return 'max-w-4xl'
    case '2xl':
      return 'max-w-6xl'
    default:
      return 'max-w-2xl'
  }
})

const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.backdropClosable) {
    close()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
