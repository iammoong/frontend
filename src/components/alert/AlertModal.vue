<template>
  <v-dialog v-model="alertStore.open" max-width="360">
    <v-card>
      <v-card-text class="py-6 text-center">{{ alertStore.message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="alertStore.close">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {useAlertStore} from "../../store/alert.js"
const alertStore = useAlertStore()
</script>
