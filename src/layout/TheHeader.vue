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
    <CountdownLabel mode="idle" class="mr-2" :minutes="30" :warn-threshold-ms="2 * 60 * 1000" @expired="handleExpired"/>

    <div class="d-flex align-center ml-3 mr-3 user-badge" @click="goAccount" style="cursor: pointer;">
      <v-avatar size="28" class="mr-2" :color="!profileSrc ? 'grey-lighten-2' : undefined">
        <v-img v-if="profileSrc" :src="profileSrc" alt="프로필 이미지" cover/>
        <v-icon v-else>mdi-account-circle</v-icon>
      </v-avatar>
      <span class="text-body-2 font-weight-medium">{{ displayName }}님</span>
    </div>

    <!-- Chat Button -->
    <v-badge
        class="mr-1"
        :model-value="chat.unreadCount > 0"
        :content="chat.unreadCount > 99 ? '99+' : chat.unreadCount"
        color="error"
        bordered
    >
      <v-btn
          icon
          variant="text"
          :ripple="false"
          aria-label="채팅 열기"
          aria-haspopup="dialog"
          @click="openChat"
      >
        <v-icon>mdi-chat-outline</v-icon>
      </v-btn>
    </v-badge>

    <!-- Settings menu -->
    <v-menu location="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" :ripple="false" aria-label="Settings">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </template>
      <v-list density="comfortable" min-width="180">
        <v-list-subheader>계정</v-list-subheader>
        <v-list-item @click="goAccount" prepend-icon="mdi-account-circle-outline" :title="t('edit.myAccount')"/>
        <v-divider/>
        <v-list-item @click="onLogout" prepend-icon="mdi-logout" :title="t('label.logout')"/>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import {ref, watchEffect, onMounted, computed, onBeforeUnmount} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'

import {getMe} from '@/api/user/me.js'
import CountdownLabel from '@/components/common/CountdownLabel.vue'
import {useChatStore} from '@/store/chat/chat.js'

const chat = useChatStore()

function openChat() {
  if (!chat.connected) chat.connect()
  chat.openModal()
}

const {t} = useI18n()
const router = useRouter()
const route = useRoute()
const me = ref(null)

async function fetchMe() {
  try {
    const {data} = await getMe()
    me.value = data
  } catch (e) {
    // 비로그인/만료 등은 무시
  }
}

const displayName = computed(() =>
    me.value?.nickname || me.value?.username || me.value?.userId || ''
)

const profileSrc = computed(() => {
  const url = me.value?.profileImageUrl
  if (!url) return ''
  const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || ''
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
})

function handleProfileUpdated(e) {
  // AccountView에서 보낸 detail(갱신된 사용자 DTO)이 있으면 즉시 반영
  if (e?.detail) me.value = e.detail
  else fetchMe()
}

onMounted(() => {
  fetchMe()
  window.addEventListener('profile:updated', handleProfileUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('profile:updated', handleProfileUpdated)
})

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
  try {
    chat.closeModal()
    chat.reset()
    if (chat.disconnect) chat.disconnect() // 스토어에 disconnect 구현되어 있으면 호출
  } catch {
  }
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
