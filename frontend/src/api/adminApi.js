import {api} from "./apiClient";

export async function getUsers(){
    return (await api.get("/admin/users")).data;
}

export async function setUserRole(userId, role) {
    return (await api.patch(`/admin/users/${userId},/role`, {role})).data;
}