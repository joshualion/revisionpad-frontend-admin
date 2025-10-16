<template>
  <div class="w-full h-full">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  type: { type: String, default: 'line' },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
})

const canvasEl = ref(null)
let chart

const buildConfig = () => ({
  type: props.type,
  data: { labels: props.labels, datasets: props.datasets },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: true, position: 'bottom' } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(107,114,128,0.2)' } },
    },
    ...props.options,
  },
})

onMounted(() => {
  if (canvasEl.value) chart = new Chart(canvasEl.value.getContext('2d'), buildConfig())
})

watch(() => [props.labels, props.datasets, props.options], () => {
  if (!chart) return
  chart.data.labels = props.labels
  chart.data.datasets = props.datasets
  chart.update('none')
}, { deep: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped>
div { min-height: 12rem; }
</style>

