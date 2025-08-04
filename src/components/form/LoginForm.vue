<template>
  <v-container class="d-flex align-center justify-center" style="height:100vh">
    <v-card width="360" elevation="6" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold mb-2">{{ t('label.loginForm.login') }}</v-card-title>
      <v-form @submit.prevent="onLogin">
        <v-text-field
            v-model="userId"
            :label="t('label.loginForm.userId')"
            required
            @input="onUserIdInput"
        />
        <v-text-field
            v-model="password"
            :label="t('label.loginForm.password')"
            type="password"
            required
        />
        <!-- CapsLock 안내문구 (비밀번호 입력란 아래) -->
        <div v-if="isCapsLock" class="text-caption" style="color:#e53935; margin-top:-10px; margin-bottom:10px;">
          {{ t('label.loginForm.capslock') }}
        </div>
        <v-btn type="submit" block color="primary" size="large" class="mt-2 mb-1">
          {{ t('label.loginForm.login') }}
        </v-btn>
        <v-btn class="mt-3" variant="text" @click="openSignupAgreement = true">
          {{ t('label.loginForm.signup') }}
        </v-btn>
      </v-form>
      <SignupAgreementModal :open="openSignupAgreement" @next="openSignupNext" @close="openSignupAgreement = false"/>
      <SignupModal :open="openSignup" @close="openSignup = false" />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SignupModal from '../modal/SignupModal.vue'
import SignupAgreementModal from '../modal/SignupAgreementModal.vue'
import { useAlertStore } from '@/store/alert.js'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/hooks/user/useAxios.js'
import { useRouter } from 'vue-router'

// i18n 및 알림 스토어
const { t } = useI18n()
const alertStore = useAlertStore()
const router = useRouter()

const userId = ref('')
const password = ref('')
const isCapsLock = ref(false)
const openSignupAgreement = ref(false)
const openSignup = ref(false)
const { login } = useAxios()

// 페이지 전체 CapsLock 감지
function handleCapsLock(e) {
  if (e.getModifierState) {
    isCapsLock.value = e.getModifierState('CapsLock')
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleCapsLock)
  window.addEventListener('keyup', handleCapsLock)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleCapsLock)
  window.removeEventListener('keyup', handleCapsLock)
})

// 한글 입력 시 영문 QWERTY로 자동 변환
function convertHangulToQwerty(str) {
  // 한글 → 영문 QWERTY 변환 맵
  const kor = "ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡ";
  const eng = "qwertyuiopasdfghjklzxcvbnm";
  const map = {};
  for (let i = 0; i < kor.length; i++) map[kor[i]] = eng[i];

  return str.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, char => {
    // 완성형 한글 → 자모 분해
    const uni = char.charCodeAt(0);
    // 자음/모음 처리
    if (uni >= 0x3131 && uni <= 0x3163) {
      // 자음·모음 (단일 자모)
      return map[char] || '';
    }
    // 완성형 한글
    if (uni >= 0xAC00 && uni <= 0xD7A3) {
      const initial = Math.floor((uni - 0xAC00) / 588);
      const vowel = Math.floor(((uni - 0xAC00) % 588) / 28);
      const final = (uni - 0xAC00) % 28;

      let result = '';
      // 초성 변환
      const initialKor = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
      result += map[initialKor[initial]] || '';
      // 중성 변환
      const vowelKor = [
        'ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'
      ];
      result += map[vowelKor[vowel]] || '';
      // 종성 변환
      const finalKor = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
      result += map[finalKor[final]] || '';
      return result;
    }
    return char;
  });
}

function onUserIdInput(e) {
  // 입력값을 QWERTY로 변환 (한글 → 영문 소문자)
  const raw = e.target.value;
  const converted = convertHangulToQwerty(raw).replace(/[^a-z0-9]/g, '').toLowerCase();
  userId.value = converted;
}

async function onLogin() {
  if (!userId.value || !password.value) {
    alertStore.show(t('msg.login.emptyLogin'))
    return
  }
  try {
    const response = await login(userId.value, password.value)
    const data = response.data
    // alertStore.show(`${data.username}님 환영합니다!`)
    await router.push({name: 'Main'})
    // 필요시 로그인 성공 후 라우팅 등 처리
  } catch (e) {
    alertStore.show(t('msg.login.invalidLogin'))
    console.log(e)
  }
}

function openSignupNext() {
  openSignupAgreement.value = false
  openSignup.value = true
}
</script>
