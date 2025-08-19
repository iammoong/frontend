<template>
  <v-app>
    <TheHeader />
    <v-main>
      <router-view />
    </v-main>

    <TheFooter/>
    <!-- 채팅 목록 모달 -->
<!--    <ChatHomeModal-->
<!--        v-model="chat.isHomeOpen"-->
<!--        @open-with="(userId) => chat.openWindowWith(userId)"-->
<!--    />-->

    <!-- 채팅 홈 모달 -->
    <ChatHomeView
        v-model="chat.isHomeOpen"
        @open-with="(userId) => chat.openWindowWith(userId)"
    />

    <!-- 개별 대화창들 -->
    <ChatWindow
        v-for="(w, i) in chat.windows"
        :key="w.roomId"
        v-model="w.open"
        :room-id="w.roomId"
        :other-user-id="w.otherUserId"
        :offset="i"
        @close="chat.closeWindow(w.roomId)"
    />
  </v-app>
</template>

<script setup>
import TheHeader from '@/layout/TheHeader.vue'
import { useIdleLogout } from '@/hooks/session/useIdleLogout.js'
import TheFooter from '@/layout/TheFooter.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ChatHomeModal from '@/components/chat/ChatHomeModal.vue'
import ChatHomeView from '@/views/chat/ChatHomeView.vue'
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
