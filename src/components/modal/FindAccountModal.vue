<template>
  <!-- 로딩 오버레이 -->
  <v-overlay :model-value="loading || isPwLoading" persistent class="custom-overlay-dialog" style="z-index: 2600;">
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-overlay>

  <!-- 아이디/비밀번호 찾기 모달 -->
  <v-dialog :model-value="open" max-width="520" @update:model-value="close" persistent>
    <v-card style="min-width:440px; min-height:410px; padding:32px 32px 16px 32px; box-sizing: border-box;">
      <v-card-title class="text-h6 font-weight-bold justify-center text-center pb-2">
        {{ t('label.find.title') }}
      </v-card-title>
      <v-tabs v-model="activeTab" background-color="transparent" color="primary" grow>
        <v-tab value="findId">{{ t('label.find.id') }}</v-tab>
        <v-tab value="findPw">{{ t('label.find.password') }}</v-tab>
      </v-tabs>
      <v-card-text>
        <!-- ===== 아이디 찾기 ===== -->
        <template v-if="activeTab === 'findId'">
          <!-- 이메일/휴대전화 선택 버튼 -->
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
          <!-- 인증번호 전송 버튼 -->
          <div class="d-flex align-center mb-2 gap-2 mt-6" style="width:100%;">
            <template v-if="findType === 'email'">
              <v-text-field
                  v-model="emailId"
                  ref="emailIdInput"
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
                  ref="emailDomainInput"
                  :label="t('label.loginForm.email.domain')"
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
                  :label="t('label.loginForm.phone.guide')"
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
            <v-btn color="primary"
                   variant="tonal"
                   rounded="lg"
                   elevation="2"
                   style="min-width:130px; height: 44px; font-weight:600; margin-left:10px;"
                   @click="onSendCode">
              {{ t('label.find.sendCode') }}
            </v-btn>
          </div>
          <!-- 인증번호 입력 및 확인 버튼 -->
          <div class="d-flex align-center gap-2 mt-6" style="width:100%;">
            <v-text-field
                v-model="certCode"
                :label="t('label.find.codeConfirm')"
                hide-details
                maxlength="6"
                autocomplete="off"
                class="flex-grow-1"
                style="max-width:265px;"
                :disabled="timerExpired"
            />
            <v-btn color="primary"
                   variant="tonal"
                   rounded="lg"
                   elevation="2"
                   style="min-width:130px; height: 44px; font-weight:600; margin-left:20px;"
                   @click="onConfirmCode"
                   :disabled="timerExpired">
              {{ t('label.confirm') }}
            </v-btn>
          </div>
          <!-- 남은 시간(타이머) 표시: 인증번호 발송 후에만 보임 -->
          <div class="text-caption mt-2" style="min-height:24px;">
            <span class="font-weight-bold"  v-if="showTimer && !timerExpired" style="color:#e53935;">{{ t('label.find.remainTime') }}: {{ timerText }}</span>
            <span class="font-weight-bold" v-else-if="showTimer && timerExpired" style="color:#e53935;">{{ t('label.find.expiredTime') }}</span>
          </div>
        </template>

        <!-- ===== 비밀번호 찾기 ===== -->
        <template v-else>
          <div v-if="!pwUserInfo">
            <v-text-field
                v-model="pwFindId"
                :label="t('label.loginForm.userId')"
                maxlength="20"
                :error="pwFindIdError"
                @keyup.enter="onFindPwUser"
            />
            <v-btn color="primary" @click="onFindPwUser" :loading="isPwLoading">확인</v-btn>
          </div>
          <div v-else>
            <v-btn
                class="mb-2"
                color="primary"
                block
                @click="onSendTempPw('email')"
                :loading="isPwLoading"
            >{{ pwUserInfo.emailMasked }}로 임시비밀번호 발송</v-btn>
            <v-btn
                color="primary"
                block
                @click="onSendTempPw('phone')"
                :loading="isPwLoading"
                v-if="pwUserInfo.phoneMasked"
            >{{ pwUserInfo.phoneMasked }}로 임시비밀번호 발송</v-btn>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="primary" block @click="close">{{ t('label.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 결과 모달 -->
  <v-dialog v-model="showResultModal" max-width="380" persistent>
    <v-card class="pa-5">
      <v-card-title class="justify-center text-center font-weight-bold">아이디 찾기 결과</v-card-title>
      <v-card-text class="text-center">
        <div v-if="foundUserId">
          <span class="text-h6 font-weight-bold">{{ t('label.loginForm.userId') }}: {{ foundUserId }}</span>
        </div>
        <div v-else>
          <span class="text-h6">{{t('label.find.notExistId')}}</span>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="onResultClose">{{ t('label.close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  sendEmailCode,
  findUserId,
  checkCodeAndFindId,
  sendTempPassword,
  findUser
} from '@/api/auth/auth.js'
import { ref, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { useAlertStore } from '@/store/alert.js'

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
const loading = ref(false);

// 아이디 찾기 타이머
const TIMER_SECONDS = 5 * 60; // 5분
const timer = ref(0);
const timerInterval = ref(null);
const timerText = ref('05:00');
const timerExpired = ref(false);
const showTimer = ref(false);

const alertStore = useAlertStore();

// ===== 비밀번호 찾기 관련 =====
const pwFindId = ref('');
const pwFindIdError = ref(false);
const pwUserInfo = ref(null);   // { emailMasked, phoneMasked, userId }
const isPwLoading = ref(false);

// ========== 함수 정의 ==========

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
  resetTimer();
  // 비밀번호 찾기 리셋
  pwFindId.value = '';
  pwFindIdError.value = false;
  pwUserInfo.value = null;
}

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

// 아이디 찾기용 인증번호
const emailIdInput = ref(null);
const emailDomainInput = ref(null);
async function onSendCode() {
  const email = `${emailId.value}@${emailDomain.value}`;
  if (!emailId.value) {
    alertStore.show('이메일 아이디를 써주세요', 'error');
    await nextTick(() => emailIdInput.value && emailIdInput.value.focus());
    return;
  }
  if (!emailDomain.value) {
    alertStore.show('이메일 도메인을 써주세요', 'error');
    await nextTick(() => emailDomainInput.value && emailDomainInput.value.focus());
    return;
  }

  try {
    loading.value = true;
    await sendEmailCode(email);
    alertStore.show(t('label.find.sendCodeComplete'), 'success');
    startTimer();
  } catch (err) {
    const msg = err?.response?.data?.message || '';
    if (msg.includes('요청 횟수를 초과')) {
      timerExpired.value = true;
      showTimer.value = true;
      timerText.value = '제한됨';
      alertStore.show(msg, 'error');
      setTimeout(() => { timerExpired.value = false }, 5 * 60 * 1000);
    } else {
      alertStore.show(t('label.find.sendCodeFail'), 'error');
    }
  } finally {
    loading.value = false;
  }
}
async function onConfirmCode() {
  const email = `${emailId.value}@${emailDomain.value}`;
  loading.value = true;
  try {
    const res = await checkCodeAndFindId(email, certCode.value);
    if (res.data.success) {
      const idRes = await findUserId(email);
      foundUserId.value = idRes.data.userId;
      showResultModal.value = true;
    } else {
      alertStore.show(t('label.find.codeIncorrect'),'error');
    }
  } catch (err) {
    alertStore.show(t('label.find.codeCheckFail'),'error');
  } finally {
    loading.value = false;
  }
}
function onResultClose() {
  showResultModal.value = false;
  close();
}
function startTimer() {
  timer.value = TIMER_SECONDS;
  timerExpired.value = false;
  showTimer.value = true;
  updateTimerText();
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    timer.value--;
    updateTimerText();
    if (timer.value <= 0) {
      timerExpired.value = true;
      clearInterval(timerInterval.value);
    }
  }, 1000);
}
function resetTimer() {
  timer.value = 0;
  timerText.value = '05:00';
  timerExpired.value = false;
  showTimer.value = false;
  if (timerInterval.value) clearInterval(timerInterval.value);
}
function updateTimerText() {
  const min = String(Math.floor(timer.value / 60)).padStart(2, '0');
  const sec = String(timer.value % 60).padStart(2, '0');
  timerText.value = `${min}:${sec}`;
}

// ================== 비밀번호 찾기용 함수 ==================
async function onFindPwUser() {
  if (!pwFindId.value) {
    pwFindIdError.value = true;
    alertStore.show('아이디를 입력해주세요.', 'error');
    return;
  }
  pwFindIdError.value = false;
  isPwLoading.value = true;
  try {
    const res = await findUser(pwFindId.value);
    if (res.data.success) {
      pwUserInfo.value = res.data;
    } else {
      alertStore.show(res.data.message || '등록된 회원 정보가 없습니다.', 'error');
    }
  } catch (e) {
    alertStore.show('정보 조회 중 오류 발생', 'error');
  } finally {
    isPwLoading.value = false;
  }
}

async function onSendTempPw(type) {
  isPwLoading.value = true;
  console.log('전송 전:', { userId: pwUserInfo.value.userId, type });
  try {
    const res = await sendTempPassword({ userId: pwUserInfo.value.userId, type }); // type: 'email' | 'phone'
    if (res.data.success) {
      alertStore.show(res.data.message || '임시 비밀번호가 발송되었습니다.', 'success');
      close(); // 성공시 닫기 (원하면 pwUserInfo.value만 null로 초기화 가능)
    } else {
      alertStore.show(res.data.message || '임시 비밀번호 발송 실패', 'error');
    }
  } catch (e) {
    alertStore.show('임시 비밀번호 발송 중 오류', 'error');
  } finally {
    isPwLoading.value = false;
  }
}

onUnmounted(() => {
  resetTimer();
});
</script>

<style scoped>
.gap-2 > * + * {
  margin-left: 12px !important;
}
.custom-overlay-dialog {
  display: flex !important;
  align-items: center;
  justify-content: center;
}
</style>
