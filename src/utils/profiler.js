const hasImportMeta = typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'

const inferIsDev = () => {
  if (hasImportMeta && typeof import.meta.env.DEV !== 'undefined') {
    return !!import.meta.env.DEV
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env.NODE_ENV !== 'undefined') {
    return process.env.NODE_ENV !== 'production'
  }
  return false
}

const perf = typeof performance !== 'undefined' ? performance : undefined
const profilerEnabled = !!perf && inferIsDev()

export const profileAsync = async (label, fn) => {
  if (!profilerEnabled) {
    return fn()
  }

  const start = perf.now()
  try {
    const result = await fn()
    const duration = (perf.now() - start).toFixed(1)
    console.info(`[LocationProfiler] ${label} in ${duration}ms`)
    return result
  } catch (error) {
    const duration = (perf.now() - start).toFixed(1)
    console.warn(`[LocationProfiler] ${label} failed after ${duration}ms`, error)
    throw error
  }
}

export const markProfiler = (label) => {
  if (!profilerEnabled) return
  const timestamp = perf.now().toFixed(1)
  console.info(`[LocationProfiler] ${label} mark @ ${timestamp}ms`)
}

export const isProfilerEnabled = profilerEnabled
