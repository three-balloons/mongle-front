import { getAccessTokenAPI } from '@/api/auth/auth';

import { stringify, parse } from 'qs';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import style from '@/pages/login/kakao/kakao.module.css';
import { useNavigate } from 'react-router-dom';

import { APIException } from '@/api/exceptions';
import { useAuthStore } from '@/store/authStore';

const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const AUTHORIZE_URI = import.meta.env.VITE_KAKAO_AUTHORIZE_URI;

const PARAMS = {
    client_id: REST_API_KEY,
    response_type: 'code',
    redirect_uri: `${window.location.origin}/login/kakao`,
    scope: 'openid',
    nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    state: '',
};

export const KAKAO_LOGIN_URL = `${AUTHORIZE_URI}?${stringify(PARAMS)}`;

const kakaoLogin = async (code: string) => {
    const { accessToken } = await getAccessTokenAPI({
        provider: 'KAKAO',
        code: code,
        redirectUri: `${window.location.origin}/login/kakao`,
    });
    return {
        accessToken,
    };
};

export const Kakao = () => {
    const navigate = useNavigate();

    const { login } = useAuthStore((state) => state);
    const loginMutation = useMutation({
        mutationFn: kakaoLogin,
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
