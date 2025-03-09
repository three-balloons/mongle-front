// use for test
// TODO delete this file

import { useState } from 'react';
import style from '@/pages/login/admin/admin.module.css';
import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { testLoginAPI } from '@/api/auth/auth';
import { useAuthStore } from '@/store/authStore';
import { APIException } from '@/api/exceptions';
import { cn } from '@/util/cn';

const ADMIN_LOGIN_PASSWORD = import.meta.env.VITE_ADMIN_LOGIN_PASSWORD;

const testLogin = async () => {
    const { accessToken } = await testLoginAPI();
    return {
        accessToken,
    };
};

export const Admin = () => {
    const [password, setPassword] = useState('');
    const [isValidPassword, setIsValidPassword] = useState(true);
    const { login } = useAuthStore((state) => state);

    const passwordChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setPassword(event.target.value);
    };

    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: testLogin,
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

    const demologinHandler = () => {
        if (loginMutation.status !== 'idle') return;
        if (password !== ADMIN_LOGIN_PASSWORD) {
            setIsValidPassword(false);
            return;
        }

        loginMutation.mutate();
    };

    return (
        <div className={cn(style.admin)}>
            <div className={style.description}>
                관리자 로그인 페이지입니다. <br />
                정식로그인은 이전페이지에서 진행해주세요!
            </div>
            <div className={style.back} onClick={() => navigate(-1)}>
                이전 페이지로 돌아가기
            </div>
            <label className={style.input}>
                <span>비밀번호</span>
                <input
                    enterKeyHint="done"
                    type="password"
                    minLength={3}
                    maxLength={20}
                    placeholder="비밀번호를 입력해주세요"
                    value={password}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    onChange={passwordChangeHandler}
                />
            </label>
            {!isValidPassword && <div className={cn(style.invalidPassword)}>비밀번호가 잘못되었습니다</div>}
            <button className={cn(style.button)} onClick={demologinHandler}>
                로그인
            </button>
        </div>
    );
};
