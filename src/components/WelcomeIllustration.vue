<template>
  <div class="w-full flex justify-center items-center p-4 animate-fade-in">
    <img 
      src="@/assets/illustration.png"
      alt="Welcome Illustration" 
      class="max-h-[320px] rounded-lg shadow-lg  transition-transform duration-500 ease-in-out"
      @mouseover="hovering = true"
      @mouseleave="hovering = false"
      :style="{ transform: hovering ? 'scale(1.05)' : 'scale(1)' }"      
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const hovering = ref(false)
</script>

<style>
.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
