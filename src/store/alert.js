import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
    const message = ref('')
    const open = ref(false)
    const type = ref('success')  // ← 타입 추가 ('success' | 'error')
    const timeoutId = ref(null)

    // 타입 인자를 추가하여 show 함수 수정
    function show(msg, t = 'success') {
        message.value = msg
        type.value = t    // success or error
        open.value = true
        if (timeoutId.value) clearTimeout(timeoutId.value)
        timeoutId.value = setTimeout(() => {
            open.value = false
        }, 3000)
    }
    function close() {
        open.value = false
        if (timeoutId.value) clearTimeout(timeoutId.value)
    }
    return { message, open, type, show, close }
})
