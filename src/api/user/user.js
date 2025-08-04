import { user } from "./userAxios.js";

export function fetchUser(id) {
    return user.get(`/${id}`)
}
