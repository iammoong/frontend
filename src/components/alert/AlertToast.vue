<template>
  <div
      v-if="alertStore.open"
      class="alert-toast"
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
  position: fixed;
  right: 30px;
  bottom: 30px;
  min-width: 230px;
  max-width: 340px;
  padding: 14px 20px 14px 16px;
  background: #333;
  color: #fff;
  font-size: 1rem;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.17);
  display: flex;
  align-items: center;
  z-index: 9999;
  animation: slideInUp 0.4s cubic-bezier(.31,1.06,.76,1.09);
}

@keyframes slideInUp {
  0% { opacity: 0; transform: translateY(60px);}
  100% { opacity: 1; transform: translateY(0);}
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  margin-left: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.close-btn:hover {
  opacity: 1;
}
</style>
