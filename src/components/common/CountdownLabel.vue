<template>
  <div
      class="countdown tnum mono text-medium-emphasis"
      :class="[{ 'text-warning': isSoon, 'text-error': expired }]"
      :title="expired ? '세션이 만료되었습니다' : '세션 만료까지 남은 시간'"
  >
    <v-icon size="18" icon="mdi-timer-outline" class="mr-1" />
    <span class="fixedw">{{ display }}</span>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTokenCountdown } from '@/hooks/session/useTokenCountdown.js'
import { useIdleCountdown } from '@/hooks/session/useIdleCountdown.js'

const emit = defineEmits(['expired'])
const props = defineProps({
  mode: { type: String, default: 'token' },   // 'token' | 'idle'
  storageKey: { type: String, default: 'jwtToken' },
  minutes: { type: Number, default: 30 },
  warnThresholdMs: { type: Number, default: 2 * 60 * 1000 }
})

const router = useRouter()

const api = props.mode === 'idle'
    ? useIdleCountdown({ minutes: props.minutes, router })
    : useTokenCountdown(props.storageKey)

const remainingMs = api.remainingMs
const expired     = api.expired
const display     = api.display

const isSoon = computed(
    () => remainingMs.value != null && remainingMs.value > 0 && remainingMs.value <= props.warnThresholdMs
)

watch(expired, v => { if (v) emit('expired') })
</script>

<style scoped>
.tnum { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.fixedw { display: inline-block; width: 6.5ch; text-align: right; }
.countdown { display: inline-flex; align-items: center; line-height: 1; }
</style>
