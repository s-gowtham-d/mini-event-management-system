/**
 * @file /Users/gowtham/code/projects/arametrics/system/next-client/src/hooks/useAuth.ts
 * @author Gowtham <gowtham@aracreate.com>
 * @version 2.0.0
 * @license Apache-2.0
 * @copyright 2025 araCreate GmbH
 */

// hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
// import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
}

export function useAuth() {
    const { login, logout, isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            // const response = await api.post<LoginResponse>('/auth/login', credentials);
            // return response.data;
        },
        onSuccess: (data) => {
            // login(data.user, data.token);
            router.push('/dashboard');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            // await api.post('/auth/logout');
        },
        onSettled: () => {
            logout();
            queryClient.clear();
            router.push('/login');
        },
    });

    return {
        user,
        isAuthenticated,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
    };
}