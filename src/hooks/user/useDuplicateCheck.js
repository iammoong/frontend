// src/hooks/useDuplicateCheck.js
import { ref } from 'vue'

export function useDuplicateCheck({ checkApi, emptyMsg, duplicateMsg, availableMsg, t, alertStore, focusRef }) {
    const value = ref('')
    const error = ref(false)
    const guide = ref(false)
    const isChecked = ref(false)
    const isAvailable = ref(false)

    function reset() {
        isChecked.value = false
        isAvailable.value = false
        error.value = false
        guide.value = false
        value.value = ''
    }

    async function check() {
        isChecked.value = false
        isAvailable.value = false

        if (!value.value) {
            alertStore.show(t(emptyMsg))
            error.value = true
            focusRef.value?.focus()
            return
        }
        const { data } = await checkApi(value.value)
        isChecked.value = true
        isAvailable.value = !data
        if (data) {
            alertStore.show(t(duplicateMsg))
        } else {
            alertStore.show(t(availableMsg))
        }
    }

    function onInput(e, pattern) {
        const filtered = e.target.value.replace(pattern, '')
        if (filtered !== e.target.value) {
            value.value = filtered
            guide.value = true
        } else {
            value.value = filtered
            guide.value = false
        }
        error.value = false
        isChecked.value = false
        isAvailable.value = false
    }

    return {
        value, error, guide, isChecked, isAvailable,
        check, onInput, reset,
    }
}
