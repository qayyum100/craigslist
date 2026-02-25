import api from './client';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    username: string;
}

export const authApi = {
    login: async (payload: LoginPayload) => {
        const { data } = await api.post('auth/login', payload);
        return data;
    },

    register: async (payload: RegisterPayload) => {
        const { data } = await api.post('auth/register', payload);
        return data;
    },

    getMe: async () => {
        const { data } = await api.get('auth/me');
        return data.user;
    },

    updateProfile: async (updates: { username?: string; avatar_url?: string }) => {
        const { data } = await api.patch('auth/me', updates);
        return data.user;
    },
};
