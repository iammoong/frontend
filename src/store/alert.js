import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
    const message = ref('')
    const open = ref(false)
    const timeoutId = ref(null)

    function show(msg) {
        message.value = msg
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
    return { message, open, show, close }
})
