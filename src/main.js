import { createApp } from 'vue'
import App from './App.vue'
// 다국어
import i18n from './plugins/i18n.js'
//router
// import router from './router/index.js'
import router from "@/router/index.js";
//pinia
import { createPinia } from 'pinia'


//vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

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
