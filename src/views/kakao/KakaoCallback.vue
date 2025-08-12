<template>
  <v-container class="fill-height pa-0 gradient-bg">
    <v-row class="ma-0" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="d-flex justify-center">
        <v-card
            class="py-6 px-6 rounded-xl login-card"
            elevation="12"
            :aria-busy="isLoading"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-avatar size="40" class="kakao-avatar">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M7 14c2 1.8 8 1.8 10 0 .2-.2.6 0 .6.3v2.2c0 .2-.1.5-.3.6-2 .9-8.6 1.1-11-.2-.2-.1-.3-.3-.3-.6v-2c0-.4.5-.5.8-.3Z" fill="#000" opacity=".2"/>
                </svg>
              </v-avatar>
              <div class="ms-3">
                <div class="text-subtitle-1 fw-600">{{ t('kakao.login.loading') }}</div>
                <div class="text-caption opacity-70">{{ t('kakao.login.confirm') }}</div>
              </div>
            </div>

            <v-chip size="small" variant="flat" class="brand-chip">
              Secure Redirect
            </v-chip>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- 로딩 상태 -->
          <v-fade-transition>
            <div v-if="isLoading" class="text-center" role="status" aria-live="polite">
              <v-progress-circular
                  :model-value="progress"
                  indeterminate
                  size="56"
                  width="5"
                  class="mb-4"
              />
              <div class="text-body-2 mb-1">
                카카오 로그인 처리 중<span class="dots" aria-hidden="true">...</span>
              </div>
              <div class="text-caption opacity-70">
                창을 닫지 마세요. 자동으로 이동합니다.
              </div>

              <v-expand-transition>
                <div v-if="showManual" class="mt-4">
                  <v-btn variant="outlined" @click="goLogin" class="me-2">다시 로그인</v-btn>
                  <v-btn color="primary" @click="goMain">메인으로 이동</v-btn>
                </div>
              </v-expand-transition>
            </div>
          </v-fade-transition>

          <!-- 에러 상태 -->
          <v-fade-transition>
            <div v-if="error" class="mt-2">
              <v-alert type="error" variant="tonal" border="start" class="mb-3">
                로그인에 실패했어요. 다시 시도해 주세요.
                <div class="text-caption mt-1 opacity-80">
                  원인: {{ errorMessage }}
                </div>
              </v-alert>
              <div class="d-flex ga-2">
                <v-btn color="primary" @click="goLogin" prepend-icon="mdi-login-variant">
                  다시 로그인
                </v-btn>
                <v-btn variant="outlined" @click="report" prepend-icon="mdi-lifebuoy">
                  문의하기
                </v-btn>
              </div>
            </div>
          </v-fade-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { kakaoLogin } from '@/api/kakao/kakao.js'
import {useI18n} from 'vue-i18n'
const {t} = useI18n()

const router = useRouter()
const route = useRoute()

const isLoading = ref(true)
const progress = ref(0)         // 필요시 determinate로 전환 가능
const showManual = ref(false)   // 오래 걸릴 때 수동 버튼 노출
const error = ref(false)
const errorMessage = ref('알 수 없는 오류')

let tick = null
let manualTimer = null
let unmounted = false

const goLogin = () => router.replace({ name: 'Login' })
const goMain  = () => router.replace({ name: 'Main' })

const report = () => {
  // 프로젝트에 맞게 교체하세요
  window.location.href = 'mailto:support@yourapp.com?subject=[Kakao] 로그인 오류 문의'
}

onMounted(async () => {
  // 쿼리 값이 배열로 올 수도 있어 안전 처리
  const rawCode = route.query.code
  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode

  if (!code) return goLogin()

  // 프로그레스 UX (지연 시 사용자 불안감 완화)
  tick = setInterval(() => {
    // indeterminate 사용 중이라 시각적 의미만 줌
    progress.value = (progress.value + Math.random() * 8) % 90
  }, 300)

  // 4초 지나면 수동 이동 버튼 제공
  manualTimer = setTimeout(() => (showManual.value = true), 4000)

  try {
    const { data } = await kakaoLogin(code)
    if (unmounted) return

    // 보안상 localStorage에 토큰 저장이 필요한 경우만 사용
    localStorage.setItem('jwtToken', data.token)
    isLoading.value = false
    await goMain()
  } catch (e) {
    if (unmounted) return
    console.error('로그인 실패', e)
    isLoading.value = false
    error.value = true
    errorMessage.value = e?.response?.data?.message || e?.message || '네트워크 오류'
  } finally {
    clearInterval(tick)
    tick = null
  }
})

onUnmounted(() => {
  unmounted = true
  if (tick) clearInterval(tick)
  if (manualTimer) clearTimeout(manualTimer)
})
</script>

<style scoped>
/* 부드러운 그라데이션 배경 (다크/라이트 모두 어울리는 톤) */
.gradient-bg {
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 20% 0%,
  rgba(255, 234, 0, 0.18),
  transparent 60%),
  linear-gradient(160deg, rgba(0,0,0,0.03), transparent 40%);
}

/* 카드 너비 최적화 & 유리패널 느낌 */
.login-card {
  backdrop-filter: saturate(135%) blur(6px);
}

/* Kakao 브랜드 느낌의 아바타 */
.kakao-avatar {
  background-color: #FEE500;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
}
.kakao-avatar svg circle {
  fill: #FEE500;
}

/* 브랜딩 칩 */
.brand-chip {
  background: rgba(0,0,0,.05);
  font-weight: 600;
}

/* 로딩 점 애니메이션 */
.dots::after {
  content: '…';
  animation: ellipsis steps(4,end) 1.2s infinite;
}
@keyframes ellipsis {
  0%   { content: ''; }
  25%  { content: '.'; }
  50%  { content: '..'; }
  75%  { content: '...'; }
  100% { content: ''; }
}

/* 접근성: 포커스 링 강화 */
:focus-visible {
  outline: 2px solid #3f51b5;
  outline-offset: 2px;
}
</style>
