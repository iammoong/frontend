<!-- src/views/KakaoCallback.vue -->
<template>
  <div>카카오 로그인 처리 중...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { kakaoLogin } from '@/api/kakao/kakao.js'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const code = route.query.code
  if (!code) return router.replace({ name: 'Login' })
  try {
    const { data } = await kakaoLogin(code)
    localStorage.setItem('jwtToken', data.token)// 주신 Provider가 만든 JWT
    await router.replace({name: 'Main'})
  } catch (e) {
    console.error('로그인 실패', e)

    await router.replace({name: 'Login'})
  }
})
</script>
