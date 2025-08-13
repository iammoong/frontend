export function useIdleLogout(minutes = 30) {
    let timer;
    const timeoutMs = minutes * 60 * 1000;

    const doLogout = () => {
        localStorage.removeItem('jwtToken');
        // 라우터를 여기서 직접 import하면 순환 참조가 날 수 있어서 location 사용
        window.location.href = '/login?reason=idle';
    };

    const reset = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(doLogout, timeoutMs);
    };

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

    const start = () => {
        events.forEach(e => window.addEventListener(e, reset, { passive: true }));
        reset();
    };

    const stop = () => {
        events.forEach(e => window.removeEventListener(e, reset));
        if (timer) clearTimeout(timer);
    };

    return { start, stop };
}
