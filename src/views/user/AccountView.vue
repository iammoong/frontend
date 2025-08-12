<!-- src/views/user/AccountView.vue -->
<template>
  <v-container class="py-8" style="max-width: 720px;">
    <h2 class="text-h5 font-weight-bold mb-6">{{ tt('label.myInfo', '내 정보') }}</h2>

    <v-form v-if="loaded" @submit.prevent="onPrimary">
      <!-- 카카오 계정 안내 -->
      <v-alert
          v-if="isKakaoAccount && !editMode"
          type="info"
          variant="tonal"
          border="start"
          class="mb-4"
      >
        {{ t('edit.kakaoAccount.info') }}
      </v-alert>

      <!-- 아이디 + 중복확인 -->
      <div class="d-flex mb-3 align-center">
        <v-text-field
            v-model="form.userId"
            :label="t('label.loginForm.userId')"
            :readonly="!editMode || isKakaoAccount"
            :error="userIdInvalid"
            @input="onUserIdInput"
            class="flex-grow-1"
            variant="outlined"
            density="comfortable"
        />
        <v-btn
            v-if="editMode"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2"
            :disabled="isKakaoAccount || form.userId === initial.userId || userIdInvalid"
            @click="onCheckUserId"
        >{{ t('label.signup.duplicationCheck') }}</v-btn>
      </div>
      <div v-if="userIdCharWarn" class="text-caption error--text" style="margin-top:-8px; margin-bottom:8px;">
        {{ t('msg.validation.userIdGuide.1') }}
      </div>
      <div v-if="userIdLenWarn" class="text-caption error--text" style="margin-top:-8px; margin-bottom:8px;">
        {{ t('msg.validation.userIdGuide.2') }}
      </div>

      <!-- 이름 -->
      <v-text-field
          v-model="form.username"
          :label="t('label.loginForm.username')"
          :readonly="!editMode || isKakaoAccount"
          class="mb-3"
          variant="outlined"
          density="comfortable"
      />

      <!-- 닉네임 + 중복확인 -->
      <div class="d-flex mb-3 align-center">
        <v-text-field
            v-model="form.nickname"
            :label="t('label.loginForm.nickname')"
            :readonly="!editMode || isKakaoAccount"
            :error="nicknameInvalid"
            @update:modelValue="onNicknameInput"
            class="flex-grow-1"
            variant="outlined"
            density="comfortable"
        />
        <v-btn
            v-if="editMode"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2"
            :disabled="isKakaoAccount || form.nickname === initial.nickname || nicknameInvalid"
            @click="onCheckNickname"
        >{{ t('label.signup.duplicationCheck') }}</v-btn>
      </div>
      <div v-if="nicknameCharWarn" class="text-caption error--text" style="margin-top:-8px; margin-bottom:6px;">
        {{ t('msg.validation.nicknameGuide.1') }}
      </div>
      <div v-if="nicknameLenWarn" class="text-caption error--text" style="margin-top:-8px; margin-bottom:6px;">
        {{ t('msg.validation.nicknameGuide.2') }}
      </div>

      <!-- 이메일 -->
      <v-text-field
          v-model="form.email"
          :label="t('label.loginForm.email.id')"
          :readonly="!editMode || isKakaoAccount"
          class="mb-3"
          variant="outlined"
          density="comfortable"
          autocomplete="email"
      />

      <!-- 휴대전화 -->
      <v-text-field
          v-model="form.phone"
          :label="tt('label.loginForm.phone.label','휴대전화')"
          :placeholder="t('label.loginForm.phone.guide')"
          :readonly="!editMode || isKakaoAccount"
          class="mb-3"
          variant="outlined"
          density="comfortable"
          @input="onPhoneInput"
      />

      <!-- 액션 -->
      <div class="mt-6 d-flex gap-2">
        <v-btn
            color="primary"
            type="submit"
            :disabled="isKakaoAccount && !editMode"
        >
          {{ editMode ? tt('label.confirm','저장') : tt('label.edit','수정하기') }}
        </v-btn>
        <v-btn v-if="editMode" variant="text" @click="onCancel">{{ t('label.cancel') }}</v-btn>
      </div>
    </v-form>

    <div v-else class="text-body-2">{{ tt('loading.me','정보를 불러오는 중...') }}</div>

    <!-- 비밀번호 변경 -->
    <v-divider class="my-8"></v-divider>

    <v-card elevation="6">
      <v-card-title class="text-subtitle-1">{{ t('label.loginForm.password') }}</v-card-title>
      <v-divider></v-divider>

      <v-card-text v-if="!isKakaoAccount">
        <v-form @submit.prevent="onChangePassword">
          <v-text-field
              v-model="pw.currentPassword"
              :label="t('label.loginForm.password')"
              :type="showCurrent ? 'text' : 'password'"
              :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showCurrent = !showCurrent"
              :rules="[reqRule]"
              autocomplete="current-password"
              variant="outlined"
              density="comfortable"
              class="mb-3"
          />
          <v-text-field
              v-model="pw.newPassword"
              :label="tt('label.loginForm.password','비밀번호') + ' (새)'"
              :type="showNew ? 'text' : 'password'"
              :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNew = !showNew"
              :rules="[reqRule, min8Rule, mixRule]"
              autocomplete="new-password"
              variant="outlined"
              density="comfortable"
              class="mb-3"
          />
          <v-text-field
              v-model="pw.newPasswordConfirm"
              :label="t('label.loginForm.passwordConfirm')"
              :type="showConfirm ? 'text' : 'password'"
              :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirm = !showConfirm"
              :rules="[reqRule, confirmRule]"
              autocomplete="new-password"
              variant="outlined"
              density="comfortable"
              class="mb-4"
          />

          <div class="d-flex ga-2">
            <v-btn color="primary" type="submit" :loading="pwLoading">{{ t('label.confirm') }}</v-btn>
            <v-btn variant="text" @click="resetPw">{{ t('label.cancel') }}</v-btn>
          </div>
        </v-form>
        <div class="text-caption mt-3 opacity-80">
          {{ tt('password.notice','보안을 위해 비밀번호 변경 후 다시 로그인해 주세요.') }}
        </div>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="info" variant="tonal" border="start">
          {{ t('edit.kakaoAccount.info') }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- 공통 스낵바 -->
    <v-snackbar v-model="snackbar.open" :timeout="2600">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// ✅ 기존 API 재사용 + 비번 변경 추가
import { getMe, updateMe, changePassword } from '@/api/user/me.js'

// ✅ 중복확인은 프로젝트에 이미 있는 것을 재사용 (예: useAxios 훅)
import { useAxios } from '@/hooks/user/useAxios'
const { checkUserId, checkNickname } = useAxios()

const router = useRouter()
const { t } = useI18n()
const tt = (key, fallback) => (t(key) === key ? (fallback ?? key) : t(key))

const loaded = ref(false)
const editMode = ref(false)

const initial = reactive({
  userId: '', username: '', nickname: '', email: '', phone: '', kakaoId: null
})
const form = reactive({
  userId: '', username: '', nickname: '', email: '', phone: '', kakaoId: null
})

const isKakaoAccount = computed(() => !!form.kakaoId)

// ====== 중복확인 / 유효성 ======
const userIdCharWarn = ref(false)
const userIdLenWarn = ref(false)
const userIdInvalid = computed(() => userIdCharWarn.value || userIdLenWarn.value)

const nicknameCharWarn = ref(false)
const nicknameLenWarn = ref(false)
const nicknameInvalid = computed(() => nicknameCharWarn.value || nicknameLenWarn.value)

// 비밀번호
const pw = reactive({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
const pwLoading = ref(false)
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const reqRule = v => (!!v ? true : t('msg.validation.emptyPassword') || '비밀번호를 입력하세요.')
const min8Rule = v => ((v?.length ?? 0) >= 8) || '8자 이상 입력하세요'
const mixRule = v => /(?=.*[A-Za-z])(?=.*\d).{8,64}/.test(v || '') || '영문과 숫자를 포함해 주세요'
const confirmRule = v => v === pw.newPassword || (t('msg.validation.passwordNotEqual') || '비밀번호가 일치하지 않습니다.')

// 공통 스낵바
const snackbar = reactive({ open: false, message: '' })
const toast = (m) => { snackbar.open = true; snackbar.message = m }

onMounted(async () => {
  try {
    const { data } = await getMe()
    Object.assign(initial, {
      userId: data.userId ?? '',
      username: data.username ?? '',
      nickname: data.nickname ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      kakaoId: data.kakaoId ?? null
    })
    Object.assign(form, initial)
  } catch {
    toast(tt('error.loadMe','내 정보를 불러오지 못했습니다.'))
  } finally {
    loaded.value = true
  }
})

// 입력 핸들러
function onUserIdInput(e) {
  const raw = e.target.value
  const cleaned = (raw || '').replace(/[^a-z0-9]/g, '').slice(0, 16)
  userIdCharWarn.value = cleaned !== raw
  userIdLenWarn.value = cleaned.length > 0 && cleaned.length < 4
  form.userId = cleaned
}
function onNicknameInput(v) {
  const cleaned = (v || '').replace(/[^a-z0-9가-힣]/g, '').slice(0, 8)
  nicknameCharWarn.value = cleaned !== v
  nicknameLenWarn.value = cleaned.length > 0 && cleaned.length < 2
  form.nickname = cleaned
}
function onPhoneInput(e) {
  const v = (e.target.value || '').replace(/[^\d-]/g, '')
  form.phone = v
}

//중복확인
async function onCheckUserId() {
  try {
    const { data } = await checkUserId(form.userId.trim())
    toast(t(data ? 'msg.duplication.userIdDuplicate' : 'msg.duplication.userIdAvailable'))
  } catch {
    toast(tt('error.checkUserId','아이디 중복확인 중 오류가 발생했습니다.'))
  }
}
async function onCheckNickname() {
  try {
    const { data } = await checkNickname(form.nickname.trim())
    toast(t(data ? 'msg.duplication.nicknameDuplicate' : 'msg.duplication.nicknameAvailable'))
  } catch {
    toast(tt('error.checkNickname','닉네임 중복확인 중 오류가 발생했습니다.'))
  }
}

// 편집/저장
function onCancel() {
  Object.assign(form, initial)
  editMode.value = false
}
async function onPrimary() {
  if (!editMode.value) {
    if (isKakaoAccount.value) {
      toast(t('edit.kakaoAccount.info'))
      return
    }
    editMode.value = true
    return
  }

  // 저장
  if (isKakaoAccount.value) {
    toast(t('edit.kakaoAccount.info'))
    return
  }
  try {
    const payload = {
      userId: form.userId,
      username: form.username,
      nickname: form.nickname,
      email: form.email,
      phone: form.phone
    }
    const { data } = await updateMe(payload)
    if (data?.user) {
      Object.assign(initial, data.user)
      Object.assign(form, data.user)
    } else {
      Object.assign(initial, form)
    }
    if (data?.token) localStorage.setItem('jwtToken', data.token)

    toast(tt('label.saveComplete','저장되었습니다.'))
    editMode.value = false
  } catch (e) {
    const msg = e?.response?.data?.message || tt('error.save','저장 중 오류가 발생했습니다.')
    toast(msg)
  }
}

// 비밀번호 변경
function resetPw() {
  pw.currentPassword = ''
  pw.newPassword = ''
  pw.newPasswordConfirm = ''
}
async function onChangePassword() {
  if (!pw.currentPassword || !pw.newPassword || !pw.newPasswordConfirm) {
    toast(t('msg.validation.emptyPassword') || '비밀번호를 입력하세요.')
    return
  }
  if (pw.newPassword !== pw.newPasswordConfirm) {
    toast(t('msg.validation.passwordNotEqual') || '비밀번호가 일치하지 않습니다.')
    return
  }
  pwLoading.value = true
  try {
    await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
    toast(tt('password.changed','비밀번호가 변경되었습니다. 다시 로그인해 주세요.'))
    localStorage.removeItem('jwtToken')
    setTimeout(() => router.replace({ name: 'Login' }), 800)
  } catch (e) {
    const msg = e?.response?.data?.message || tt('error.changePw','비밀번호 변경 중 오류가 발생했습니다.')
    toast(msg)
  } finally {
    pwLoading.value = false
    resetPw()
  }
}
</script>

<style scoped>
.error--text { color: #e53935; }
</style>
