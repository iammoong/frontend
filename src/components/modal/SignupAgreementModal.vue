<template>
  <v-dialog :model-value="open" @update:model-value="close" max-width="400" persistent>
    <v-card>
      <v-card-title class="ml-3">{{ t('agreement.title') }}</v-card-title>
      <v-card-text>
        <v-sheet  elevation="0"
                  class="pa-4 mb-4"
                  rounded
                  border
                  style="max-height:180px; overflow:auto; font-size:14px;">
          <div style="white-space: pre-line;">
            {{ t('agreement.content') }}
          </div>
        </v-sheet>
        <p
            class="text-left mb-1"
            style="font-size: 13px; color: #888; font-style: italic; white-space: pre-line;"
        >
          {{t('agreement.readAndAgree')}}
        </p>

        <v-checkbox
            v-model="checked"
            color="primary"
            class="mt-3"
        >
          <template #label>
            <span style="font-weight:600; font-size:15px; color:#1976d2;">
              {{ t('agreement.checkbox') }}
            </span>
          </template>
        </v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn text @click="close">{{ t('label.cancel') }}</v-btn>
        <v-btn color="primary" :disabled="!checked" @click="onNext">{{ t('label.next') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script setup>
import {ref} from 'vue'
import {useI18n} from "vue-i18n";
const { t } = useI18n()

const props = defineProps({open: Boolean})
const emit = defineEmits(['close', 'next'])

const checked = ref(false)

function close() {
  checked.value = false
  emit('close')
}

function onNext() {
  checked.value = false
  emit('next')
}
</script>
