<template>
  <v-dialog :model-value="open" max-width="520" @update:model-value="close">
    <v-card style="min-width:440px; min-height:410px; padding:32px 32px 16px 32px; box-sizing: border-box;">
      <v-card-title class="text-h6 font-weight-bold justify-center text-center pb-2">
        {{ t('label.find.title') }}
      </v-card-title>
      <v-tabs v-model="activeTab" background-color="transparent" color="primary" grow>
        <v-tab value="findId">{{ t('label.find.id') }}</v-tab>
        <v-tab value="findPw">{{ t('label.find.password') }}</v-tab>
      </v-tabs>
      <v-card-text>
        <template v-if="activeTab === 'findId'">
          <!-- 이메로 찾기, 휴대전화로 찾기 버튼 -->
          <div class="d-flex justify-center mb-4 mt-3 gap-2">
            <v-btn
                :variant="findType === 'email' ? 'flat' : 'outlined'"
                color="primary"
                style="min-width:138px; font-weight:600;"
                @click="findType = 'email'">
              {{ t('label.find.email') }}
            </v-btn>
            <v-btn
                :variant="findType === 'phone' ? 'flat' : 'outlined'"
                color="primary"
                style="min-width:138px; font-weight:600;"
                @click="findType = 'phone'">
              {{ t('label.find.phone') }}
            </v-btn>
          </div>
          <!-- 인증번호 전송 버튼-->
          <div class="d-flex align-center mb-2 gap-2" style="width:100%;">
            <template v-if="findType === 'email'">
              <v-text-field
                  v-model="emailId"
                  :label="t('label.loginForm.userId')"
                  hide-details
                  maxlength="30"
                  autocomplete="off"
                  class="flex-grow-1"
                  style="max-width:110px;"
              />
              <span class="mx-1 font-weight-bold">@</span>
              <v-text-field
                  v-model="emailDomain"
                  :label="t( 'label.loginForm.email.domain')"
                  hide-details
                  maxlength="30"
                  autocomplete="off"
                  class="flex-grow-1"
                  style="max-width:110px;"
              />
            </template>
            <template v-else>
              <v-text-field
                  v-model="phone1"
                  maxlength="3"
                  :label="t( 'label.loginForm.phone.guide')"
                  hide-details
                  style="max-width:70px;"
                  @input="onPhoneInput('phone1', 3, $event)"
                  ref="phone1Input"
                  autocomplete="off"
                  class="flex-grow-1"
              />
              <span class="mx-1 font-weight-bold">-</span>
              <v-text-field
                  v-model="phone2"
                  maxlength="4"
                  hide-details
                  style="max-width:75px;"
                  @input="onPhoneInput('phone2', 4, $event)"
                  ref="phone2Input"
                  autocomplete="off"
                  class="flex-grow-1"
              />
              <span class="mx-1 font-weight-bold">-</span>
              <v-text-field
                  v-model="phone3"
                  maxlength="4"
                  hide-details
                  style="max-width:75px;"
                  @input="onPhoneInput('phone3', 4, $event)"
                  ref="phone3Input"
                  autocomplete="off"
                  class="flex-grow-1"
              />
            </template>
            <!-- 인증번호 전송 버튼  -->
            <v-btn color="primary"
                   variant="tonal"
                   style="min-width:130px; height: 44px; font-weight:600; margin-left:10px;"
                   @click="onSendCode">
              {{ t('label.find.sendCode') }}
            </v-btn>
          </div>
          <!-- 인증번호 입력 및 확인 버튼 -->
          <div class="d-flex align-center gap-2" style="width:100%;">
            <v-text-field
                v-model="certCode"
                :label="t('label.find.codeConfirm')"
                hide-details
                maxlength="6"
                autocomplete="off"
                class="flex-grow-1"
                style="max-width:222px;"
            />
            <v-btn color="primary"
                   variant="tonal"
                   style="min-width:130px; height: 44px; font-weight:600; margin-left:10px;"
                   @click="onConfirmCode">
              {{ t('label.confirm') }}
            </v-btn>
          </div>
        </template>
        <template v-else>
          <div class="text-center text-caption my-10">비밀번호 찾기 화면(추후 구현)</div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="primary" block @click="close">{{t('label.close')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <!-- 결과 모달 -->
  <v-dialog v-model="showResultModal" max-width="380">
    <v-card class="pa-5">
      <v-card-title class="justify-center text-center font-weight-bold">아이디 찾기 결과</v-card-title>
      <v-card-text class="text-center">
        <div v-if="foundUserId">
          <span class="text-h6 font-weight-bold">아이디: {{ foundUserId }}</span>
        </div>
        <div v-else>
          <span class="text-h6">등록된 아이디가 없습니다.</span>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="onResultClose">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { sendEmailCode, checkEmailCode, findUserId, checkCodeAndFindId } from '@/api/auth/auth.js'
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n'
import { useAlertStore } from '@/store/alert.js'

// i18n 및 알림 스토어
const { t } = useI18n()
const props = defineProps({ open: Boolean });
const emit = defineEmits(['close']);

const activeTab = ref('findId');
const findType = ref('email');
const emailId = ref('');
const emailDomain = ref('');
const phone1 = ref('');
const phone2 = ref('');
const phone3 = ref('');
const certCode = ref('');
const phone1Input = ref();
const phone2Input = ref();
const phone3Input = ref();
const foundUserId = ref('');
const showResultModal = ref(false);

const alertStore = useAlertStore();

function close() {
  emit('close');
  // 폼 초기화
  activeTab.value = 'findId';
  findType.value = 'email';
  emailId.value = '';
  emailDomain.value = '';
  phone1.value = '';
  phone2.value = '';
  phone3.value = '';
  certCode.value = '';
}

// 휴대전화 입력 시 자동 포커스 이동
function onPhoneInput(type, maxLen, e) {
  let v = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLen);
  if (type === 'phone1') phone1.value = v;
  if (type === 'phone2') phone2.value = v;
  if (type === 'phone3') phone3.value = v;
  if (v.length === maxLen) {
    if (type === 'phone1') nextTick(() => phone2Input.value.focus());
    else if (type === 'phone2') nextTick(() => phone3Input.value.focus());
  }
}
// 인증번호 전송
async function onSendCode() {
  const email = `${emailId.value}@${emailDomain.value}`;
  try {
    await sendEmailCode(email);
    alertStore.show("이메일로 인증번호가 발송되었습니다.");
  } catch (err) {
    alertStore.show("이메일 발송에 실패했습니다.");
  }
}
// 인증번호 확인
async function onConfirmCode() {
  const email = `${emailId.value}@${emailDomain.value}`;
  try {
    //const res = await checkEmailCode(email, certCode.value);
    const res = await checkCodeAndFindId(email, certCode.value);
    if (res.data.success) {
      // 인증 성공 시 아이디 조회
      const idRes = await findUserId(email);
      foundUserId.value = idRes.data.userId;
      showResultModal.value = true;
    } else {
      alertStore.show('인증번호가 올바르지 않습니다.');
    }
  } catch (err) {
    alertStore.show('인증 확인에 실패했습니다.');
  }
}

function onResultClose() {
  showResultModal.value = false;
  close();
}
</script>

<style scoped>
.gap-2 > * + * {
  margin-left: 12px !important;
}
</style>
