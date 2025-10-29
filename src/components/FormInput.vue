<template>
  <div class="space-y-1">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Text Input -->
      <input
        v-if="
          type === 'text' ||
          type === 'email' ||
          type === 'password' ||
          type === 'number' ||
          type === 'tel' ||
          type === 'url'
        "
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full h-10 rounded border px-3 text-sm transition"
        :class="[
          isDark
            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-yellow-500 focus:ring-yellow-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400',
          icon ? 'pl-10' : '',
        ]"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full rounded border px-3 py-2 text-sm transition resize-vertical"
        :class="[
          isDark
            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-yellow-500 focus:ring-yellow-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400',
          icon ? 'pl-10' : '',
        ]"
      ></textarea>

      <!-- Select -->
      <select
        v-else-if="type === 'select'"
        :id="inputId"
        v-model="selectValue"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full h-10 rounded border px-3 text-sm transition appearance-none"
        :class="[
          isDark
            ? 'bg-gray-800 border-gray-600 text-gray-100'
            : 'bg-white border-gray-300 text-gray-900',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-yellow-500 focus:ring-yellow-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400',
        ]"
      >
        <option v-if="placeholder && !multiple" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- File Input -->
      <input
        v-else-if="type === 'file'"
        :id="inputId"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        @change="handleFileChange"
        @blur="handleBlur"
        @focus="handleFocus"
        class="w-full h-10 rounded border px-3 text-sm transition file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium"
        :class="[
          isDark
            ? 'bg-gray-800 border-gray-600 text-gray-100 file:bg-gray-700 file:text-gray-100'
            : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'focus:border-yellow-500 focus:ring-yellow-500',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400',
        ]"
      />

      <!-- Icon -->
      <div
        v-if="icon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <component :is="icon" class="w-4 h-4" />
      </div>

      <!-- Select Arrow -->
      <div
        v-if="type === 'select'"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <ChevronDown class="w-4 h-4" />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>

    <!-- Help Text -->
    <p v-if="help && !error" class="text-sm text-gray-500 dark:text-gray-400">
      {{ help }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, File, FileList],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) =>
      ['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select', 'file'].includes(
        value,
      ),
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  help: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Object,
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Number,
    default: 3,
  },
  min: {
    type: [Number, String],
    default: '',
  },
  max: {
    type: [Number, String],
    default: '',
  },
  step: {
    type: [Number, String],
    default: '',
  },
  pattern: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change'])

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const selectValue = computed({
  get: () => {
    if (props.type === 'select' && props.multiple) {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue
      }
      return props.modelValue ? [props.modelValue] : []
    }
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event) => {
  let value = event.target.value
  if (event.target.type === 'number' && value !== '') {
    value = Number(value)
  }
  emit('update:modelValue', value)
  emit('change', value)
}

const handleFileChange = (event) => {
  const files = props.multiple ? event.target.files : event.target.files[0]
  emit('update:modelValue', files)
  emit('change', files)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
/* Custom file input styling */
input[type='file']::-webkit-file-upload-button {
  @apply mr-4 py-1 px-3 rounded border-0 text-sm font-medium;
}

input[type='file']::-webkit-file-upload-button:hover {
  @apply opacity-80;
}
</style>
