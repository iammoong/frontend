<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
    <div>
      <v-icon :color="color" size="96">{{ icon }}</v-icon>
    </div>
    <div class="display-2 font-weight-bold my-2">{{ status }}</div>
    <div class="text-h6 mb-4">{{ message }}</div>
    <v-btn color="primary" to="/">홈으로 돌아가기</v-btn>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  status: { type: [String, Number], default: '404' },
  message: { type: String, default: '페이지를 찾을 수 없습니다.' }
})

const icon = computed(() =>
    props.status == '403' ? 'mdi-cancel' :
        props.status == '404' ? 'mdi-alert-circle' : 'mdi-emoticon-sad-outline'
)
const color = computed(() =>
    props.status == '403' ? 'error' :
        props.status == '500' ? 'warning' : 'primary'
)
</script>
