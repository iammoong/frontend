import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

function formatHMS(ms) {
    if (ms == null || ms <= 0) return '00:00'
    const sec = Math.floor(ms / 1000)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n) => String(n).padStart(2, '0')
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/**
 * Idle(미사용) 타이머: 사용자 활동/라우트 이동 시마다 리셋.
 * @param {object} opts
 * @param {number} opts.minutes 기본 30
 * @param {import('vue-router').Router} [opts.router] 라우트 이동 시 리셋하려면 전달
 */
export function useIdleCountdown({ minutes = 30, router } = {}) {
    const timeoutMs = minutes * 60 * 1000
    const remainingMs = ref(null)
    const expired = computed(() => remainingMs.value != null && remainingMs.value <= 0)
    const display = computed(() => (remainingMs.value == null ? '-' : formatHMS(remainingMs.value)))

    let deadline
    let timer
    let removeAfterHook = null

    const tick = () => {
        if (!deadline) { remainingMs.value = null; return }
        remainingMs.value = deadline - Date.now()
    }

    const reset = () => {
        deadline = Date.now() + timeoutMs
        tick()
    }

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']

    onMounted(() => {
        reset()
        timer = window.setInterval(tick, 1000)

        // 사용자 활동 시 리셋
        activityEvents.forEach(e => window.addEventListener(e, reset, { passive: true }))

        // 다른 탭에서 스토리지 변경(로그아웃 등)도 리셋 트리거로 사용
        window.addEventListener('storage', reset)

        // 페이지 이동 시 리셋
        if (router && typeof router.afterEach === 'function') {
            removeAfterHook = router.afterEach(() => { reset() })
        }
    })

    onBeforeUnmount(() => {
        if (timer) window.clearInterval(timer)
        activityEvents.forEach(e => window.removeEventListener(e, reset))
        window.removeEventListener('storage', reset)
        if (removeAfterHook) removeAfterHook()
    })

    return { remainingMs, expired, display, reset }
}
