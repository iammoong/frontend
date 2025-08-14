<!-- src/layout/AppLayout.vue -->
<template>
  <v-app>
    <TheHeader />
    <v-main>
      <router-view />
    </v-main>
    <TheFooter/>
  </v-app>
</template>

<script setup>
import TheHeader from '@/layout/TheHeader.vue'
import { useIdleLogout } from '@/hooks/session/useIdleLogout.js'
import TheFooter from '@/layout/TheFooter.vue'

const { start } = useIdleLogout(30) // 30분
start()
</script>
