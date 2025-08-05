<template>
  <v-dialog :model-value="open" @update:model-value="close" max-width="400">
    <v-card>
      <v-card-title>{{ t('label.loginForm.signup') }}</v-card-title>
      <v-form @submit.prevent="onSignup">
        <v-card-text>
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
        <v-card-actions>
          <!-- 가입/취소 버튼 -->
          <v-btn type="submit" color="primary"
                 :disabled="!isUserIdChecked || !isUserIdAvailable || !isNicknameChecked || !isNicknameAvailable"
          >{{ t('label.signup.accession') }}
          </v-btn>
          <v-btn text @click="close">{{ t('label.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {onMounted, ref} from 'vue'
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
    alertStore.show(t('msg.login.emptyUserId'))
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
    alertStore.show(t('msg.duplication.userIdDuplicate'))
  } else {
    alertStore.show(t('msg.duplication.userIdAvailable'))
  }
}

// 닉네임 중복확인
async function onCheckNickname() {
  isNicknameChecked.value = false
  isNicknameAvailable.value = false
  if (!nickname.value) {
    alertStore.show(t('msg.validation.emptyNickname'))
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
    alertStore.show(t('msg.duplication.nicknameDuplicate'))
  } else {
    alertStore.show(t('msg.duplication.nicknameAvailable'))
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
    alertStore.show(t('msg.login.emptyUserId'))
    return
  }
  if (userId.value.length < 4 || userId.value.length > 16) {
    userIdLengthError.value = true
    userIdInput.value?.focus()
    alertStore.show('아이디는 4자 이상~16자 이하로 입력해주세요.')
    return
  }
  // 닉네임 유효성
  if (!nickname.value) {
    nicknameError.value = true
    nicknameInput.value?.focus()
    alertStore.show(t('msg.validation.emptyNickname'))
    return
  }
  if (nickname.value.length < 2 || nickname.value.length > 8) {
    nicknameLengthError.value = true
    nicknameInput.value?.focus()
    alertStore.show('닉네임은 2자 이상~8자 이하로 입력해주세요.')
    return
  }
  // 이름, 비밀번호, 비번확인
  if (!username.value) {
    usernameError.value = true
    usernameInput.value?.focus()
    alertStore.show(t('msg.validation.emptyUsername'))
    return
  }
  if (!password.value) {
    passwordError.value = true
    passwordInput.value?.focus()
    alertStore.show(t('msg.validation.emptyPassword'))
    return
  }
  if (!passwordConfirm.value) {
    passwordConfirmError.value = true
    passwordConfirmInput.value?.focus()
    passwordConfirmGuide.value = false
    alertStore.show(t('msg.validation.emptyPasswordConfirm'))
    return
  }
  if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = true
    passwordConfirmGuide.value = true
    passwordConfirmInput.value?.focus()
    alertStore.show(t('msg.validation.passwordNotEqual'))
    return
  }
  // 모두 입력된 경우 회원가입 요청
  try {
    await post('api/auth/signup', {
      userId: userId.value,
      username: username.value,
      password: password.value,
      nickname: nickname.value,
    })
    alertStore.show(t('msg.signup.signupSuccess'))
    close()
  } catch (e) {
    alertStore.show(e?.response?.data?.message || t('msg.signup.signupFail'))
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
  userIdError.value = nicknameError.value = usernameError.value = passwordError.value = false
  userIdGuide.value = userIdLengthError.value = false
  nicknameCharError.value = nicknameLengthError.value = false
  passwordConfirmGuide.value = false
  isNicknameChecked.value = isNicknameAvailable.value = isUserIdChecked.value = isUserIdAvailable.value = false
}
</script>
