<template>
  <v-app-bar
      flat
      color="primary"
      class="px-6"
      height="72"
      style="backdrop-filter: blur(6px);"
  >
    <!-- Left: Logo/Text -->
    <v-btn
        class="text-h6 font-weight-bold"
        variant="text"
        style="color:white; letter-spacing:2px;"
        @click="goMain"
    >
      MOONKI
    </v-btn>

    <!-- Center: Tabs -->
    <v-spacer />
    <v-tabs
        v-model="tab"
        color="white"
        background-color="transparent"
        align-tabs="center"
        slider-color="white"
        class="header-tabs"
    >
      <v-tab v-for="item in menus" :key="item.value" :value="item.value" class="tab-item">
        {{ item.label }}
      </v-tab>
    </v-tabs>
    <v-spacer />

    <!-- Right: Logout -->
    <v-btn
        color="grey-lighten-2"
        variant="tonal"
        class="ml-6"
        @click="logout"
    >
      {{ t('label.logout') }}
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const router = useRouter()
const tab = ref('home')
const menus = [
  { label: 'Home', value: 'home' },
  { label: 'Models', value: 'models' },
  { label: 'Services', value: 'services' },
  { label: 'Discover', value: 'discover' }
]

function goMain() {
  router.push({ name: 'Main' }) // or path: '/main'
}

function logout() {
  localStorage.removeItem('jwtToken')
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.header-tabs {
  min-width: 500px;
}

.tab-item {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ccc;
  transition: color 0.2s;
}
.v-tab--selected {
  color: #fff !important;
}
</style>
