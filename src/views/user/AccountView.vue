<template>
  <v-container class="py-8" style="max-width: 720px;">
    <h2 class="text-h5 font-weight-bold mb-6">내 정보</h2>

    <v-form v-if="loaded">
      <!-- 아이디 -->
      <div class="d-flex mb-3 align-center">
        <v-text-field
            v-model="form.userId"
            :label="t('label.loginForm.userId')"
            :readonly="!editMode || isKakaoAccount"
            :error="userIdError || userIdLengthError"
            @input="onUserIdInput"
            class="flex-grow-1"
        />
        <v-btn
            v-if="editMode && !isKakaoAccount"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2"
            @click="onCheckUserId"
        >중복확인
        </v-btn>
      </div>
      <div v-if="editMode && isKakaoAccount" class="text-caption"
           style="color:#6b7280; margin-top:-8px; margin-bottom:8px;">
        카카오 로그인 계정은 아이디를 변경할 수 없습니다.
      </div>
      <div v-if="userIdGuide" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:8px;">
        {{ t('msg.validation.userIdGuide.1') }}
      </div>
      <div v-if="userIdLengthError" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:8px;">
        {{ t('msg.validation.userIdGuide.2') }}
      </div>

      <!-- 이름 -->
      <v-text-field
          v-model="form.username"
          :label="t( 'label.loginForm.username')"
          :readonly="!editMode"
          class="mb-3"
      />

      <!-- 닉네임 -->
      <div class="d-flex mb-3 align-center">
        <v-text-field
            v-model="form.nickname"
            :label="t('label.loginForm.nickname')"
            :readonly="!editMode || isKakaoAccount"
            :error="nicknameError || nicknameLengthError || nicknameCharError"
            @update:modelValue="onNicknameUpdate"
            class="flex-grow-1"
        />
        <v-btn
            v-if="editMode"
            size="small"
            color="primary"
            variant="tonal"
            class="ml-2"
            @click="onCheckNickname"
        >{{ t('label.signup.duplicationCheck') }}
        </v-btn>
      </div>
      <div v-if="nicknameCharError" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:6px;">
        {{ t('msg.validation.nicknameGuide.1') }}
      </div>
      <div v-if="nicknameLengthError" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:6px;">
        {{ t('msg.validation.nicknameGuide.2') }}
      </div>

      <!-- 이메일 -->
      <v-text-field
          v-model="form.email"
          :label="t('label.loginForm.email.id')"
          :readonly="!editMode"
      />

      <div class="mt-6 d-flex gap-2">
        <v-btn color="primary" @click="onPrimary">
          {{ editMode ? '저장하기' : '수정하기' }}
        </v-btn>
        <v-btn variant="text" @click="onReset">되돌리기</v-btn>
      </div>
    </v-form>

    <div v-else class="text-body-2">정보를 불러오는 중...</div>
  </v-container>
</template>

<script setup>
import {reactive, ref, onMounted, nextTick, computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useAlertStore} from '@/store/alert'
import {useAxios} from '@/hooks/user/useAxios'  // ← 기존 훅 재사용

const {t} = useI18n()
const alertStore = useAlertStore()
const {instance: api, checkUserId, checkNickname, getMe, put} = useAxios()

const loaded = ref(false)
const editMode = ref(false)

const initial = reactive({
  userId: '', username: '', nickname: '', email: '', kakaoId: null,
})

const form = reactive({
  userId: '', username: '', nickname: '', email: '', kakaoId: null,
})

/** ===== SignupModal과 같은 유효성/중복확인 상태값 ===== */
const userIdError = ref(false)
const userIdLengthError = ref(false)
const userIdGuide = ref(false)
const isUserIdChecked = ref(false)
const isUserIdAvailable = ref(false)

const nicknameError = ref(false)
const nicknameLengthError = ref(false)
const nicknameCharError = ref(false)
const isNicknameChecked = ref(false)
const isNicknameAvailable = ref(false)
const isComposing = ref(false)

const isKakaoAccount = computed(() => !!form.kakaoId)

/** ===== 초기 데이터 로드 ===== */
async function fetchMe() {
  const {data} = await getMe()
  Object.assign(initial, data)
  Object.assign(form, data)
  loaded.value = true
}

onMounted(() => {
  fetchMe().catch(() => alertStore.show('내 정보를 불러오지 못했습니다.', 'error'))
})

/** ===== 편집 토글/되돌리기 ===== */
function onPrimary() {
  if (!editMode.value) {
    editMode.value = true
    nextTick(() => {
    }) // 포커스 필요 시 지정
    return
  }
  onSave()
}

function onReset() {
  Object.assign(form, initial)
  resetValidation()
  editMode.value = false
}

/** ===== 아이디 입력 (영소문자/숫자, 4~16) ===== */
function onUserIdInput(e) {

  if (isKakaoAccount.value) {
    // 카카오 계정이면 입력 차단 및 원복
    e.target.value = initial.userId
    form.userId = initial.userId
    return
  }
  const value = e.target.value.replace(/[^a-z0-9]/g, '')
  form.userId = value
  userIdLengthError.value = !(value.length === 0 || (value.length >= 4 && value.length <= 16))
  userIdGuide.value = value !== e.target.value
  userIdError.value = false
  isUserIdChecked.value = false
  isUserIdAvailable.value = false
}

/** ===== 닉네임 입력 (한글/영문/숫자, 2~8) ===== */
function onNicknameUpdate(val) {
  if (isComposing.value) {
    form.nickname = val;
    return
  }
  const filtered = val.replace(/[^a-zA-Z0-9가-힣]/g, '')
  nicknameCharError.value = filtered !== val
  form.nickname = filtered
  nicknameLengthError.value = !(filtered.length === 0 || (filtered.length >= 2 && filtered.length <= 8))
  nicknameError.value = false
  isNicknameChecked.value = false
  isNicknameAvailable.value = false
}

/** ===== 중복확인 (아이디/닉네임) ===== */
async function onCheckUserId() {
  isUserIdChecked.value = false
  isUserIdAvailable.value = false
  if (!form.userId) {
    alertStore.show(t('msg.login.emptyUserId'), 'error')
    userIdError.value = true
    return
  }
  if (form.userId.length < 4 || form.userId.length > 16) {
    userIdLengthError.value = true
    return
  }
  const {data} = await checkUserId(form.userId)
  isUserIdChecked.value = true
  isUserIdAvailable.value = !data
  alertStore.show(t(data ? 'msg.duplication.userIdDuplicate' : 'msg.duplication.userIdAvailable'),
      data ? 'error' : 'success')
}

async function onCheckNickname() {
  isNicknameChecked.value = false
  isNicknameAvailable.value = false
  if (!form.nickname) {
    nicknameError.value = true
    alertStore.show(t('msg.validation.emptyNickname'), 'error')
    return
  }
  if (form.nickname.length < 2 || form.nickname.length > 8) {
    nicknameLengthError.value = true
    return
  }
  const {data} = await checkNickname(form.nickname)
  isNicknameChecked.value = true
  isNicknameAvailable.value = !data
  alertStore.show(t(data ? 'msg.duplication.nicknameDuplicate' : 'msg.duplication.nicknameAvailable'),
      data ? 'error' : 'success')
}

/** ===== 저장 =====
 *  - 아이디 또는 닉네임이 변경되었다면 '중복확인' 완료 상태를 요구
 *  - 백엔드에서 userId 변경 시 새 토큰을 내려주도록 (2장 참고)
 */
async function onSave() {
  // 아이디 변경 시, 중복확인 필요
  if (form.userId !== initial.userId) {
    if (isKakaoAccount.value) {
      alertStore.show('카카오 로그인 계정은 아이디를 변경할 수 없습니다.', 'error')
      form.userId = initial.userId
      return
    }
    if (!isUserIdChecked.value || !isUserIdAvailable.value) {
      alertStore.show('아이디 중복확인을 해주세요.', 'error')
      return
    }
  }
  // 닉네임 변경 시, 중복확인 필요
  if (form.nickname !== initial.nickname) {
    if (!isNicknameChecked.value || !isNicknameAvailable.value) {
      alertStore.show('닉네임 중복확인을 해주세요.', 'error')
      return
    }
  }

  // PUT /api/auth/me (백엔드 2장 수정안 기준: newUserId 지원 + token 재발급)
  const payload = {
    newUserId: (form.userId !== initial.userId && !isKakaoAccount.value) ? form.userId : null,
    username: form.username,
    nickname: form.nickname,
    email: form.email,
  }
  const {data} = await api.put('api/auth/me', payload)

  // 토큰 재발급 시 반영 (LoginResponseDto 형태: { user, token })
  if (data?.token) {
    localStorage.setItem('jwtToken', data.token)
  }

  Object.assign(initial, data?.user ?? form)
  Object.assign(form, initial)
  alertStore.show('저장되었습니다.', 'success')
  editMode.value = false
  resetValidation()
}

function resetValidation() {
  userIdError.value = userIdLengthError.value = userIdGuide.value = false
  isUserIdChecked.value = isUserIdAvailable.value = false
  nicknameError.value = nicknameLengthError.value = nicknameCharError.value = false
  isNicknameChecked.value = isNicknameAvailable.value = false
}
</script>
