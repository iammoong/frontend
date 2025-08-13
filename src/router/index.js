import {createRouter, createWebHistory} from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'
import LoginForm from '@/components/form/LoginForm.vue'
import Main from '@/views/main/Main.vue'
import AccountView from '@/views/user/AccountView.vue'
import ErrorPage from '@/views/error/ErrorPageView.vue'
import KakaoCallback from '@/views/kakao/KakaoCallback.vue'

import api from '@/api/token/http'
import {jwtDecode} from 'jwt-decode'

const routes = [
    {path: '/', redirect: '/login'},

    // 로그인(비인증, 레이아웃 밖)
    {path: '/login', name: 'Login', component: LoginForm},
    {path: '/oauth/kakao/callback', name: 'KakaoCallback', component: KakaoCallback},

    // 레이아웃(헤더 고정) + 자식 라우트
    {
        path: '/app',
        component: AppLayout,
        children: [
            {path: 'main', name: 'Main', component: Main},
            {path: 'account', name: 'Account', component: AccountView}, // 내정보
        ],
    },

    {path: '/403', component: ErrorPage, props: {status: 403, message: '접근 권한이 없습니다.'}},
    {path: '/500', component: ErrorPage, props: {status: 500, message: '서버 오류가 발생했습니다.'}},
    {path: '/:pathMatch(.*)*', component: ErrorPage, props: {status: 404, message: '페이지를 찾을 수 없습니다.'}},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('jwtToken')
    const publicPages = ['Login', 'KakaoCallback', undefined]
    const errorPaths = ['/403', '/404', '/500']
    if (errorPaths.includes(to.path)) return next()
    if (publicPages.includes(to.name)) return next()
    if (!token) return next({name: 'Login'})
    next()
})

// 화면 이동시 토근 초기화
let refreshing = false
let lastRefreshAt = 0

router.afterEach(async () => {
    const token = localStorage.getItem('jwtToken')
    if (!token) return

    const now = Date.now()
    if (refreshing || now - lastRefreshAt < 30_000) return

    try {
        const {exp} = jwtDecode(token)        // 초 단위
        if (typeof exp !== 'number') return
        const left = exp * 1000 - Date.now()
        if (left < 10 * 60 * 1000) {            // 10분 미만이면 갱신
            refreshing = true
            const {data} = await api.post('/auth/refresh')
            if (data?.token) localStorage.setItem('jwtToken', data.token)
            lastRefreshAt = Date.now()
        }
    } catch {
        // 파싱 실패 등은 무시
    } finally {
        refreshing = false
    }
})

export default router
