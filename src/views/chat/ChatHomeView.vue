<template>
  <v-container class="pa-0 chat-home" style="max-width:860px;">
    <!-- 상단바 -->
    <v-app-bar flat color="transparent" class="px-2">
      <v-toolbar-title class="text-h6 font-weight-bold">채팅</v-toolbar-title>
      <v-spacer />
      <v-btn icon variant="text" :ripple="false" @click="toggleSearch = !toggleSearch">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon variant="text" :ripple="false" @click="goSettings">
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- 검색 -->
    <div v-show="toggleSearch" class="px-4 pb-2">
      <v-text-field v-model="q" density="comfortable" variant="solo" flat
                    hide-details clearable rounded placeholder="사용자/이메일 검색"
                    prepend-inner-icon="mdi-magnify"/>
    </div>

    <!-- 목록 -->
    <v-list lines="two" density="comfortable" class="px-2">
      <!-- 전체 사용자 -->
      <template v-if="tab === 'all'">
        <v-list-item v-for="u in filteredUsers" :key="u.id" class="rounded-lg mb-1"
                     @click="selectUser(u)" @dblclick="openWith(u.id)">
          <template #prepend>
            <v-avatar size="42">
              <v-img v-if="u?.profileImageId" :src="imgUrl(u.profileImageId)" cover
                     @error="() => (u.profileImageId = null)"/>
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-truncate">{{ u.nickname || u.username }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">{{ u.email }}</v-list-item-subtitle>
          <template #append>
            <div class="d-flex flex-column align-end">
              <small class="text-medium-emphasis"></small>
              <v-badge v-if="chat.unreadByUser?.[u.id] > 0" :content="chat.unreadByUser[u.id]" color="error" inline class="mt-1"/>
            </div>
          </template>
        </v-list-item>
      </template>

      <!-- 나의 채팅방 -->
      <template v-else-if="tab === 'my'">
        <v-list-item v-for="room in myRooms" :key="room.id" class="rounded-lg mb-1"
                     @click="openByRoom(room)" @dblclick="openByRoom(room)">
          <template #prepend>
            <v-avatar size="42">
              <v-img v-if="room.other?.profileImageId" :src="imgUrl(room.other.profileImageId)" cover
                     @error="() => (room.other.profileImageId = null)"/>
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-truncate">
            {{ room.other?.nickname || room.other?.username || '대화상대' }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ room.lastMessage?.content || '대화를 시작해 보세요' }}
          </v-list-item-subtitle>
          <template #append>
            <div class="d-flex flex-column align-end">
              <small class="text-medium-emphasis">{{ formatTime(room.lastMessage?.createdAt) }}</small>
              <v-badge v-if="room.unread > 0" :content="room.unread" color="error" inline class="mt-1"/>
            </div>
          </template>
        </v-list-item>
      </template>

      <!-- 설정 탭은 페이지 이동 -->
      <template v-else>
        <v-list-item class="rounded-lg" @click="goSettings">
          <template #prepend><v-icon>mdi-cog-outline</v-icon></template>
          <v-list-item-title>설정으로 이동</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>

    <!-- 하단 탭바 -->
    <v-bottom-navigation v-model="tab" mode="shift" grow elevation="8" class="chat-bottom-nav">
      <v-btn value="all"><v-icon>mdi-account-multiple-outline</v-icon>전체목록</v-btn>
      <v-btn value="my"><v-icon>mdi-chat-outline</v-icon>나의 채팅 방</v-btn>
      <v-btn value="settings"><v-icon>mdi-cog-outline</v-icon>설정</v-btn>
    </v-bottom-navigation>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {useChatStore} from '@/store/chat/chat.js'

const chat = useChatStore()
const router = useRouter()

const q = ref('')
const tab = ref('all')
const toggleSearch = ref(false)

const imgUrl = (id) => `${import.meta.env.VITE_API_URL}/auth/image/${id}`

const filteredUsers = computed(() => {
  const k = q.value.trim().toLowerCase()
  const list = chat.users || []
  if (!k) return list
  return list.filter(u =>
      ((u.nickname || u.username || '').toLowerCase().includes(k)) ||
      ((u.email || '').toLowerCase().includes(k))
  )
})

const meId = computed(() => chat.currentUser?.id ?? chat.currentRoom?.meId)
const myRooms = computed(() => chat.rooms || [])

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

function selectUser(u) {} // 단일 클릭 하이라이트 용(옵션)
function openWith(userId) { chat.openWindowWith(userId) } // **개별 창 오픈**
function openByRoom(room) {
  const otherId = room.other?.id ?? room.otherUserId
  if (otherId) openWith(otherId)
}

function goSettings() { router.push({name: 'Account'}) }

onMounted(async () => {
  if (!chat.users?.length) await chat.refreshUsers({limit: 100})
  await chat.refreshRooms() // 나의 채팅방 목록(백엔드 붙이면 서버 목록 사용)
})

// 검색 디바운스(선택)
let t = null
watch(q, (val) => {
  if (t) clearTimeout(t)
  t = setTimeout(() => chat.refreshUsers?.({q: val, limit: 100}), 250)
})
</script>

<style scoped>
.chat-home { padding-bottom: 72px; } /* bottom navigation 공간 확보 */
.chat-bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; }
</style>
