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


// 응답 에러 인터셉터 등록 (전역 에러 처리)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const status = error.response.status
            if (status === 403) router.push('/403')
            else if (status === 500) router.push('/500')
            else if (status === 404) router.push('/404')
        } else {
            // 네트워크 장애 등
            router.push('/500')
        }
        // 에러를 그대로 throw해서 기존 에러 핸들링도 가능하게 함
        return Promise.reject(error)
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
