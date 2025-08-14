<template>
  <v-container fluid class="fill-height pa-0 gradient-bg">
    <v-row class="ma-0 fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card
            class="login-card py-6 px-6 rounded-xl"
            elevation="10"
            :aria-busy="loading"
        >
          <!-- 로고/타이틀 -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-avatar size="40" class="brand-avatar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </v-avatar>
              <div class="ms-3">
                <div class="text-h6 font-weight-bold">{{ t('label.loginForm.login') }}</div>
                <div class="text-caption opacity-80">{{ tt('label.subtitle') }}</div>
              </div>
            </div>
            <v-chip
                size="small"
                variant="flat"
                prepend-icon="mdi-translate"
                class="cursor-pointer"
                clickable
                @click="toggleLocale"
            >
              {{ localeLabel }}
            </v-chip>
          </div>

          <v-divider class="mb-4"></v-divider>

          <v-form @submit.prevent="onLogin">
            <v-text-field
                v-model="userId"
                :label="t('label.loginForm.userId')"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                :rules="[rules.required(t('msg.login.emptyUserId'))]"
                autocomplete="username"
                @input="onUserIdInput"
            />
            <v-text-field
                v-model="password"
                :label="t('label.loginForm.password')"
                :type="showPw ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPw = !showPw"
                :rules="[rules.required(t('msg.validation.emptyPassword'))]"
                autocomplete="current-password"
                @keydown="handleCapsLock"
                @keyup="handleCapsLock"
            />

            <!-- CapsLock 안내 -->
            <v-expand-transition>
              <div
                  v-if="isCapsLock"
                  class="text-caption mt-n2 mb-3"
                  style="color:#e53935;"
                  role="alert"
              >
                {{ t('label.loginForm.capslock') }}
              </div>
            </v-expand-transition>

            <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                class="mt-1 mb-3"
                :loading="loading"
            >
              {{ t('label.loginForm.login') }}
            </v-btn>

            <!-- 구분선 -->
            <div class="d-flex align-center my-2">
              <v-divider></v-divider>
              <span class="mx-2 text-caption opacity-70"></span>
              <v-divider></v-divider>
            </div>

            <!-- Kakao 로그인 -->
            <v-btn
                block
                class="kakao-btn mt-2"
                elevation="0"
                rounded="lg"
                height="50"
                @click="onKakaoLogin"
            >
              <img
                  src="@/assets/kakao_logo_wide.png"
                  alt="카카오 로그인"
                  draggable="false"
                  class="kakao-logo"
              />
            </v-btn>

            <!-- 보조 액션 -->
            <div class="d-flex justify-space-between mt-4">
              <v-btn variant="text" @click="openSignupAgreement = true">
                {{ t('label.loginForm.signup') }}
              </v-btn>
              <v-btn variant="text" @click="openFindModal = true">
                {{ t('label.findIdPw') }}
              </v-btn>
            </div>
          </v-form>

          <!-- 모달들 -->
          <SignupAgreementModal
              :open="openSignupAgreement"
              @next="openSignupNext"
              @close="openSignupAgreement = false"
          />
          <SignupModal :open="openSignup" @close="openSignup = false" />
          <FindAccountModal :open="openFindModal" @close="openFindModal = false" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import SignupModal from '../modal/SignupModal.vue'
import SignupAgreementModal from '../modal/SignupAgreementModal.vue'
import FindAccountModal from '../modal/FindAccountModal.vue'
import { useAlertStore } from '@/store/alert.js'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/hooks/user/useAxios.js'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const tt = (key, fallback) => (t(key) === key ? (fallback ?? key) : t(key))

const alertStore = useAlertStore()
const router = useRouter()
const { login } = useAxios()

const userId = ref('')
const password = ref('')
const showPw = ref(false)
const isCapsLock = ref(false)
const loading = ref(false)

const openSignupAgreement = ref(false)
const openSignup = ref(false)
const openFindModal = ref(false)

const rules = {
  required: (msg) => (v) => (!!v ? true : msg),
}

const { locale } = useI18n({ useScope: 'global' })
// 한/EN 라벨
const localeLabel = computed(() => (locale.value === 'ko' ? '한' : 'EN'))

function toggleLocale() {
  locale.value = locale.value === 'ko' ? 'en' : 'ko'
  localStorage.setItem('locale', locale.value)
  document.documentElement.setAttribute('lang', locale.value)
}

// 최초 마운트 시 html lang 동기화
onMounted(() => {
  document.documentElement.setAttribute('lang', t.value)
})

// CapsLock 감지
function handleCapsLock(e) {
  if (e.getModifierState) isCapsLock.value = e.getModifierState('CapsLock')
}

// 한글 → 영문 QWERTY 변환
function convertHangulToQwerty(str) {
  const kor = 'ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡ'
  const eng = 'qwertyuiopasdfghjklzxcvbnm'
  const map = {}
  for (let i = 0; i < kor.length; i++) map[kor[i]] = eng[i]
  return str.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, (char) => {
    const uni = char.charCodeAt(0)
    if (uni >= 0x3131 && uni <= 0x3163) return map[char] || ''
    if (uni >= 0xac00 && uni <= 0xd7a3) {
      const initial = Math.floor((uni - 0xac00) / 588)
      const vowel = Math.floor(((uni - 0xac00) % 588) / 28)
      const final = (uni - 0xac00) % 28
      let result = ''
      const initialKor = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
      result += map[initialKor[initial]] || ''
      const vowelKor = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
      result += map[vowelKor[vowel]] || ''
      const finalKor = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
      result += map[finalKor[final]] || ''
      return result
    }
    return char
  })
}

function onUserIdInput(e) {
  const raw = e.target.value
  const converted = convertHangulToQwerty(raw).replace(/[^a-z0-9]/g, '').toLowerCase()
  userId.value = converted
}

async function onLogin() {
  if (!userId.value) {
    alertStore.show(t('msg.login.emptyLogin'), 'error')
    return
  }
  if (!password.value) {
    alertStore.show(t('msg.login.emptyPassword'), 'error')
    return
  }
  loading.value = true
  try {
    const { data } = await login(userId.value, password.value)
    localStorage.setItem('jwtToken', data.token)
    await router.replace({ name: 'Main' })
  } catch (e) {
    alertStore.show(e?.response?.data?.message || t('msg.login.invalidLogin'), 'error')
  } finally {
    loading.value = false
  }
}

// 회원가입
function openSignupNext() {
  openSignupAgreement.value = false
  openSignup.value = true
}

// Kakao OAuth
const AUTH = import.meta.env.VITE_KAKAO_AUTHORIZE
const CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI
function onKakaoLogin() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code'
  })
  window.location.href = `${AUTH}?${params.toString()}`
}
</script>

<style scoped>
.gradient-bg {
  height: 100svh;
  width: 100vw;
  min-height: 100vh;
  background:
      radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,0.18), transparent 60%),
      radial-gradient(800px 400px at 100% 100%, rgba(16,185,129,0.15), transparent 60%),
      linear-gradient(160deg, rgba(0,0,0,0.04), transparent 40%);
}

.login-card {
  backdrop-filter: saturate(135%) blur(8px);
  background-color: rgba(255,255,255,0.75);
}

:deep(.v-theme--dark) .login-card {
  background-color: rgba(18,18,18,0.65);
}

.brand-avatar {
  background: linear-gradient(135deg, rgba(99,102,241,.2), rgba(16,185,129,.2));
}
.brand-avatar svg circle {
  fill: rgba(255,255,255,0.6);
}

.build-chip {
  background: rgba(0,0,0,.06);
  font-weight: 600;
}

/* Kakao 버튼 */
.kakao-btn {
  background-color: #FEE500;
  color: #000;
  transition: transform .06s ease;
}
.kakao-btn:hover { transform: translateY(-1px); }
.kakao-logo {
  width: 320px;
  height: 40px;
  object-fit: contain;
  pointer-events: none;
}
</style>
