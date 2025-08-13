<!-- src/layout/AppLayout.vue -->
<template>
  <v-app>
    <TheHeader />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import TheHeader from '@/layout/TheHeader.vue'
import { useIdleLogout } from '@/hooks/session/useIdleLogout.js'
const { start } = useIdleLogout(30) // 30분
start()
</script>
