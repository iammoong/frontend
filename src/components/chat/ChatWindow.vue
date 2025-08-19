<template>
  <v-dialog
      v-model="open"
      :max-width="420"
      transition="dialog-bottom-transition"
      persistent
      :scrim="false"
      :retain-focus="false"
      :content-style="contentStyle"
  >
    <v-card class="chat-card" elevation="12">
      <!-- 헤더 -->
      <v-card-title class="chat-header">
        <div class="d-flex align-center">
          <v-avatar size="28" class="mr-2" style="background:#eef2ff;">
            <v-img v-if="targetUser?.profileImageId"
                   :src="imgUrl(targetUser.profileImageId)"
                   :alt="(targetUser?.nickname || targetUser?.username) + ' avatar'"
                   cover
                   @error="onAvatarError"/>
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          <strong class="text-subtitle-2">{{ title }}</strong>
        </div>
        <v-btn icon variant="text" :ripple="false" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- 메시지 영역 -->
      <v-card-text class="pa-0">
        <div ref="scrollArea" class="messages">
          <template v-if="msgs?.length">
            <v-slide-y-transition group>
              <!-- 직계 자식이 곧 v-for 항목이어야 함 -->
              <div
                  v-for="m in msgs"
                  :key="m.id ?? m.tempId"
                  class="message-row d-flex my-2"
                  :class="isMine(m) ? 'justify-end mine' : 'justify-start theirs'"
              >
                <v-avatar v-if="!isMine(m)" size="24" class="mr-2 mt-1">
                  <img :src="otherUser?.profileImageUrl || otherUser?.avatarUrl" alt="avatar">
                </v-avatar>

                <div class="message-wrap" :class="isMine(m) ? 'mine' : 'theirs'">
                  <div class="bubble">{{ m.content ?? m.text }}</div>
                  <div class="meta text-caption">
                    {{ formatTime(m.createdAt ?? m.created_at) }}
                  </div>
                </div>
              </div>
            </v-slide-y-transition>
          </template>
          <div v-else class="empty">대화를 시작해 보세요</div>
        </div>

        <!-- 작성창 -->
        <div class="composer">
          <v-textarea
              v-model="draft"
              auto-grow rows="1" max-rows="5"
              density="comfortable" variant="solo" flat rounded hide-details
              placeholder="메시지를 입력하세요"
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
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {useChatStore} from '@/store/chat/chat.js'
import {getUserById} from '@/api/user/me.js'

const props = defineProps({
  modelValue: {type: Boolean, default: true},
  roomId: {type: Number, required: true},
  otherUserId: {type: Number, required: true},
  offset: {type: Number, default: 0},  // 창 오프셋(우측 하단으로 계단식)
})
const emit = defineEmits(['update:modelValue', 'close'])

const chat = useChatStore()
const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const imgUrl = (id) => `${import.meta.env.VITE_API_URL}/auth/image/${id}`

const meId = computed(() => chat.currentUser?.id ?? chat.currentRoom?.meId)
const targetUser = ref(null)

const title = computed(() => targetUser.value?.nickname || targetUser.value?.username || '대화상대')
const scrollArea = ref(null)
const draft = ref('')
const isComposing = ref(false)
let sendLock = false

const msgs = computed(() => chat.messages[props.roomId] || [])
const contentStyle = computed(() => ({
  position: 'fixed',
  right: `${12 + props.offset * 24}px`,
  bottom: `${12 + props.offset * 18}px`,
  width: '920px',
  height: '680px'
}))

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

function isMine(m) {
  const sender = Number(m.senderId ?? m.sender_id)
  return sender === meId.value
}

function onCompositionEnd() {
  isComposing.value = false
}

function onEnter(e) {
  if (isComposing.value || e.isComposing) return
  if (sendLock) return
  sendLock = true;
  doSend()
  setTimeout(() => (sendLock = false), 120)
}

function doSend() {
  const msg = draft.value.trim()
  if (!msg) return
  chat.sendMessageTo(props.roomId, msg)
  draft.value = ''
  nextTick(scrollToBottom)
}

function scrollToBottom() {
  const el = scrollArea.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function onAvatarError() {
  if (targetUser.value) targetUser.value.profileImageId = null
}

function handleClose() {
  emit('update:modelValue', false)
  emit('close', props.roomId)
}

onMounted(async () => {
  // 타겟 사용자 보강(목록에 없을 수 있으므로 단건 조회)
  targetUser.value = chat.users.find(u => u.id === props.otherUserId) || null
  if (!targetUser.value) {
    try {
      const {data: u} = await getUserById(props.otherUserId)
      targetUser.value = {
        id: u.id, nickname: u.nickname, username: u.username,
        email: u.email, profileImageId: u.profileImage ? u.profileImage.id : null
      }
    } catch {
    }
  }

  // 방 구독/읽음 처리
  chat.subscribeRoom(props.roomId)
  await chat.markRoomRead?.(props.roomId)   // 아래 store 추가 함수 사용
  chat.resetUnreadForUser?.(props.otherUserId)

  nextTick(scrollToBottom)
})
watch(() => msgs.value.length, () => nextTick(scrollToBottom))
</script>

<style scoped>
.chat-card {
  border-radius: 16px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e6e8eb;
  background: #fff;
}

.messages {
  height: 380px;
  overflow-y: auto;
  padding: 14px 16px;
  background: #fff;
}

.empty {
  color: #6b7280;
  padding: 12px;
}

.msg-row {
  display: flex;
  width: 100%;
  margin: 8px 0;
}

.me {
  justify-content: flex-end;
}

.other {
  justify-content: flex-start;
}

.bubble {
  max-width: 78%;
  padding: 10px 12px 8px;
  border-radius: 14px;
  background: #f4f6fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
}

.me .bubble {
  background: #e8f1ff;
}

.sender {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.38;
}

.time {
  font-size: 11px;
  color: #8b93a1;
  margin-top: 4px;
  text-align: right;
}

.composer {
  padding: 12px 16px;
  border-top: 1px solid #edf1f5;
  background: #ffffff;
}

.messages {
  display: flex;
  flex-direction: column;
}

.message-row {
  max-width: calc(100% - 72px);
}

.message-wrap {
  max-width: 72%;
  display: flex;
  flex-direction: column;
}

.message-wrap.mine {
  align-items: flex-end; /* 우측 정렬 */
}

.message-wrap.theirs {
  align-items: flex-start; /* 좌측 정렬 */
}

.message-wrap .bubble{
  display: inline-block;
  max-width: 100%;           /* 한 줄 최대폭 (상황 따라 65~80% 조정) */
  padding: 8px 12px;
  border-radius: 14px;
  line-height: 1.45;
  white-space: pre-wrap;    /* 개행/공백 유지 */
  word-break: keep-all;     /* 한글은 단어 단위로만 줄바꿈 */
  overflow-wrap: anywhere;  /* 긴 영어/URL만 강제 줄바꿈 허용 */
}


/* 내 버블: 오른쪽, 파란 톤 */
.message-row.mine .bubble {
  background: #e9f4ff; /* 기호에 맞게 조정 가능 */
  border-top-right-radius: 6px;
  margin-left: auto; /* 항상 오른쪽으로 밀기 */
  text-align: left;
}

/* 상대 버블: 왼쪽, 회색 톤 */
.message-row.theirs .bubble {
  background: #f3f4f6;
  border-top-left-radius: 6px;
  margin-right: auto; /* 항상 왼쪽으로 밀기 */
  text-align: left;
}

.meta {
  opacity: .6;
  margin-top: 4px;
}

.message-row.mine .meta {
  align-self: flex-end; /* 시간도 오른쪽 */
}

.message-row.theirs .meta {
  align-self: flex-start; /* 시간은 왼쪽 */
}
</style>
