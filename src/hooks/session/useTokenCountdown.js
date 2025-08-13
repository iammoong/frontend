import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

/** Base64URL -> JSON 파싱 */
function parseJwt(token) {
    try {
        const part = token.split('.')[1];
        if (!part) return null;

        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

/** 남은 시간(ms) -> "HH:mm:ss" 또는 "mm:ss" */
function formatHMS(ms) {
    if (ms <= 0 || ms == null) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * 로컬스토리지의 jwtToken(exp) 기준으로 만료까지 카운트다운합니다.
 * - 비밀번호 변경/토큰 재발급 시 저장 값이 바뀌면 다음 tick에 자동 반영됩니다.
 * @param {string} storageKey - 기본 'jwtToken'
 */
export function useTokenCountdown(storageKey = 'jwtToken') {
    const remainingMs = ref(null);
    const expired = computed(() => remainingMs.value != null && remainingMs.value <= 0);
    const display = computed(() => (remainingMs.value == null ? '-' : formatHMS(remainingMs.value)));

    let timer;

    const tick = () => {
        const token = localStorage.getItem(storageKey);
        if (!token) {
            remainingMs.value = null;
            return;
        }
        const payload = parseJwt(token);
        const expSec = payload && payload.exp; // UNIX seconds
        if (!expSec) {
            remainingMs.value = null;
            return;
        }
        remainingMs.value = expSec * 1000 - Date.now();
    };

    onMounted(() => {
        tick();
        timer = window.setInterval(tick, 1000);
        // 다른 탭에서 토큰이 변경된 경우 동기화
        window.addEventListener('storage', tick);
    });

    onBeforeUnmount(() => {
        if (timer) window.clearInterval(timer);
        window.removeEventListener('storage', tick);
    });

    return { remainingMs, expired, display };
}
