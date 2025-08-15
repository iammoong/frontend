import { createApp } from 'vue'
import App from './App.vue'
// 다국어
import i18n from './plugins/i18n.js'
//router
// import router from './router/index.js'
import router from "@/router/index.js";
//pinia
import { createPinia } from 'pinia'

import api from './api/auth/auth.js'


//vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

if (typeof global === 'undefined') { window.global = window }

// 응답 에러 인터셉터 등록 (전역 에러 처리)
// 전역 응답 인터셉터: 에러 라우팅
api.interceptors.response.use(
    res => res,
    err => {
        const status = err?.response?.status
        if (status === 403) router.push('/403')
        else if (status === 404) router.push('/404')
        else if (status === 500 || !status) router.push('/500') // 네트워크 장애 포함
        return Promise.reject(err)
    }
)


const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(i18n)
app.use(vuetify)

app.mount('#app')
