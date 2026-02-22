import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            toast.success(`Welcome back, ${data.user.username}!`);
            navigate('/');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed';
            toast.error(msg);
        },
    });
};

export const useRegister = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            toast.success('Account created successfully!');
            navigate('/');
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
            toast.error(msg);
        },
    });
};

export const useLogout = () => {
    const { logout } = useAuthStore();
    const qc = useQueryClient();
    const navigate = useNavigate();

    return () => {
        logout();
        qc.clear();
        navigate('/');
        toast.success('Logged out');
    };
};
