<!-- src/components/form/UserForm.vue -->
<template>
  <v-form v-model="valid" @submit.prevent="onSubmit" class="max-w-xl mx-auto p-4">
    <!-- 예시 필드: 실제 SignupModal.vue의 필드/검증 로직을 이식하세요 -->
    <v-text-field
        v-model="form.userId"
        :label="t('label.signupForm.userId')"
        :readonly="mode === 'edit'"
        required
    />
    <v-text-field
        v-model="form.nickname"
        :label="t('label.signupForm.nickname')"
        required
    />
    <v-text-field
        v-model="form.email"
        :label="t('label.signupForm.email')"
        type="email"
        required
    />
    <v-text-field
        v-if="mode === 'create'"
        v-model="form.password"
        :label="t('label.signupForm.password')"
        type="password"
        required
    />

    <div class="mt-4 flex gap-2">
      <v-btn type="submit" color="primary">{{ submitText }}</v-btn>
      <v-btn variant="text" @click="$emit('cancel')">{{ t('label.cancel') }}</v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  mode: { type: String, default: 'create' },     // 'create' | 'edit'
  initial: { type: Object, default: () => ({}) },// 초기 데이터 (편집 시)
})
const emit = defineEmits(['submit', 'cancel'])

const valid = reactive(false)
const form = reactive({
  userId: '',
  nickname: '',
  email: '',
  password: '',
})

watch(() => props.initial, (val) => {
  Object.assign(form, val || {})
}, { immediate: true })

const submitText = computed(() =>
    props.mode === 'edit' ? '수정하기' : '가입하기'
)

function onSubmit() {
  emit('submit', { ...form })
}
</script>
