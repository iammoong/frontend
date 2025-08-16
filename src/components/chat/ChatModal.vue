<template>
  <v-dialog
      v-model="chat.isOpen"
      :max-width="980"
      transition="dialog-bottom-transition"
      persistent
  >
    <v-card class="chat-card" elevation="12">
      <!-- 헤더 -->
      <v-card-title class="chat-header">
        <div class="d-flex align-center">
          <v-avatar size="28" class="mr-2" style="background:#e9f0ff;color:#3b82f6;">
            <v-icon>mdi-chat-outline</v-icon>
          </v-avatar>
          <span class="text-subtitle-1 font-weight-bold">{{ t('chat.title') }}</span>
        </div>
        <v-btn icon variant="text" @click="chat.closeModal()" :ripple="false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- 본문 -->
      <v-card-text class="pa-0">
        <div class="layout">
          <!-- 좌측: 사용자 목록 -->
          <aside class="sidebar">
            <div class="sidebar-top">
              <v-text-field
                  v-model="q"
                  density="compact"
                  variant="solo"
                  flat
                  hide-details
                  clearable
                  rounded
                  :placeholder="t('chat.searchUser')"
                  prepend-inner-icon="mdi-magnify"
              />
            </div>

            <v-list lines="two" density="comfortable" nav>
              <v-slide-y-transition group>
                <v-list-item
                    v-for="u in filtered"
                    :key="u.id"
                    @click="open(u.id)"
                    :active="u.id === chat.currentRoom?.otherUserId"
                    color="primary"
                    rounded="lg"
                    class="user-item"
                >
                  <template #prepend>
                    <v-avatar size="40">
                      <v-img v-if="u?.profileImageId"
                             :src="imgUrl(u.profileImageId)" cover
                             @error="() => (u.profileImageId = null)" />
                      <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-truncate">
                    {{ u.nickname || u.username }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="email text-truncate">
                    {{ u.email }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-badge
                        v-if="chat.unreadByUser?.[u.id] > 0"
                        :content="chat.unreadByUser[u.id]"
                        color="error"
                        inline
                    />
                  </template>
                </v-list-item>
              </v-slide-y-transition>
            </v-list>
          </aside>

          <!-- 우측: 채팅 -->
          <section class="panel">
            <div class="panel-header">
              <template v-if="chat.currentRoom">
                <div class="d-flex align-center">
                  <v-avatar size="28" class="mr-2" style="background:#eef2ff;">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <strong class="text-subtitle-2">{{ targetUserName }}</strong>
                </div>
              </template>
              <template v-else>
                <span class="text-medium-emphasis">{{ t('chat.chooseUser') }}</span>
              </template>
            </div>

            <div ref="scrollArea" class="messages">
              <template v-if="roomId && chat.messages[roomId]?.length">
                <v-slide-y-transition group>
                  <div
                      v-for="m in chat.messages[roomId]"
                      :key="m.id"
                      :class="['msg-row', isMine(m) ? 'me' : 'other']"
                  >
                    <div class="bubble">
                      <div class="sender" v-if="m.senderId !== chat.currentRoom.meId">
                        {{ m.senderNickname }}
                      </div>
                      <div class="content">{{ m.content }}</div>
                      <div class="time">{{ formatTime(m.createdAt) }}</div>
                    </div>
                  </div>
                </v-slide-y-transition>
              </template>
              <div v-else class="empty">{{ t('chat.startChat') }}</div>
            </div>

            <div class="composer">
              <v-textarea
                  v-model="draft"
                  auto-grow
                  rows="1"
                  max-rows="5"
                  density="comfortable"
                  variant="solo"
                  flat
                  rounded
                  hide-details
                  :placeholder="t('chat.enterMessage')"
                  @compositionstart="isComposing = true"
                  @compositionend="onCompositionEnd"
                  @keydown.enter.exact.prevent="onEnter"
              >
                <template #append-inner>
                  <v-btn icon size="small" @click="doSend" :disabled="!draft.trim()">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-textarea>
            </div>
          </section>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useChatStore } from '@/store/chat/chat.js'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const chat = useChatStore()
const q = ref('')
const draft = ref('')
const scrollArea = ref(null)

const imgUrl = (id) => `${import.meta.env.VITE_API_URL}/auth/image/${id}`

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  if (!k) return chat.users
  return chat.users.filter(u =>
      ((u.nickname || u.username || '').toLowerCase().includes(k)) ||
      ((u.email || '').toLowerCase().includes(k))
  )
})

const roomId = computed(() => chat.currentRoom?.id)
const targetUserName = computed(() => {
  if (!chat.currentRoom) return ''
  const target = chat.users.find(u => u.id === chat.currentRoom.otherUserId)
  return target?.nickname || target?.username || ''
})

function open(userId) {
  chat.openRoomWith(userId).then(() => nextTick(scrollToBottom))
}
function doSend() {
  const msg = draft.value.trim()
  if (!msg) return
  chat.sendMessage(msg)
  draft.value = ''
  nextTick(scrollToBottom)
}

function scrollToBottom() {
  const el = scrollArea.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString()
}

function isMine(m) {
  // 백엔드가 sender_id로 줄 수도 있어 보정
  const sender = m.senderId ?? m.sender_id
  const myId = chat.currentUser?.id ?? chat.currentRoom?.meId
  return Number(sender) === Number(myId)
}

const isComposing = ref(false)
let sendLock = false  // 아주 짧은 시간 중복 방지(디바운스 겸용)

function onCompositionEnd() {
  isComposing.value = false
}

function onEnter(e) {
  // 한글 조합 중이면 전송 금지
  if (isComposing.value || e.isComposing) return
  // 아주 짧은 시간 중복 호출 방지
  if (sendLock) return
  sendLock = true
  doSend()
  setTimeout(() => (sendLock = false), 120) // 100~150ms 권장
}

const targetUser = computed(() =>
    chat.users.find(u => u.id === chat.currentRoom?.otherUserId)
)

let l = null
watch(q, (val) => {
  if (l) clearTimeout(l)
  l = setTimeout(() => chat.refreshUsers({ q: val, limit: 50 }), 300)
})

watch(() => chat.messages[roomId.value]?.length, () => nextTick(scrollToBottom))
</script>

<style scoped>
/* 전체 레이아웃 */
.chat-card { border-radius: 16px; overflow: hidden; }
.chat-header {
  display:flex; align-items:center; justify-content:space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e6e8eb;
  background: #ffffff;
}
.layout { display:flex; height: 600px; }

/* 사이드바 */
.sidebar {
  width: 300px;
  padding: 14px;
  border-right: 1px solid #edf1f5;
  background: #fafbfc;
  overflow-y: auto;
}
.sidebar-top { position: sticky; top: 0; z-index: 1; margin-bottom: 10px; }

/* 사용자 아이템 */
.user-item { transition: background .18s ease, transform .06s ease; }
.user-item:hover { background: #f2f5f8; }
.user-item.v-list-item--active { background: #e9f0ff !important; }
.email { color: #6b7280; }

/* 채팅 패널 */
.panel { flex:1; display:flex; flex-direction:column; }
.panel-header {
  display:flex; align-items:center; justify-content:space-between;
  padding: 12px 16px; min-height: 56px;
  border-bottom: 1px solid #edf1f5;
  background:#ffffff;
}

/* 메시지 영역 */
.messages {
  flex:1; overflow-y:auto; padding: 14px 16px;
  background:
      radial-gradient(900px 500px at 100% -20%, rgba(59,130,246,.06), transparent 60%),
      radial-gradient(800px 500px at -20% 100%, rgba(99,102,241,.04), transparent 60%),
      #ffffff;
}
.empty { color:#6b7280; padding:12px; }

.msg-row { display:flex; width: 100%;  margin: 8px 0; }
.me { justify-content:flex-end; }
.other { justify-content:flex-start; }

/* 말풍선 */
.bubble {
  max-width: 72%;
  padding: 10px 12px 8px;
  border-radius: 14px;
  background: #f4f6fa;            /* 받은 쪽 */
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.me .bubble { background: #e8f1ff; } /* 보낸 쪽 */
.sender { font-size:12px; color:#6b7280; margin-bottom:2px; }
.content { white-space:pre-wrap; word-break:break-word; line-height:1.38; }
.time { font-size:11px; color:#8b93a1; margin-top:4px; text-align:right; }

/* 입력창 */
.composer {
  padding: 12px 16px;
  border-top: 1px solid #edf1f5;
  background:#ffffff;
}

/* 스크롤바 */
.sidebar::-webkit-scrollbar,
.messages::-webkit-scrollbar { width: 8px; }
.sidebar::-webkit-scrollbar-thumb,
.messages::-webkit-scrollbar-thumb { background:#d7dbe1; border-radius:8px; }

/* 모바일: 사이드바 숨김 */
@media (max-width: 640px) {
  .sidebar { display:none; }
  .layout { height: 80vh; }
}
</style>
