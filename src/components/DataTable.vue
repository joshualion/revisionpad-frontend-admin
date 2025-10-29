<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div class="flex gap-2 flex-wrap">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          :placeholder="searchPlaceholder"
          class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm min-w-0 flex-1 sm:flex-none sm:w-64"
        />
        <select
          v-if="filterOptions.length"
          v-model="selectedFilter"
          @change="applyFilters"
          class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"
        >
          <option value="">All {{ filterLabel }}</option>
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <button
          v-if="showBulkActions && selectedRows.length"
          @click="handleBulkDelete"
          class="px-3 h-10 rounded border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
        >
          Delete Selected ({{ selectedRows.length }})
        </button>
      </div>
      <div class="text-xs text-gray-500">Total: {{ totalItems }}</div>
    </div>

    <!-- Table -->
    <div
      class="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-none border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr class="text-left text-gray-500 dark:text-gray-400">
            <th v-if="showBulkActions" class="py-3 px-4">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
                class="rounded border-gray-300 dark:border-gray-700"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              class="py-3 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="sortBy(column.key)"
            >
              <div class="flex items-center gap-1">
                {{ column.label }}
                <ChevronUp v-if="sortField === column.key && sortOrder === 'asc'" class="w-4 h-4" />
                <ChevronDown
                  v-if="sortField === column.key && sortOrder === 'desc'"
                  class="w-4 h-4"
                />
              </div>
            </th>
            <th v-if="actions.length" class="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="item in paginatedItems"
            :key="item.id || item"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <td v-if="showBulkActions" class="py-3 px-4">
              <input
                type="checkbox"
                :checked="selectedRows.includes(item.id)"
                @change="toggleRow(item.id)"
                class="rounded border-gray-300 dark:border-gray-700"
              />
            </td>
            <td v-for="column in columns" :key="column.key" class="py-3 px-4">
              <slot :name="`column-${column.key}`" :item="item" :value="item[column.key]">
                {{ item[column.key] }}
              </slot>
            </td>
            <td v-if="actions.length" class="py-3 px-4">
              <div class="flex gap-2">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  @click="handleAction(action, item)"
                  :class="action.class"
                  class="px-2 py-1 rounded text-xs"
                >
                  {{ action.label }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && (!paginatedItems || !paginatedItems.length)">
            <td :colspan="totalColumns" class="py-6 text-center text-gray-500">No items found</td>
          </tr>
          <template v-if="loading">
            <tr v-for="i in 5" :key="'sk-' + i">
              <td v-if="showBulkActions" class="py-3 px-4">
                <div class="h-4 w-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </td>
              <td v-for="column in columns" :key="column.key" class="py-3 px-4">
                <div
                  class="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"
                  :class="`w-${Math.floor(Math.random() * 3) + 2}/12`"
                ></div>
              </td>
              <td v-if="actions.length" class="py-3 px-4">
                <div class="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} entries
      </div>
      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage <= 1 || loading"
          @click="goToPage(currentPage - 1)"
          class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 text-sm"
        >
          Previous
        </button>
        <div class="text-sm text-gray-500">Page {{ currentPage }} of {{ totalPages }}</div>
        <button
          :disabled="currentPage >= totalPages || loading"
          @click="goToPage(currentPage + 1)"
          class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  actions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  filterLabel: {
    type: String,
    default: 'filter',
  },
  filterOptions: {
    type: Array,
    default: () => [],
  },
  showBulkActions: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  sortable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['search', 'filter', 'sort', 'page-change', 'action', 'bulk-delete'])

const searchQuery = ref('')
const selectedFilter = ref('')
const selectedRows = ref([])
const sortField = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)

const totalItems = computed(() => props.items.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * props.itemsPerPage + 1)
const endItem = computed(() => Math.min(currentPage.value * props.itemsPerPage, totalItems.value))

const filteredItems = computed(() => {
  let items = [...props.items]

  // Search
  if (searchQuery.value) {
    items = items.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    )
  }

  // Filter
  if (selectedFilter.value) {
    items = items.filter(
      (item) => item.role === selectedFilter.value || item.status === selectedFilter.value,
    )
  }

  // Sort
  if (sortField.value) {
    items.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]

      if (sortOrder.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return items
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredItems.value.slice(start, end)
})

const allSelected = computed(() => {
  return (
    paginatedItems.value.length > 0 && selectedRows.value.length === paginatedItems.value.length
  )
})

const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.showBulkActions) count++
  if (props.actions.length) count++
  return count
})

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    emit('search', searchQuery.value)
  }, 300)
}

const applyFilters = () => {
  currentPage.value = 1
  emit('filter', selectedFilter.value)
}

const sortBy = (field) => {
  if (!props.sortable) return

  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }

  emit('sort', { field, order: sortOrder.value })
}

const goToPage = (page) => {
  currentPage.value = page
  emit('page-change', page)
}

const toggleRow = (id) => {
  const index = selectedRows.value.indexOf(id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(id)
  }
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedRows.value = selectedRows.value.filter(
      (id) => !paginatedItems.value.find((item) => item.id === id),
    )
  } else {
    const newIds = paginatedItems.value
      .map((item) => item.id)
      .filter((id) => !selectedRows.value.includes(id))
    selectedRows.value.push(...newIds)
  }
}

const handleAction = (action, item) => {
  emit('action', { action: action.key, item })
}

const handleBulkDelete = () => {
  emit('bulk-delete', selectedRows.value)
}

// Reset pagination when items change
watch(
  () => props.items,
  () => {
    currentPage.value = 1
    selectedRows.value = []
  },
)
</script>

<style scoped>
/* Additional styles if needed */
</style>
