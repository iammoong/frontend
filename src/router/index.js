// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 라우트 컴포넌트 임포트
import LoginForm from '../components/form/LoginForm.vue'
import Main from '../views/main/Main.vue'
import ErrorPage from '../views/error/ErrorPageView.vue'
import KakaoCallback from '@/views/kakao/KakaoCallback.vue'

// 라우트 정의
const useRouters = [
    {
        path: '/',           // ← 이 부분 추가
        redirect: '/login',  // /로 접근하면 자동으로 /login으로 이동
    },
    {
        path: '/login',
        name:'Login',
        component: LoginForm
    },
    {
        path: '/oauth/kakao/callback',
        name: 'KakaoCallback',
        component: KakaoCallback
    },
    {
        path: '/main',
        name:'Main',
        component: Main
    },
    {
        path: '/403',
        component: ErrorPage,
        props: { status: 403, message: '접근 권한이 없습니다.' }
    },
    {
        path: '/500',
        component: ErrorPage,
        props: { status: 500, message: '서버 오류가 발생했습니다.' }
    },
    // 404 Not found - 항상 마지막에
    {
        path: '/:pathMatch(.*)*',
        component: ErrorPage,
        props: { status: 404, message: '페이지를 찾을 수 없습니다.' }
    }
]

// 라우터 생성
const router = createRouter({
    history: createWebHistory(),
    routes: useRouters,
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('jwtToken')

    // 에러 페이지들은 토큰 없어도 항상 접근 허용
    const publicPages = ['Login','KakaoCallback', undefined]  // undefined는 404 page, name이 없음
    const errorPaths = ['/403', '/404', '/500']

    if (errorPaths.includes(to.path)) return next()

    // publicPages에 포함되어 있으면 토큰 없이도 접근 허용
    if (publicPages.includes(to.name)) return next()

    if (!token) {
        return next({ name: 'Login' })
    }
    next()
})


export default router
