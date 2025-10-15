<template>
  <div
    class="min-h-screen flex flex-col"
    :class="isDark ? 'bg-dark text-white' : 'bg-light text-gray-900'"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between p-4 border-b"
      :class="isDark ? 'border-gray-700' : 'border-gray-300'"
    >
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <DarkModeToggle />
    </header>
    <!-- Admin Dashboard Content -->
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p class="mb-4">Welcome to the admin dashboard. Here you can manage your application.</p>
        <router-link
      to="/admin/users"
      class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
    >
      Manage Users
    </router-link>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isDark = ref(false);

</script>
