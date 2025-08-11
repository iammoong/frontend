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
</script>
