<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
        <div class="flex flex-wrap items-center justify-between gap-2 p-3" :class="isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'">
          <div class="font-bold text-gold">Yearly Questions</div>
          <div class="flex items-center gap-2">
            <button @click="openCreate" class="inline-flex items-center gap-2 px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 text-sm"><Plus class="w-4 h-4"/> New</button>
            <button @click="openImport" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Import CSV</button>
            <button @click="openBulk" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Bulk Add</button>
            <button @click="downloadTemplate" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">CSV Template</button>
            <div class="relative">
              <button @click="columnsMenu = !columnsMenu" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Columns</button>
              <div v-if="columnsMenu" class="absolute right-0 mt-2 w-56 rounded-md border shadow-sm z-10" :class="isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
                <div class="p-2 text-xs">
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.sel"/> Select</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.id"/> ID</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.question"/> Question</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.exam"/> Exam</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.subject"/> Subject</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.year"/> Year</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.type"/> Type</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.source"/> Source</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.marks"/> Marks</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.attach"/> Attach</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.created"/> Created</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.user"/> Author</label>
                  <label class="flex items-center gap-2 py-1"><input type="checkbox" v-model="columns.actions"/> Actions</label>
                </div>
              </div>
            </div>
            <button @click="refresh" :disabled="loading" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm disabled:opacity-50">Refresh</button>
          </div>
        </div>
        <div class="p-3 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
          <div class="grid grid-cols-1 lg:grid-cols-6 gap-2">
            <input v-model="filters.q" @keyup.enter="applyFilters" placeholder="Search question" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
            <select v-model="filters.exam_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">All exams</option><option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option></select>
            <select v-model="filters.subject_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">All subjects</option><option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option></select>
            <select v-model="filters.year_id" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">All years</option><option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option></select>
            <select v-model="filters.type" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">All types</option><option value="objective">Objective</option><option value="theory">Theory</option><option value="subjective">Subjective</option><option value="practical">Practical</option></select>
            <select v-model="filters.source" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">All sources</option><option value="AI">AI</option><option value="Real">Real</option></select>
          </div>
          <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <select v-model="filters.sort_by" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="id">Sort by ID</option>
              <option value="created_at">Sort by Created</option>
              <option value="year_id">Sort by Year</option>
              <option value="exam_id">Sort by Exam</option>
              <option value="subject_id">Sort by Subject</option>
              <option value="type">Sort by Type</option>
              <option value="source">Sort by Source</option>
              <option value="marks">Sort by Marks</option>
            </select>
            <select v-model="filters.sort_dir" @change="applyFilters" class="h-10 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <div class="flex items-center gap-2">
              <button @click="applyFilters" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Apply</button>
              <button @click="clearFilters" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border p-4 shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
        <div class="overflow-x-auto overflow-y-auto max-h-[65vh]">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 dark:text-gray-400">
                <th v-if="columns.sel" class="py-2 pr-4"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)"/></th>
                <th v-if="columns.id" class="py-2 pr-4">#</th>
                <th v-if="columns.question" class="py-2 pr-4">Question</th>
                <th v-if="columns.exam" class="py-2 pr-4">Exam</th>
                <th v-if="columns.subject" class="py-2 pr-4">Subject</th>
                <th v-if="columns.year" class="py-2 pr-4">Year</th>
                <th v-if="columns.type" class="py-2 pr-4">Type</th>
                <th v-if="columns.source" class="py-2 pr-4">Source</th>
                <th v-if="columns.marks" class="py-2 pr-4">Marks</th>
                <th v-if="columns.attach" class="py-2 pr-4">Attach</th>
                <th v-if="columns.created" class="py-2 pr-4">Created</th>
                <th v-if="columns.user" class="py-2 pr-4">Author</th>
                <th v-if="columns.actions" class="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr v-for="q in items" :key="q.id">
                <td v-if="columns.sel" class="py-3 pr-4"><input type="checkbox" :checked="isSelected(q.id)" @change="toggleSelect(q.id, $event)"/></td>
                <td v-if="columns.id" class="py-3 pr-4">{{ q.id }}</td>
                <td v-if="columns.question" class="py-3 pr-4 max-w-[28rem]">
                  <div class="flex items-start gap-2">
                    <span v-if="hasImg(q.question)" class="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[10px]">IMG</span>
                    <div class="line-clamp-3" v-html="renderQuestion(q.question)"></div>
                  </div>
                </td>
                <td v-if="columns.exam" class="py-3 pr-4">{{ q.exam?.title || q.exam_id }}</td>
                <td v-if="columns.subject" class="py-3 pr-4">{{ q.subject?.name || q.subject_id }}</td>
                <td v-if="columns.year" class="py-3 pr-4">{{ q.year?.name || q.year_id }}</td>
                <td v-if="columns.type" class="py-3 pr-4">{{ q.type || '—' }}</td>
                <td v-if="columns.source" class="py-3 pr-4">{{ q.source || '—' }}</td>
                <td v-if="columns.marks" class="py-3 pr-4">{{ q.marks ?? '—' }}</td>
                <td v-if="columns.attach" class="py-3 pr-4"><span class="text-xs" :class="q.attachment ? 'text-green-600' : 'text-gray-400'">{{ q.attachment ? 'Yes' : 'No' }}</span></td>
                <td v-if="columns.created" class="py-3 pr-4"><span class="text-xs text-gray-500">{{ formatDate(q.created_at) }}</span></td>
                <td v-if="columns.user" class="py-3 pr-4"><span class="text-xs text-gray-500">{{ q.user?.name || '—' }}</span></td>
                <td v-if="columns.actions" class="py-3 pr-4 space-x-2"><button @click="openEdit(q)" class="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-xs">Edit</button><button @click="confirmDelete(q)" class="px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs">Delete</button></td>
              </tr>
              <tr v-if="!loading && (!items || !items.length)"><td :colspan="visibleColumnCount" class="py-6 text-center text-gray-500">No yearly questions found</td></tr>
              <tr v-if="loading" v-for="i in 5" :key="'sk-'+i"><td class="py-3 pr-4" :colspan="visibleColumnCount"><div class="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end gap-2 mt-4">
          <div class="mr-auto flex items-center gap-2">
            <button @click="selectAllFiltered" :disabled="selectingAll || !hasActiveFilter" class="px-3 py-1.5 rounded border text-xs"
              :class="(selectingAll || !hasActiveFilter) ? 'border-gray-300 dark:border-gray-700 text-gray-400' : 'border-gray-300 dark:border-gray-700'">
              <span v-if="selectingAll">Selecting...</span>
              <span v-else>Select All (Filtered)</span>
            </button>
            <template v-if="selectedCount">
              <span class="text-xs text-gray-500">Selected: {{ selectedCount }}</span>
              <button @click="clearSelection" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-xs">Clear Selection</button>
              <button @click="deleteSelected" class="px-3 py-1.5 rounded border border-red-300 text-red-600 dark:border-red-700 text-xs">Delete Selected</button>
            </template>
          </div>
          <button :disabled="pagination.page <= 1 || loading" @click="prevPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Prev</button>
          <div class="text-xs text-gray-500">Page {{ pagination.page }}</div>
          <button :disabled="items.length < pagination.per_page || loading" @click="nextPage" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50">Next</button>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <transition name="fade">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-4xl rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">{{ modal.mode === 'create' ? 'New Yearly Question' : 'Edit Yearly Question' }}</h3>
              <button @click="closeModal" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div><label class="block text-xs text-gray-500">Exam</label><select v-model="form.exam_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">Select exam</option><option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option></select></div>
                <div><label class="block text-xs text-gray-500">Subject</label><select v-model="form.subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">Select subject</option><option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option></select></div>
                <div><label class="block text-xs text-gray-500">Year</label><select v-model="form.year_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">Select year</option><option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option></select></div>
                <div><label class="block text-xs text-gray-500">Type</label><select v-model="form.type" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">Any</option><option value="objective">Objective</option><option value="theory">Theory</option><option value="subjective">Subjective</option><option value="practical">Practical</option></select></div>
                <div><label class="block text-xs text-gray-500">Source</label><select v-model="form.source" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">Any</option><option value="AI">AI</option><option value="Real">Real</option></select></div>
                <div><label class="block text-xs text-gray-500">Marks</label><input v-model.number="form.marks" type="number" min="0" step="1" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" /></div>
                <div><label class="block text-xs text-gray-500">Attachment</label><input ref="fileInput" type="file" accept="image/*,application/pdf" @change="onFileSelect" class="block w-full text-xs" /></div>
              </div>
              <div><label class="block text-xs text-gray-500">Question</label><textarea v-model="form.question" rows="4" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
              <div v-if="form.type === 'objective'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div><label class="block text-xs text-gray-500">Option A</label><textarea v-model="form.option_a" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                <div><label class="block text-xs text-gray-500">Option B</label><textarea v-model="form.option_b" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                <div><label class="block text-xs text-gray-500">Option C</label><textarea v-model="form.option_c" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                <div><label class="block text-xs text-gray-500">Option D</label><textarea v-model="form.option_d" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                <div><label class="block text-xs text-gray-500">Option E</label><textarea v-model="form.option_e" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                <div><label class="block text-xs text-gray-500">Correct Option</label><select v-model="form.correct_option" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm"><option value="">—</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option></select></div>
              </div>
              <div><label class="block text-xs text-gray-500">Explanation</label><textarea v-model="form.explanation" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
              <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>
            </div>
            <div class="p-4 flex items-center justify-end gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <button @click="closeModal" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Cancel</button>
              <button @click="save" :disabled="saving" class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm"><span v-if="saving">Saving...</span><span v-else>Save</span></button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Import CSV Modal -->
      <transition name="fade">
        <div v-if="importModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-xl rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">Import Yearly Questions (CSV)</h3>
              <button @click="importModal=false" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-3 text-sm">
              <input ref="importFile" type="file" accept=".csv,text/csv" class="block w-full text-xs" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-500">Default Exam</label>
                  <select v-model="importDefaults.default_exam_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Subject</label>
                  <select v-model="importDefaults.default_subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Year</label>
                  <select v-model="importDefaults.default_year_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Type</label>
                  <select v-model="importDefaults.default_type" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option value="objective">Objective</option>
                    <option value="theory">Theory</option>
                    <option value="subjective">Subjective</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Source</label>
                  <select v-model="importDefaults.default_source" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option value="AI">AI</option>
                    <option value="Real">Real</option>
                  </select>
                </div>
                <div class="sm:col-span-2 flex items-center gap-2">
                  <input id="soe" type="checkbox" v-model="importDefaults.stop_on_error" class="h-4 w-4" />
                  <label for="soe" class="text-xs">Stop on first error</label>
                </div>
              </div>
            </div>
            <div class="p-4 flex items-center justify-end gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <button @click="importModal=false" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Cancel</button>
              <button @click="submitImport" :disabled="importing" class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm"><span v-if="importing">Importing...</span><span v-else>Import</span></button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Bulk Add Modal (Form-based) -->
      <transition name="fade">
        <div v-if="bulkModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-5xl rounded-xl border shadow-sm" :class="isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'">
            <div class="flex items-center justify-between p-4 border-b" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <h3 class="font-semibold">Bulk Add Yearly Questions</h3>
              <button @click="bulkModal=false" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X class="w-4 h-4"/></button>
            </div>
            <div class="p-4 space-y-4 text-sm">
              <!-- Defaults -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div>
                  <label class="block text-xs text-gray-500">Default Exam</label>
                  <select v-model="bulkDefaults.exam_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select exam</option>
                    <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Subject</label>
                  <select v-model="bulkDefaults.subject_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select subject</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Year</label>
                  <select v-model="bulkDefaults.year_id" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">Select year</option>
                    <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Type</label>
                  <select v-model="bulkDefaults.type" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="objective">Objective</option>
                    <option value="theory">Theory</option>
                    <option value="subjective">Subjective</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-500">Default Source</label>
                  <select v-model="bulkDefaults.source" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                    <option value="">—</option>
                    <option value="AI">AI</option>
                    <option value="Real">Real</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-xs text-gray-500">Add multiple questions below. Use the type selector per row.</div>
                <div class="flex items-center gap-2">
                  <button @click="addBulkRow('objective')" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-xs">Add Objective</button>
                  <button @click="addBulkRow('theory')" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-xs">Add Theory</button>
                </div>
              </div>

              <div class="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                <div v-for="(row, idx) in bulkRows" :key="row._id" class="rounded border p-3" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 text-xs">
                      <span class="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800" v-if="row.type==='objective'">Objective</span>
                      <span class="px-2 py-0.5 rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200" v-else>{{ row.type }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                      <label>Type</label>
                      <select v-model="row.type" class="h-8 rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2">
                        <option value="objective">Objective</option>
                        <option value="theory">Theory</option>
                        <option value="subjective">Subjective</option>
                        <option value="practical">Practical</option>
                      </select>
                      <button @click="removeBulkRow(idx)" class="px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700">Remove</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                    <div>
                      <label class="block text-xs text-gray-500">Source</label>
                      <select v-model="row.source" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                        <option value="">—</option>
                        <option value="AI">AI</option>
                        <option value="Real">Real</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500">Marks</label>
                      <input v-model.number="row.marks" type="number" min="0" step="1" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500">Question</label>
                    <textarea v-model="row.question" rows="3" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2" placeholder="Enter question text (supports HTML)"></textarea>
                  </div>
                  <div v-if="row.type==='objective'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    <div><label class="block text-xs text-gray-500">Option A</label><textarea v-model="row.option_a" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                    <div><label class="block text-xs text-gray-500">Option B</label><textarea v-model="row.option_b" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                    <div><label class="block text-xs text-gray-500">Option C</label><textarea v-model="row.option_c" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                    <div><label class="block text-xs text-gray-500">Option D</label><textarea v-model="row.option_d" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                    <div><label class="block text-xs text-gray-500">Option E</label><textarea v-model="row.option_e" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea></div>
                    <div>
                      <label class="block text-xs text-gray-500">Correct Option</label>
                      <select v-model="row.correct_option" class="h-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm">
                        <option value="">—</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-2">
                    <label class="block text-xs text-gray-500">Explanation</label>
                    <textarea v-model="row.explanation" rows="2" class="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 text-sm py-2"></textarea>
                  </div>
                </div>
                <div v-if="!bulkRows.length" class="text-center text-xs text-gray-500">No rows added yet. Use the buttons above to add questions.</div>
              </div>
            </div>
            <div class="p-4 flex items-center justify-end gap-2 border-t" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
              <button @click="bulkModal=false" class="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm">Cancel</button>
              <button @click="submitBulkUI" :disabled="bulkSaving" class="px-3 py-2 rounded bg-yellow-500 text-gray-900 hover:bg-yellow-600 disabled:opacity-50 text-sm">
                <span v-if="bulkSaving">Submitting...</span>
                <span v-else>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayOut.vue'
import { ref, onMounted, computed } from 'vue'
import { useDark } from '@vueuse/core'
import { Plus, X } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import api from '@/http/api'
import {
  listYearlyQuestions,
  createYearlyQuestion,
  updateYearlyQuestion,
  deleteYearlyQuestion,
  bulkCreateYearlyQuestions,
  importYearlyQuestionsCsv,
  extractPaginated,
} from '@/http/adminYearlyQuestions'

const isDark = useDark({ selector: 'body', attribute: 'class', valueDark: 'dark', valueLight: '' })

const loading = ref(false)
const items = ref([])
const pagination = ref({ page: 1, per_page: 20, total: 0 })

const baseFilters = () => ({
  q: '',
  exam_id: '',
  subject_id: '',
  year_id: '',
  type: '',
  source: '',
  sort_by: 'id',
  sort_dir: 'desc',
})
const filters = ref(baseFilters())

const exams = ref([])
const subjects = ref([])
const years = ref([])

const modal = ref({ open: false, mode: 'create' })
const saving = ref(false)
const formError = ref('')
const fileInput = ref(null)
const defaultForm = () => ({
  id: null,
  exam_id: '',
  subject_id: '',
  year_id: '',
  type: '',
  source: '',
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  option_e: '',
  correct_option: '',
  explanation: '',
  marks: null,
  attachment: null,
})
const form = ref(defaultForm())

const importModal = ref(false)
const importing = ref(false)
const importFile = ref(null)
const importDefaults = ref({
  default_exam_id: '',
  default_subject_id: '',
  default_year_id: '',
  default_type: '',
  default_source: '',
  stop_on_error: false,
})

const bulkModal = ref(false)
const bulkSaving = ref(false)
const bulkDefaults = ref({
  exam_id: '',
  subject_id: '',
  year_id: '',
  type: 'objective',
  source: '',
})
const bulkRows = ref([])
let bulkRowId = 1

const columnsMenu = ref(false)
const columns = ref({
  sel: true,
  id: true,
  question: true,
  exam: true,
  subject: true,
  year: true,
  type: true,
  source: true,
  marks: true,
  attach: true,
  created: true,
  user: false,
  actions: true,
})
const visibleColumnCount = computed(() => {
  const count = Object.values(columns.value).reduce((total, active) => total + (active ? 1 : 0), 0)
  return count || 1
})

const selected = ref(new Set())
const selectingAll = ref(false)
const selectedCount = computed(() => selected.value.size)
const allSelected = computed(() => items.value.length > 0 && items.value.every((q) => selected.value.has(q.id)))
const hasActiveFilter = computed(() => {
  const { q, exam_id, subject_id, year_id, type, source } = filters.value
  return Boolean(q || exam_id || subject_id || year_id || type || source)
})

function updateSelection(updater) {
  const next = new Set(selected.value)
  updater(next)
  selected.value = next
}
function isSelected(id) {
  return selected.value.has(id)
}
function toggleSelect(id, ev) {
  updateSelection((set) => {
    if (ev?.target?.checked) set.add(id)
    else set.delete(id)
  })
}
function toggleSelectAll(ev) {
  updateSelection((set) => {
    if (ev?.target?.checked) {
      items.value.forEach((q) => set.add(q.id))
    } else {
      items.value.forEach((q) => set.delete(q.id))
    }
  })
}
function clearSelection() {
  selected.value = new Set()
}
async function selectAllFiltered() {
  if (!hasActiveFilter.value) {
    toast.error('Choose at least one filter before selecting all')
    return
  }
  selectingAll.value = true
  try {
    const limit = 500
    let page = 1
    const next = new Set(selected.value)
    while (true) {
      const params = { limit, page }
      for (const key of ['q', 'exam_id', 'subject_id', 'year_id', 'type', 'source']) {
        if (filters.value[key]) params[key] = filters.value[key]
      }
      params.sort_by = filters.value.sort_by
      params.sort_dir = filters.value.sort_dir
      const { data } = await listYearlyQuestions(params)
      const { items: rows } = extractPaginated(data)
      if (!rows.length) break
      rows.forEach((row) => {
        if (row?.id != null) next.add(row.id)
      })
      if (rows.length < limit) break
      page++
    }
    selected.value = next
    toast.success(`Selected ${next.size} question(s) matching current filters`)
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to select all with current filters')
  } finally {
    selectingAll.value = false
  }
}

function renderQuestion(html) {
  return String(html || '')
}
function hasImg(html) {
  return typeof html === 'string' && /<img\b/i.test(html)
}
function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

async function fetchExams() {
  try {
    const { data } = await api.get('/admin/exams', { params: { limit: 1000 } })
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
      ? data.data.data
      : []
    exams.value = list.map((e) => ({ id: e.id, title: e.title }))
  } catch {}
}
async function fetchSubjects() {
  try {
    const { data } = await api.get('/admin/subjects', { params: { limit: 1000 } })
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
      ? data.data.data
      : []
    subjects.value = list.map((s) => ({ id: s.id, name: s.name }))
  } catch {}
}
async function fetchYears() {
  try {
    const { data } = await api.get('/admin/academic-years', { params: { limit: 1000 } })
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
      ? data.data.data
      : []
    years.value = list.map((y) => ({ id: y.id, name: y.name }))
  } catch {}
}

async function loadQuestions() {
  loading.value = true
  try {
    const params = { limit: pagination.value.per_page, page: pagination.value.page }
    for (const key of ['q', 'exam_id', 'subject_id', 'year_id', 'type', 'source', 'sort_by', 'sort_dir']) {
      if (filters.value[key]) params[key] = filters.value[key]
    }
    const { data } = await listYearlyQuestions(params)
    const parsed = extractPaginated(data)
    items.value = parsed.items
    pagination.value.total = parsed.total
    pagination.value.per_page = parsed.perPage ?? pagination.value.per_page
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to load yearly questions')
  } finally {
    loading.value = false
  }
}
function applyFilters() {
  pagination.value.page = 1
  loadQuestions()
}
function clearFilters() {
  filters.value = baseFilters()
  pagination.value.page = 1
  loadQuestions()
}
function prevPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadQuestions()
  }
}
function nextPage() {
  pagination.value.page++
  loadQuestions()
}
function refresh() {
  loadQuestions()
}

function openCreate() {
  modal.value = { open: true, mode: 'create' }
  form.value = defaultForm()
  formError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
function openEdit(question) {
  modal.value = { open: true, mode: 'edit' }
  form.value = {
    id: question.id,
    exam_id: question.exam_id || question.exam?.id || '',
    subject_id: question.subject_id || question.subject?.id || '',
    year_id: question.year_id || question.year?.id || '',
    type: question.type || '',
    source: question.source || '',
    question: question.question || '',
    option_a: question.option_a || '',
    option_b: question.option_b || '',
    option_c: question.option_c || '',
    option_d: question.option_d || '',
    option_e: question.option_e || '',
    correct_option: question.correct_option || '',
    explanation: question.explanation || '',
    marks: question.marks ?? null,
    attachment: null,
  }
  formError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
function closeModal() {
  modal.value.open = false
  form.value = defaultForm()
  formError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
function onFileSelect(e) {
  const f = e?.target?.files?.[0] ?? null
  form.value.attachment = f
}
async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (!form.value.exam_id || !form.value.subject_id || !form.value.year_id || !form.value.question?.trim()) {
      formError.value = 'Exam, Subject, Year and Question are required'
      return
    }
    const payload = {
      exam_id: form.value.exam_id,
      subject_id: form.value.subject_id,
      year_id: form.value.year_id,
      type: form.value.type || '',
      source: form.value.source || '',
      question: form.value.question,
      option_a: form.value.option_a || '',
      option_b: form.value.option_b || '',
      option_c: form.value.option_c || '',
      option_d: form.value.option_d || '',
      option_e: form.value.option_e || '',
      correct_option: form.value.correct_option ? String(form.value.correct_option).toUpperCase() : '',
      explanation: form.value.explanation || '',
      marks: form.value.marks ?? null,
      attachment: form.value.attachment,
    }
    if (modal.value.mode === 'create') {
      await createYearlyQuestion(payload)
      toast.success('Yearly question created')
    } else {
      await updateYearlyQuestion(form.value.id, payload)
      toast.success('Yearly question updated')
    }
    closeModal()
    await loadQuestions()
  } catch (e) {
    const msg = e?.response?.data?.message || 'Save failed'
    formError.value = msg
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

function confirmDelete(question) {
  if (!question?.id) return
  const ok = window.confirm(`Delete yearly question #${question.id}? This cannot be undone.`)
  if (!ok) return
  removeQuestion(question.id)
}
async function removeQuestion(id) {
  try {
    await deleteYearlyQuestion(id)
    toast.success('Yearly question deleted')
    if (items.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await loadQuestions()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Delete failed')
  }
}
async function deleteSelected() {
  if (!selectedCount.value) return
  const ok = window.confirm(`Delete ${selectedCount.value} selected question(s)? This cannot be undone.`)
  if (!ok) return
  const ids = Array.from(selected.value)
  for (const id of ids) {
    try {
      await deleteYearlyQuestion(id)
    } catch {}
  }
  toast.success('Selected questions deleted')
  selected.value = new Set()
  await loadQuestions()
}

function openImport() {
  importModal.value = true
  if (importFile.value) importFile.value.value = ''
}
async function submitImport() {
  if (!importFile.value?.files?.[0]) {
    toast.error('Choose a CSV file')
    return
  }
  importing.value = true
  try {
    const fd = new FormData()
    fd.append('file', importFile.value.files[0])
    Object.entries(importDefaults.value).forEach(([key, value]) => {
      if (key === 'stop_on_error') {
        fd.append(key, value ? '1' : '0')
        return
      }
      if (value !== '' && value !== null) {
        fd.append(key, String(value))
      }
    })
    const { data } = await importYearlyQuestionsCsv(fd)
    const ok = data?.success !== false
    const created = data?.created_count ?? 0
    const errorCount = Array.isArray(data?.errors) ? data.errors.length : 0
    const suffix = errorCount ? ` (${errorCount} row(s) failed)` : ''
    toast[ok ? 'success' : 'error'](`Imported ${created} question(s)${suffix}`)
    importModal.value = false
    if (importFile.value) importFile.value.value = ''
    await loadQuestions()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Import failed')
  } finally {
    importing.value = false
  }
}

function openBulk() {
  bulkModal.value = true
  if (!bulkRows.value.length) addBulkRow()
}
function addBulkRow(type = 'objective') {
  bulkRows.value.push({
    _id: bulkRowId++,
    type,
    source: '',
    marks: null,
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: '',
    correct_option: '',
    explanation: '',
  })
}
function removeBulkRow(idx) {
  bulkRows.value.splice(idx, 1)
}
async function submitBulkUI() {
  if (!bulkDefaults.value.exam_id || !bulkDefaults.value.subject_id || !bulkDefaults.value.year_id) {
    toast.error('Select default Exam, Subject and Year at the top')
    return
  }
  if (!bulkRows.value.length) {
    toast.error('Add at least one question')
    return
  }
  const payload = []
  for (const row of bulkRows.value) {
    if (!row.question || !String(row.question).trim()) {
      toast.error('Each row needs a question')
      return
    }
    payload.push({
      exam_id: bulkDefaults.value.exam_id,
      subject_id: bulkDefaults.value.subject_id,
      year_id: bulkDefaults.value.year_id,
      type: row.type || bulkDefaults.value.type || null,
      source: row.source || bulkDefaults.value.source || null,
      question: row.question,
      option_a: row.option_a || null,
      option_b: row.option_b || null,
      option_c: row.option_c || null,
      option_d: row.option_d || null,
      option_e: row.option_e || null,
      correct_option: row.correct_option ? String(row.correct_option).toUpperCase() : null,
      explanation: row.explanation || null,
      marks: row.marks !== null && row.marks !== '' ? Number(row.marks) : null,
    })
  }
  bulkSaving.value = true
  try {
    await bulkCreateYearlyQuestions(payload)
    toast.success(`Bulk added ${payload.length} question(s)`)
    bulkModal.value = false
    bulkRows.value = []
    bulkRowId = 1
    await loadQuestions()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Bulk add failed')
  } finally {
    bulkSaving.value = false
  }
}

function downloadTemplate() {
  const headers = ['question','option_a','option_b','option_c','option_d','option_e','correct_option','explanation','marks','type','source']
  const csv = headers.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'yearly_questions_template.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onMounted(async () => {
  await Promise.all([fetchExams(), fetchSubjects(), fetchYears()])
  loadQuestions()
})
</script>

<style scoped>
.text-gold { color: #ffd700; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
