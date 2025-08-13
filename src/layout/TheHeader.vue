<template>
  <v-app-bar
      height="64"
      elevation="0"
      color="transparent"
      class="appbar px-4"
      border
  >
    <!-- Left: Brand -->
    <v-btn variant="text" class="brand text-subtitle-1 font-weight-medium" @click="goMain" :ripple="false">
      <v-avatar size="24" class="brand-avatar mr-2">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </v-avatar>
      MOONKI
    </v-btn>

    <!-- Center: Tabs -->
    <v-spacer/>
    <v-tabs
        v-model="currentTab"
        density="comfortable"
        bg-color="transparent"
        color="primary"
        slider-color="primary"
        class="header-tabs"
        @update:modelValue="onTabChange"
    >
      <v-tab v-for="item in menus" :key="item.value" :value="item.value" class="tab-item">
        {{ item.label }}
      </v-tab>
    </v-tabs>
    <v-spacer/>

    <!-- Right: Session countdown -->
    <CountdownLabel mode="idle" class="mr-2" :minutes="30" :warn-threshold-ms="2 * 60 * 1000" @expired="handleExpired" />

    <!-- Settings menu -->
    <v-menu location="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" :ripple="false" aria-label="Settings">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable" min-width="180">
        <v-list-subheader>계정</v-list-subheader>
        <v-list-item @click="goAccount" prepend-icon="mdi-account-circle-outline" title="내 정보"/>
        <v-divider/>
        <v-list-item @click="onLogout" prepend-icon="mdi-logout" :title="t('label.logout')"/>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import {ref, watchEffect} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import CountdownLabel from '@/components/common/CountdownLabel.vue'

const {t} = useI18n()
const router = useRouter()
const route = useRoute()

const menus = [
  {label: 'Home', value: 'home'},
  {label: 'Models', value: 'models'},
  {label: 'Services', value: 'services'},
  {label: 'Discover', value: 'discover'},
]
const tabRoutes = {
  home: 'Main',
  models: 'Models',
  services: 'Services',
  discover: 'Discover',
}
const currentTab = ref('home')

// 현재 라우트 → 탭값 동기화
watchEffect(() => {
  const match = Object.entries(tabRoutes).find(([_, name]) => name === route.name)
  currentTab.value = match ? match[0] : 'home'
})

function onTabChange(val) {
  const name = tabRoutes[val]
  if (name && name !== route.name) router.push({name})
}

function goMain() {
  router.push({name: 'Main'})
}

function goAccount() {
  router.push({name: 'Account'})
}

function onLogout() {
  localStorage.removeItem('jwtToken')
  router.push({name: 'Login'})
}

// 카운트다운 컴포넌트에서 만료 이벤트 수신
function handleExpired() {
  localStorage.removeItem('jwtToken')
  router.replace({name: 'Login', query: {reason: 'expired'}})
}
</script>

<style scoped>
.appbar {
  backdrop-filter: saturate(135%) blur(8px);
  background: radial-gradient(900px 500px at 10% 0%, rgba(99, 102, 241, 0.10), transparent 60%),
  radial-gradient(700px 400px at 100% 100%, rgba(16, 185, 129, 0.10), transparent 60%),
  rgba(255, 255, 255, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

:deep(.v-theme--dark) .appbar {
  background: radial-gradient(900px 500px at 10% 0%, rgba(99, 102, 241, 0.12), transparent 60%),
  radial-gradient(700px 400px at 100% 100%, rgba(16, 185, 129, 0.10), transparent 60%),
  rgba(18, 18, 18, 0.60);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Brand */
.brand {
  letter-spacing: 1px;
  color: inherit;
}

.brand-avatar {
  background: linear-gradient(135deg, rgba(99, 102, 241, .20), rgba(16, 185, 129, .20));
}

.brand-avatar svg circle {
  fill: rgba(255, 255, 255, 0.65);
}

/* Tabs */
.header-tabs {
  min-width: 480px;
}

.tab-item {
  font-weight: 600;
  text-transform: none;
  letter-spacing: .3px;
  color: rgba(0, 0, 0, .55);
}

:deep(.v-theme--dark) .tab-item {
  color: rgba(255, 255, 255, .65);
}
</style>
