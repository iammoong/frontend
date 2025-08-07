<template>
  <div
      v-if="alertStore.open"
      class="alert-toast"
      :class="alertStore.type === 'error' ? 'error' : 'success'"
  >
    <span>{{ alertStore.message }}</span>
    <button class="close-btn" @click="alertStore.close">&times;</button>
  </div>
</template>

<script setup>
import {useAlertStore} from "@/store/alert.js"
const alertStore = useAlertStore()
</script>

<style scoped>
.alert-toast {
  /* 공통 스타일 */
  position: fixed;
  right: 30px;
  bottom: 30px;
  min-width: 230px;
  max-width: 340px;
  padding: 14px 20px 14px 16px;
  color: #fff;
  font-size: 1rem;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.17);
  display: flex;
  align-items: center;
  z-index: 9999;
  animation: slideInUp 0.4s cubic-bezier(.31,1.06,.76,1.09);
  background: #333; /* 기본값 */
}
.alert-toast.success {
  background: #249c4d;  /* 초록 */
}
.alert-toast.error {
  background: #e53935;  /* 빨강 */
}

</style>
