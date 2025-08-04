<template>
  <div>
    <h2>사용자 정보</h2>
    <div v-if="user">
      <p>ID: {{ user.id }}</p>
      <p>이름: {{ user.username }}</p>
    </div>
    <div v-else>
      <p>사용자 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref(null)

onMounted(async () => {
  try {
    // Spring Boot API 호출 (/api/user/1)
    const res = await axios.get('/api/user/' + 1)
    user.value = res.data
  } catch (error) {
    alert('사용자 정보를 불러올 수 없습니다.')
  }
})
</script>
