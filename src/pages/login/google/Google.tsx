import { getAccessTokenAPI } from '@/api/auth/auth';

import { stringify, parse } from 'qs';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import style from '@/pages/login/google/google.module.css';
import { useNavigate } from 'react-router-dom';

import { APIException } from '@/api/exceptions';
import { useAuthStore } from '@/store/authStore';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const AUTHORIZE_URI = import.meta.env.VITE_GOOGLE_AUTHORIZE_URI;
const PARAMS = {
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: `${window.location.origin}/login/google`,
    scope: 'openid profile email',
    nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    state: '',
};

export const GOOGLE_LOGIN_URL = `${AUTHORIZE_URI}?${stringify(PARAMS)}`;

const googleLogin = async (code: string) => {
    const { accessToken } = await getAccessTokenAPI({
        provider: 'GOOGLE',
        code: code,
        redirectUri: `${window.location.origin}/login/google`,
    });
    return {
        accessToken,
    };
};

export const Google = () => {
    const navigate = useNavigate();

    const { login } = useAuthStore((state) => state);
    const loginMutation = useMutation({
        mutationFn: googleLogin,
        onSuccess({ accessToken }) {
            login(accessToken);
            navigate('/home', { replace: true });
        },
        onError(error) {
            if (error instanceof APIException) {
                if (error.code === 'SIGN_UP_NEEDED') {
                    return navigate('/login');
                }
            } else throw error;
        },
    });

    useEffect(() => {
        (async () => {
            const { code } = parse(window.location.search.substring(1)) as { code: string };

            if (loginMutation.status !== 'idle') return;
            loginMutation.mutate(code);
        })();
    }, [loginMutation]);

    if (loginMutation.status === 'pending' || loginMutation.status === 'idle') {
        return <div>로그인 중입니다</div>;
    }
    if (loginMutation.status === 'error') {
        return (
            <div className={style.default}>
                <p>로그인 중 오류가 발생했습니다.</p>
            </div>
        );
    }
};
