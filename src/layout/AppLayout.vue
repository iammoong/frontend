<template>
  <v-app>
    <TheHeader />
    <v-main>
      <router-view />
    </v-main>
    <ChatModal
        :model-value="chat.isOpen"
        @update:model-value="(v) => v ? chat.openModal() : chat.closeModal()"
    />
    <TheFooter/>
  </v-app>
</template>

<script setup>
import TheHeader from '@/layout/TheHeader.vue'
import { useIdleLogout } from '@/hooks/session/useIdleLogout.js'
import TheFooter from '@/layout/TheFooter.vue'
import ChatModal from '@/components/chat/ChatModal.vue'
import { useChatStore } from '@/store/chat/chat.js'

import { onMounted, onBeforeUnmount } from 'vue'

const { start } = useIdleLogout(30) // 30분
start()

const chat = useChatStore()
// 연결을 레이아웃에서 1회만 수행 (중복 연결 방지)
onMounted(() => {
  if (localStorage.getItem('jwtToken')) {
    chat.connect()
  }
})
onBeforeUnmount(() => {
  chat.disconnect?.()
})
</script>
