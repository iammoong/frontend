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

export default router
