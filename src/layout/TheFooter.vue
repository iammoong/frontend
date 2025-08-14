<template>
  <v-footer
      app
      height="auto"
      elevation="0"
      color="transparent"
      class="app-footer px-4 py-3"
      border
  >
    <v-container fluid class="px-0">
      <v-row class="align-center">
        <!-- 좌측: 브랜드 -->
        <v-col cols="12" md="4" class="d-flex align-center mb-2 mb-md-0">
          <v-avatar size="24" class="brand-avatar mr-2">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>
          </v-avatar>
          <strong class="text-body-2">MOONKI</strong>
          <span class="text-caption text-medium-emphasis ml-3">
            © {{ year }} Moonki. All rights reserved.
          </span>
        </v-col>

        <!-- 중앙 -->
        <v-col cols="12" md="4" class="d-flex justify-center gap-1">
        </v-col>

        <!-- 우측: 액션(언어/테마/소셜/탑) -->
        <v-col cols="12" md="4" class="d-flex justify-end align-center">
          <v-btn
              variant="text"
              size="small"
              class="mx-1"
              :ripple="false"
              prepend-icon="mdi-translate"
              @click="toggleLocale"
              :title="`Locale: ${locale.toUpperCase()}`"
          >
            {{ locale.toUpperCase() }}
          </v-btn>

          <v-btn
              variant="text"
              size="small"
              class="mx-1"
              :ripple="false"
              :title="isDark ? 'Light Mode' : 'Dark Mode'"
              @click="toggleTheme"
          >
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>

          <v-btn
              variant="text"
              size="small"
              class="mx-1"
              :ripple="false"
              href="https://test.com"
          target="_blank"
          rel="noopener"
          title="GitHub"
          >
          <v-icon>mdi-github</v-icon>
          </v-btn>

          <v-btn
              variant="text"
              size="small"
              class="mx-1"
              :ripple="false"
              href="mailto:contact@example.com"
          title="Email"
          >
          <v-icon>mdi-email-outline</v-icon>
          </v-btn>

          <v-btn
              variant="tonal"
              size="small"
              class="mx-1"
              :ripple="false"
              title="맨 위로"
              @click="scrollTop"
          >
            <v-icon size="18" class="mr-1">mdi-arrow-up</v-icon>
            Top
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const router = useRouter()
const { locale } = useI18n({ useScope: 'global' })
const { global: theme } = useTheme()

const year = new Date().getFullYear()
const isDark = computed(() => theme.current.value.dark)

function toggleLocale() {
  locale.value = locale.value === 'ko' ? 'en' : 'ko'
  localStorage.setItem('locale', locale.value)
  document.documentElement.setAttribute('lang', locale.value)
}

function toggleTheme() {
  theme.name.value = isDark.value ? 'light' : 'dark'
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.app-footer {
  backdrop-filter: saturate(135%) blur(8px);
  background:
      radial-gradient(900px 500px at 10% 100%, rgba(99,102,241,0.10), transparent 60%),
      radial-gradient(700px 400px at 100% 0%, rgba(16,185,129,0.10), transparent 60%),
      rgba(255,255,255,0.75);
  border-top: 1px solid rgba(0,0,0,0.06) !important;
}
:deep(.v-theme--dark) .app-footer {
  background:
      radial-gradient(900px 500px at 10% 100%, rgba(99,102,241,0.12), transparent 60%),
      radial-gradient(700px 400px at 100% 0%, rgba(16,185,129,0.10), transparent 60%),
      rgba(18,18,18,0.60);
  border-top: 1px solid rgba(255,255,255,0.08) !important;
}

.brand-avatar {
  background: linear-gradient(135deg, rgba(99,102,241,.20), rgba(16,185,129,.20));
}
.brand-avatar svg circle { fill: rgba(255,255,255,0.65); }

/* 간격 유틸 */
.gap-1 > * + * { margin-left: .25rem; }
</style>
