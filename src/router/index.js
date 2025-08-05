// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 라우트 컴포넌트 임포트
import LoginForm from '../components/form/LoginForm.vue'
import Main from '../views/main/Main.vue'

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
        path: '/main',
        name:'Main',
        component: Main
    },
]



// 라우터 생성
const router = createRouter({
    history: createWebHistory(),
    routes: useRouters,
})

// 전역 네비게이션 가드
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('jwtToken')
    if (to.name !== 'Login' && !token) {
        // 토큰이 없으면 로그인 페이지로
        next({ name: 'Login' })
    } else if (to.name === 'Login' && token) {
        // 이미 로그인 상태인데 로그인 페이지 접근시 메인으로 리다이렉트
        next({ name: 'Main' })
    } else {
        next()
    }
})

export default router
