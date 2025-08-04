// src/hooks/useFieldValidation.js
import { ref } from 'vue'

/**
 * @param {Object} options
 * @param {string} options.initial - 초기값
 * @param {RegExp} options.pattern - 허용할 문자 정규식(허용값만 남기기)
 * @param {Function} options.requiredMessage - 빈 값일 때 메시지 함수 (i18n t 사용)
 * @param {Function} options.invalidMessage - 유효하지 않을 때 메시지 함수
 * @returns {Object}
 */
export function useFieldValidation({ initial = '', pattern, requiredMessage, invalidMessage }) {
    const value = ref(initial)
    const error = ref(false)
    const guide = ref(false)
    const errorMessage = ref('')

    function onInput(e) {
        const filtered = e.target.value.replace(pattern, '')
        if (filtered !== e.target.value) {
            value.value = filtered
            guide.value = true
        } else {
            value.value = filtered
            guide.value = false
        }
        error.value = false
        errorMessage.value = ''
    }

    function validate({ required = false, custom = null } = {}) {
        if (required && !value.value) {
            error.value = true
            errorMessage.value = requiredMessage ? requiredMessage() : '필수 입력값입니다.'
            return false
        }
        if (custom && !custom(value.value)) {
            error.value = true
            errorMessage.value = invalidMessage ? invalidMessage() : '형식이 올바르지 않습니다.'
            return false
        }
        error.value = false
        errorMessage.value = ''
        return true
    }

    function reset() {
        value.value = initial
        error.value = false
        guide.value = false
        errorMessage.value = ''
    }

    return { value, error, guide, errorMessage, onInput, validate, reset }
}
