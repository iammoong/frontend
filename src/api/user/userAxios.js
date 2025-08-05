import axios from 'axios'

/**
 * baseURL과 옵션을 받아서 axios 인스턴스를 생성하는 함수
 * @param {string} baseURL
 * @param {object} options
 * @returns {AxiosInstance}
 */
function create(baseURL, options = {}) {
    return axios.create({
        baseURL,
        ...options,
    })
}

// VITE_API_URL 환경변수에서 값을 받아와서 사용
const apiBase = import.meta.env.VITE_API_URL

// 예시: posts 인스턴스 (baseURL + 'posts')
export const posts = create(`${apiBase}api/posts`)

// 확장: user 인스턴스 등 필요시 더 만들 수 있습니다.
export const user = create(`${apiBase}api/user`)
