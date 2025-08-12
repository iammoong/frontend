<template>
  <v-dialog :model-value="open" @update:model-value="close" max-width="440" persistent>
    <v-card class="modal-card">
      <!-- 스티키 헤더 -->
      <v-card-title class="modal-header">
        {{ t('label.loginForm.signup') }}
      </v-card-title>

      <v-form @submit.prevent="onSignup">
        <!-- 스크롤 영역 -->
        <v-card-text class="scroll-area">
          <!-- 아이디 + 중복확인 -->
          <div class="d-flex mb-3 align-center">
            <v-text-field
                v-model="userId"
                :label="t('label.loginForm.userId')"
                :error="userIdError || userIdLengthError"
                ref="userIdInput"
                @input="onUserIdInput"
                required
                class="flex-grow-1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-card-account-details-outline"
                autocomplete="off"
            />
            <v-btn
                size="small"
                color="primary"
                variant="tonal"
                rounded="lg"
                class="ml-2"
                elevation="2"
                @click="onCheckUserId"
                prepend-icon="mdi-magnify"
            >
              {{ t('label.signup.duplicationCheck') }}
            </v-btn>
          </div>
          <div v-if="userIdGuide" class="hint-error">
            {{ t('msg.validation.userIdGuide.1') }}
          </div>
          <div v-if="userIdLengthError" class="hint-error">
            {{ t('msg.validation.userIdGuide.2') }}
          </div>

          <!-- 닉네임 + 중복확인 -->
          <div class="d-flex mb-3 align-center">
            <v-text-field
                v-model="nickname"
                :label="t('label.loginForm.nickname')"
                :error="nicknameError || nicknameCharError || nicknameLengthError"
                ref="nicknameInput"
                @update:modelValue="onNicknameUpdate"
                required
                class="flex-grow-1"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
            />
            <v-btn
                size="small"
                color="primary"
                variant="tonal"
                rounded="lg"
                class="ml-2"
                elevation="2"
                @click="onCheckNickname"
                prepend-icon="mdi-magnify"
            >
              {{ t('label.signup.duplicationCheck') }}
            </v-btn>
          </div>
          <div v-if="nicknameCharError" class="hint-error">
            {{ t('msg.validation.nicknameGuide.1') }}
          </div>
          <div v-if="nicknameLengthError" class="hint-error">
            {{ t('msg.validation.nicknameGuide.2') }}
          </div>

          <!-- 이메일 -->
          <div class="d-flex mb-3 align-center">
            <v-text-field
                v-model="emailId"
                :label="t('label.loginForm.email.id')"
                required
                maxlength="30"
                style="max-width:120px;"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
                autocomplete="off"
            />
            <span class="mx-1">@</span>
            <v-text-field
                v-model="emailDomain"
                :readonly="selectedEmailDomain !== t('label.loginForm.email.direct')"
                required
                maxlength="30"
                style="max-width:140px;"
                variant="outlined"
                density="comfortable"
                ref="emailDomainInput"
                autocomplete="off"
            />
            <v-select
                v-model="selectedEmailDomain"
                :items="emailDomainOptions"
                density="comfortable"
                hide-details
                style="max-width:150px;"
                class="ml-3"
                variant="outlined"
                @update:modelValue="onSelectEmailDomain"
            />
          </div>

          <!-- 휴대전화 -->
          <div class="d-flex mb-3 align-center">
            <v-text-field
                v-model="phone1"
                maxlength="3"
                :placeholder="t('label.loginForm.phone.guide')"
                required
                style="max-width:70px;"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone-outline"
                @input="onPhoneInput('phone1', 3, $event)"
                ref="phone1Input"
            />
            <span class="mx-1">-</span>
            <v-text-field
                v-model="phone2"
                maxlength="4"
                required
                style="max-width:90px;"
                variant="outlined"
                density="comfortable"
                @input="onPhoneInput('phone2', 4, $event)"
                ref="phone2Input"
            />
            <span class="mx-1">-</span>
            <v-text-field
                v-model="phone3"
                maxlength="4"
                required
                style="max-width:90px;"
                variant="outlined"
                density="comfortable"
                @input="onPhoneInput('phone3', 4, $event)"
                ref="phone3Input"
            />
          </div>

          <!-- 이름 -->
          <v-text-field
              v-model="username"
              :label="t('label.loginForm.username')"
              :error="usernameError"
              ref="usernameInput"
              @input="onInput('username')"
              required
              class="mb-3"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-badge-outline"
          />

          <!-- 비밀번호 -->
          <v-text-field
              v-model="password"
              :label="t('label.loginForm.password')"
              :error="passwordError"
              ref="passwordInput"
              @input="onInput('password')"
              :type="showPw ? 'text' : 'password'"
              required
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPw = !showPw"
              class="mb-3"
          />
          <!-- 비밀번호 확인 -->
          <v-text-field
              v-model="passwordConfirm"
              :label="t('label.loginForm.passwordConfirm')"
              :error="passwordConfirmError"
              ref="passwordConfirmInput"
              @input="onPasswordConfirmInput"
              :type="showPw2 ? 'text' : 'password'"
              required
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showPw2 ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPw2 = !showPw2"
          />
          <div v-if="passwordConfirmGuide" class="hint-error">
            {{ t('msg.validation.passwordNotEqual') }}
          </div>
        </v-card-text>

        <!-- 스티키 풋터 -->
        <v-card-actions class="modal-footer">
          <v-btn
              type="submit"
              color="primary"
              :disabled="!isUserIdChecked || !isUserIdAvailable || !isNicknameChecked || !isNicknameAvailable"
          >
            {{ t('label.signup.accession') }}
          </v-btn>
          <v-btn variant="text" @click="onClickCancel">{{ t('label.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <!-- 닫기 확인 모달 -->
  <v-dialog v-model="showConfirmClose" max-width="360">
    <v-card>
      <v-card-title class="font-weight-bold">{{ t('msg.closeConfirm.title') }}</v-card-title>
      <v-card-text>
        {{ t('msg.closeConfirm.content1') }}<br>
        <span class="error--text">{{ t('msg.closeConfirm.content2') }}</span>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="showConfirmClose = false">{{ t('msg.closeConfirm.continue') }}</v-btn>
        <v-btn color="primary" @click="onConfirmClose">{{ t('label.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {onMounted, ref, nextTick} from 'vue'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/hooks/user/useAxios.js'
import { useAlertStore } from '@/store/alert.js'
const { t } = useI18n()

// props & emit
const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])

// 입력 상태
const userId = ref('')
const nickname = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')

// 에러 상태
const userIdError = ref(false)
const userIdLengthError = ref(false)
const userIdGuide = ref(false)

const nicknameError = ref(false)
const nicknameCharError = ref(false)
const nicknameLengthError = ref(false)

const usernameError = ref(false)
const passwordError = ref(false)
const passwordConfirmError = ref(false)
const passwordConfirmGuide = ref(false)

// ref
const userIdInput = ref()
const nicknameInput = ref()
const usernameInput = ref()
const passwordInput = ref()
const passwordConfirmInput = ref()

// 중복확인
const isUserIdChecked = ref(false)
const isUserIdAvailable = ref(false)
const isNicknameChecked = ref(false)
const isNicknameAvailable = ref(false)

const { post, checkUserId, checkNickname } = useAxios()
const alertStore = useAlertStore()

const isComposing = ref(false)

const showPw = ref(false)
const showPw2 = ref(false)

// 아이디 입력 이벤트: 영어 소문자, 숫자만, 4~16자
function onUserIdInput(e) {
  const value = e.target.value.replace(/[^a-z0-9]/g, '')
  userId.value = value
  // 길이 체크
  userIdLengthError.value = !(value.length === 0 || (value.length >= 4 && value.length <= 16))
  // 안내
  userIdGuide.value = value !== e.target.value
  // 에러/중복초기화
  userIdError.value = false
  isUserIdChecked.value = false
  isUserIdAvailable.value = false
}

function onNicknameUpdate(val) {
  // 조합중이면 제한하지 않음
  if (isComposing.value) {
    nickname.value = val
    return
  }
  // 한글, 영문, 숫자만 허용
  const filtered = val.replace(/[^a-zA-Z0-9가-힣]/g, '')
  nicknameCharError.value = filtered !== val
  nickname.value = filtered
  nicknameLengthError.value = !(filtered.length === 0 || (filtered.length >= 2 && filtered.length <= 8))
  nicknameError.value = false
  isNicknameChecked.value = false
  isNicknameAvailable.value = false
}

onMounted(() => {
  const input = nicknameInput.value?.$el?.querySelector('input')
  if (input) {
    input.addEventListener('compositionstart', () => isComposing.value = true)
    input.addEventListener('compositionend', () => isComposing.value = false)
  }
})

// 이메일 관련
const emailId = ref('')
const emailDomain = ref('')
const selectedEmailDomain = ref(t('label.loginForm.email.direct'))
const emailDomainOptions = [
    t('label.loginForm.email.direct'),
    t('label.loginForm.email.daum'),
    t('label.loginForm.email.kakao'),
    t('label.loginForm.email.naver'),
    t('label.loginForm.email.gmail'),
    t('label.loginForm.email.nate'),]
const emailDomainInput = ref(null)

function onSelectEmailDomain(val) {
  if (val === '직접입력') {
    nextTick(() => emailDomainInput.value?.focus())
    emailDomain.value = ''
  } else {
    emailDomain.value = val
  }
}

// 휴대전화 관련
const phone1 = ref('')
const phone2 = ref('')
const phone3 = ref('')
const phone1Input = ref(null)
const phone2Input = ref(null)
const phone3Input = ref(null)

function onPhoneInput(type, maxLen, e) {
  let v = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLen)
  if (type === 'phone1') phone1.value = v
  if (type === 'phone2') phone2.value = v
  if (type === 'phone3') phone3.value = v

  // 자리수 다 채우면 자동 포커스
  if (v.length === maxLen) {
    if (type === 'phone1') nextTick(() => phone2Input.value.focus())
    else if (type === 'phone2') nextTick(() => phone3Input.value.focus())
  }
}

// 기타 입력값 변경시 에러 해제
function onInput(field) {
  if (field === 'username') usernameError.value = false
  if (field === 'password') passwordError.value = false
  if (field === 'passwordConfirm') {
    passwordConfirmError.value = false
    passwordConfirmGuide.value = false
  }
}

// 비밀번호 확인
function onPasswordConfirmInput() {
  passwordConfirmError.value = false
  passwordConfirmGuide.value = false
  if (passwordConfirm.value && password.value !== passwordConfirm.value) {
    passwordConfirmError.value = true
    passwordConfirmGuide.value = true
  }
}

// 아이디 중복확인
async function onCheckUserId() {
  isUserIdChecked.value = false
  isUserIdAvailable.value = false
  // 입력 및 길이 체크
  if (!userId.value) {
    alertStore.show(t('msg.login.emptyUserId'),'error')
    userIdError.value = true
    userIdInput.value?.focus()
    return
  }
  if (userId.value.length < 4 || userId.value.length > 16) {
    userIdLengthError.value = true
    userIdInput.value?.focus()
    return
  }
  const { data } = await checkUserId(userId.value)
  isUserIdChecked.value = true
  isUserIdAvailable.value = !data
  if (data) {
    alertStore.show(t('msg.duplication.userIdDuplicate'),'error')
  } else {
    alertStore.show(t('msg.duplication.userIdAvailable'),'success')
  }
}

// 닉네임 중복확인
async function onCheckNickname() {
  isNicknameChecked.value = false
  isNicknameAvailable.value = false
  if (!nickname.value) {
    alertStore.show(t('msg.validation.emptyNickname'),'error')
    nicknameError.value = true
    nicknameInput.value?.focus()
    return
  }
  if (nickname.value.length < 2 || nickname.value.length > 8) {
    nicknameLengthError.value = true
    nicknameInput.value?.focus()
    return
  }
  const { data } = await checkNickname(nickname.value)
  isNicknameChecked.value = true
  isNicknameAvailable.value = !data
  if (data) {
    alertStore.show(t('msg.duplication.nicknameDuplicate'),'error')
  } else {
    alertStore.show(t('msg.duplication.nicknameAvailable'),'success')
  }
}

// 회원가입 버튼 클릭 시 유효성 검사
async function onSignup() {
  // 에러 상태 초기화
  userIdError.value = nicknameError.value = usernameError.value = passwordError.value = false
  userIdLengthError.value = nicknameCharError.value = nicknameLengthError.value = false
  passwordConfirmGuide.value = false

  // 아이디 유효성
  if (!userId.value) {
    userIdError.value = true
    userIdInput.value?.focus()
    alertStore.show(t('msg.login.emptyUserId'),'error')
    return
  }
  if (userId.value.length < 4 || userId.value.length > 16) {
    userIdLengthError.value = true
    userIdInput.value?.focus()
    return
  }
  // 닉네임 유효성
  if (!nickname.value) {
    nicknameError.value = true
    nicknameInput.value?.focus()
    alertStore.show(t('msg.validation.emptyNickname'),'error')
    return
  }
  if (nickname.value.length < 2 || nickname.value.length > 8) {
    nicknameLengthError.value = true
    nicknameInput.value?.focus()
    return
  }
  // 이름, 비밀번호, 비번확인
  if (!username.value) {
    usernameError.value = true
    usernameInput.value?.focus()
    alertStore.show(t('msg.validation.emptyUsername'),'error')
    return
  }
  if (!password.value) {
    passwordError.value = true
    passwordInput.value?.focus()
    alertStore.show(t('msg.validation.emptyPassword'),'error')
    return
  }
  if (!passwordConfirm.value) {
    passwordConfirmError.value = true
    passwordConfirmInput.value?.focus()
    passwordConfirmGuide.value = false
    alertStore.show(t('msg.validation.emptyPasswordConfirm'),'error')
    return
  }
  if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = true
    passwordConfirmGuide.value = true
    passwordConfirmInput.value?.focus()
    alertStore.show(t('msg.validation.passwordNotEqual'),'error')
    return
  }
  // 모두 입력된 경우 회원가입 요청
  try {
    await post('api/auth/signup', {
      userId: userId.value,
      username: username.value,
      password: password.value,
      nickname: nickname.value,
      email: emailId.value && emailDomain.value ? `${emailId.value}@${emailDomain.value}` : '',
      phone: [phone1.value, phone2.value, phone3.value].join('-'),
    })
    alertStore.show(t('msg.signup.signupSuccess'), 'success')
    close()
  } catch (e) {
    const errMsg = e?.response?.data?.message
    if (errMsg === '이미 등록된 이메일 아이디 입니다.') {
      alertStore.show(errMsg, 'error')
    } else{
      alertStore.show(errMsg || t('msg.signup.signupFail'), 'error')
    }
  }
}

// 모달 닫기 및 초기화
function close() {
  emit('close')
  userId.value = ''
  nickname.value = ''
  username.value = ''
  password.value = ''
  passwordConfirm.value = ''
  phone1.value = ''
  phone2.value = ''
  phone3.value = ''
  emailId.value = ''
  emailDomain.value = ''
  selectedEmailDomain.value = t('label.loginForm.email.direct');
  userIdError.value = nicknameError.value = usernameError.value = passwordError.value = false
  userIdGuide.value = userIdLengthError.value = false
  nicknameCharError.value = nicknameLengthError.value = false
  passwordConfirmGuide.value = false
  isNicknameChecked.value = isNicknameAvailable.value = isUserIdChecked.value = isUserIdAvailable.value = false
}

function isFormDirty() {
  // 하나라도 값이 입력되어 있으면 true 반환
  return (
      userId.value ||
      nickname.value ||
      username.value ||
      password.value ||
      passwordConfirm.value ||
      phone1.value ||
      phone2.value ||
      phone3.value ||
      emailId.value ||
      emailDomain.value
  )
}

const showConfirmClose = ref(false)
function onClickCancel() {
  if (isFormDirty()) {
    showConfirmClose.value = true
  } else {
    close()
  }
}

function onConfirmClose() {
  showConfirmClose.value = false
  close()
}
</script>
<style scoped>
.modal-card {
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: saturate(135%) blur(8px);
  background-color: rgba(255,255,255,0.86);
}

/* 다크모드 대응 */
:deep(.v-theme--dark) .modal-card {
  background-color: rgba(18,18,18,0.72);
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 14px 20px;
  font-weight: 700;
  background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.85));
  border-bottom: 1px solid rgba(0,0,0,.06);
}
:deep(.v-theme--dark) .modal-header {
  background: linear-gradient(180deg, rgba(22,22,22,.9), rgba(22,22,22,.85));
  border-bottom-color: rgba(255,255,255,.08);
}

.scroll-area {
  max-height: 65vh;
  overflow-y: auto;
  padding-top: 14px;
}

.modal-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: linear-gradient(0deg, rgba(255,255,255,.95), rgba(255,255,255,.85));
  border-top: 1px solid rgba(0,0,0,.06);
}
:deep(.v-theme--dark) .modal-footer {
  background: linear-gradient(0deg, rgba(22,22,22,.95), rgba(22,22,22,.85));
  border-top-color: rgba(255,255,255,.08);
}

.hint-error {
  color: #e53935;
  margin-top: -6px;
  margin-bottom: 8px;
  font-size: 12px;
}

.kakao-image-btn, .v-btn {
  transition: transform .06s ease;
}
.v-btn:hover { transform: translateY(-1px); }
</style>

