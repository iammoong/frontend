import { createI18n } from 'vue-i18n'
import ko from '@/properties/locales/ko.json'
import en from '@/properties/locales/en.json'
import agreementKo from '@/properties/locales/agreement.ko.json'
import agreementEn from '@/properties/locales/agreement.en.json'

// 기존 구조 유지: ko는 ko+agreementKo, en은 en+agreementEn
const messages = {
    ko: { ...ko, ...agreementKo },
    en: { ...en, ...agreementEn }
}

// 저장된 언어가 있으면 우선 사용, 없으면 브라우저 언어 기준
const saved = localStorage.getItem('locale')
const defaultLocale = saved || (navigator.language?.startsWith('ko') ? 'ko' : 'en')

const i18n = createI18n({
    legacy: false,
    locale: defaultLocale,
    // en에 없는 키는 ko로 폴백되도록
    fallbackLocale: ['en', 'ko'],
    messages
})

export function setLocale(lang) {
    i18n.global.locale.value = lang
    localStorage.setItem('locale', lang)
    document.documentElement.setAttribute('lang', lang)
}
export function getLocale() {
    return i18n.global.locale.value
}

export default i18n
