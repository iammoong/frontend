<template>
  <TheHeader />
    <v-main>
      <div>
        <h2>Main Page</h2>
        <v-btn color="primary" @click="checkMe">내 정보 확인</v-btn>
        <div v-if="meInfo">{{ meInfo }}</div>
     </div>
      <div>
        <h4>현재 토큰 (localStorage)</h4>
        <pre>{{ token }}</pre>
      </div>
    </v-main>
</template>

<script setup>
import TheHeader from '@/layout/TheHeader.vue'

import { ref } from 'vue'
import { useAxios } from '@/hooks/user/useAxios.js'

const { getMe } = useAxios()
const meInfo = ref('')
const token = ref(localStorage.getItem('jwtToken') || '')


async function checkMe() {
  try {
    const { data } = await getMe()
    meInfo.value = JSON.stringify(data)
    token.value = localStorage.getItem('jwtToken') || ''
  } catch (e) {
    meInfo.value = '인증 필요(401) 또는 에러'
    token.value = localStorage.getItem('jwtToken') || ''
  }
}
</script>