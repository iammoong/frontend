import { createI18n } from 'vue-i18n'
import ko from '@/properties/locales/ko.json'
import en from '@/properties/locales/en.json'
import agreement from '@/properties/locales/agreement.ko.json'

const messages = {
    ko: {
        ...ko,
        ...agreement
    },
    en
}

const i18n = createI18n({
    legacy: false,
    locale: 'ko',
    fallbackLocale: 'en',
    messages
})

export default i18n
