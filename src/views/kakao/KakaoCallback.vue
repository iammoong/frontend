<!-- KakaoCallback.vue -->
<template>
  <v-container>
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-container>
</template>

<script setup>
import { kakaoLogin } from '@/api/auth/auth.js'
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const code = route.query.code
  alert(code)
  if (code) {
    try {
      const res = await kakaoLogin(code)
      // JWT 토큰 저장 및 메인 페이지 이동
      localStorage.setItem('jwtToken', res.data.token)
      await router.replace({ name: 'Main' })
    } catch (e) {
      console.log('카카오 로그인 실패')
      await router.replace({ name: 'Login' })
    }
  } else {
    console.log('카카오 인증 코드 없음')
    await router.replace({ name: 'Login' })
  }
})

</script>
