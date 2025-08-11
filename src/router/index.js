// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'
import LoginForm from '@/components/form/LoginForm.vue'
import Main from '@/views/main/Main.vue'
import AccountView from '@/views/user/AccountView.vue'
import ErrorPage from '@/views/error/ErrorPageView.vue'
import KakaoCallback from '@/views/kakao/KakaoCallback.vue'

const routes = [
    { path: '/', redirect: '/login' },

    // 로그인(비인증, 레이아웃 밖)
    { path: '/login', name: 'Login', component: LoginForm },
    { path: '/oauth/kakao/callback', name: 'KakaoCallback', component: KakaoCallback },

    // 레이아웃(헤더 고정) + 자식 라우트
    {
        path: '/app',
        component: AppLayout,
        children: [
            { path: 'main', name: 'Main', component: Main },
            { path: 'account', name: 'Account', component: AccountView }, // 내정보
        ],
    },

    { path: '/403', component: ErrorPage, props: { status: 403, message: '접근 권한이 없습니다.' } },
    { path: '/500', component: ErrorPage, props: { status: 500, message: '서버 오류가 발생했습니다.' } },
    { path: '/:pathMatch(.*)*', component: ErrorPage, props: { status: 404, message: '페이지를 찾을 수 없습니다.' } },
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
    if (!token) return next({ name: 'Login' })
    next()
})

export default router
