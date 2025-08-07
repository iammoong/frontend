<template>
  <v-dialog :model-value="open" @update:model-value="close" max-width="400" persistent>
    <v-card>
      <v-card-title  style="position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #eee;">{{ t('label.loginForm.signup') }}</v-card-title>
      <v-form @submit.prevent="onSignup">
        <v-card-text style="overflow-y: auto; flex: 1 1 auto; min-height: 0;">
          <!-- 아이디 입력 및 중복확인 버튼 -->
          <div class="d-flex mb-2 align-center">
            <div style="flex:1; display: flex; flex-direction: column;">
              <v-text-field
                  v-model="userId"
                  :label="t('label.loginForm.userId')"
                  :error="userIdError || userIdLengthError"
                  ref="userIdInput"
                  @input="onUserIdInput"
                  required
                  class="mr-2"
                  autocomplete="off"
              />
              <!-- 아이디 안내 메시지 -->
              <div v-if="userIdGuide" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:2px;">
                {{ t('msg.validation.userIdGuide.1') }}
              </div>
              <div v-if="userIdLengthError" class="text-caption" style="color:#e53935; margin-top:-2px; margin-bottom:8px;">
                {{ t('msg.validation.userIdGuide.2') }}
              </div>
            </div>
            <v-btn size="small"
                   color="primary"
                   variant="tonal"
                   rounded="lg"
                   class="ml-2"
                   elevation="2"
                   @click="onCheckUserId">{{ t('label.signup.duplicationCheck') }}
            </v-btn>
          </div>

          <!-- 닉네임 입력 및 중복확인 버튼 -->
          <div class="d-flex mb-2 align-center">
            <div style="flex:1; display: flex; flex-direction: column;">
              <v-text-field
                  v-model="nickname"
                  :label="t('label.loginForm.nickname')"
                  :error="nicknameError || nicknameCharError || nicknameLengthError"
                  ref="nicknameInput"
                  @update:modelValue="onNicknameUpdate"
                  required
                  class="mr-2"
              />
              <!-- 닉네임 안내 메시지 -->
              <div v-if="nicknameCharError" class="text-caption" style="color:#e53935; margin-top:-8px; margin-bottom:2px;">
                {{ t('msg.validation.nicknameGuide.1') }}
              </div>
              <div v-if="nicknameLengthError" class="text-caption" style="color:#e53935; margin-top:-2px; margin-bottom:8px;">
                {{ t('msg.validation.nicknameGuide.2') }}
              </div>
            </div>
            <v-btn size="small"
                   color="primary"
                   variant="tonal"
                   rounded="lg"
                   class="ml-2"
                   elevation="2"
                   @click="onCheckNickname">{{ t('label.signup.duplicationCheck') }}</v-btn>
          </div>

          <!-- 이메일 입력란 -->
          <div class="d-flex mb-2 align-center">
            <v-text-field
                v-model="emailId"
                :label="t('label.loginForm.email.id')"
                required
                maxlength="30"
                style="max-width:100px;"
                autocomplete="off"
            />
            <span class="mx-1">@</span>
            <v-text-field
                v-model="emailDomain"
                :readonly="selectedEmailDomain !== t('label.loginForm.email.direct')"
                required
                maxlength="30"
                style="max-width:110px;"
                autocomplete="off"
                ref="emailDomainInput"
            />
            <v-select
                v-model="selectedEmailDomain"
                :items="emailDomainOptions"
                density="compact"
                hide-details
                style="max-width:130px;"
                class="ml-3 mb-2"
                @update:modelValue="onSelectEmailDomain"
            />
          </div>

          <!-- 휴대전화 입력란 -->
          <div class="d-flex mb-2 align-center">
            <v-text-field
                v-model="phone1"
                maxlength="3"
                :placeholder="t('label.loginForm.phone.guide')"
                required
                style="max-width:60px;"
                @input="onPhoneInput('phone1', 3, $event)"
                ref="phone1Input"
            />
            <span class="mx-1">-</span>
            <v-text-field
                v-model="phone2"
                maxlength="4"
                required
                style="max-width:70px;"
                @input="onPhoneInput('phone2', 4, $event)"
                ref="phone2Input"
            />
            <span class="mx-1">-</span>
            <v-text-field
                v-model="phone3"
                maxlength="4"
                required
                style="max-width:70px;"
                @input="onPhoneInput('phone3', 4, $event)"
                ref="phone3Input"
            />
          </div>

          <!-- 이름 입력 -->
          <v-text-field
              v-model="username"
              :label="t('label.loginForm.username')"
              :error="usernameError"
              ref="usernameInput"
              @input="onInput('username')"
              required
          />
          <!-- 비밀번호 입력 -->
          <v-text-field
              v-model="password"
              :label="t('label.loginForm.password')"
              :error="passwordError"
              ref="passwordInput"
              @input="onInput('password')"
              type="password"
              required
          />
          <!-- 비밀번호 확인 입력 -->
          <v-text-field
              v-model="passwordConfirm"
              :label="t('label.loginForm.passwordConfirm')"
              :error="passwordConfirmError"
              ref="passwordConfirmInput"
              @input="onPasswordConfirmInput"
              type="password"
              required
          />
          <div v-if="passwordConfirmGuide" class="text-caption" style="color:#e53935;">
            {{t('msg.validation.passwordNotEqual') }}
          </div>
        </v-card-text>
        <v-card-actions style="position: sticky; bottom: 0; z-index: 10; background: #fff; border-top: 1px solid #eee;">
          <!-- 가입/취소 버튼 -->
          <v-btn type="submit" color="primary"
                 :disabled="!isUserIdChecked || !isUserIdAvailable || !isNicknameChecked || !isNicknameAvailable"
          >{{ t('label.signup.accession') }}
          </v-btn>
          <v-btn text @click="onClickCancel">{{ t('label.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showConfirmClose" max-width="360">
    <v-card>
      <v-card-title class="font-weight-bold">{{ t('msg.closeConfirm.title') }}</v-card-title>
      <v-card-text>
        {{ t('msg.closeConfirm.content1') }}
        <br>
        <span style="color:#e53935;">{{ t('msg.closeConfirm.content2') }}</span>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="showConfirmClose = false">{{ t('msg.closeConfirm.continue') }}</v-btn>
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

// 조합 이벤트 리스너 (setup 내에서)
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
    // alertStore.show(t('msg.signup.signupSuccess'))
    alertStore.show(t('msg.signup.signupSuccess'), 'success')
    close()
  } catch (e) {
    const errMsg = e?.response?.data?.message
    if (errMsg === '이미 등록된 이메일 아이디 입니다.') {
      alertStore.show(errMsg, 'error')
    } else{
      alertStore.show(errMsg || t('msg.signup.signupFail'), 'error')
    }
    // alertStore.show(e?.response?.data?.message || t('msg.signup.signupFail'))

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
