import { deleteUserAPI, getUserAPI } from '@/api/users/user';
import { ProfileEditModal } from '@/components/profileEditModal/ProfileEditModal';
import style from '@/pages/home/profile/profile.module.css';
import { queryClient } from '@/react-query/quertClient';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/util/cn';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { logout } = useAuthStore((state) => state);
    const navigate = useNavigate();

    const {
        data: user,
        isLoading,
        isPending,
        isError,
    } = useQuery({
        queryKey: ['users'],
        queryFn: () => getUserAPI(),
    });

    const { mutateAsync: deleteUser } = useMutation({
        mutationFn: () => deleteUserAPI(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });

    const logoutHandler = () => {
        logout();
        navigate('/login', {
            replace: true,
        });
    };

    const withdrawHandler = async () => {
        await deleteUser();
        logout();
        navigate('/login', {
            replace: true,
        });
    };

    if (isLoading || isPending) return <>로딩중</>;
    if (isError) return <>에러입니다 ㅠ.ㅠ</>;
    if (!user) return <>로딩중</>;

    return (
        <div className={style.default}>
            <h1>프로필 설정</h1>
            <div className={style.profileContainer}>
                <div className={style.profile}>
                    <div>사용자명</div>
                    <div>{user.name}</div>
                </div>
                <div className={style.profile}>
                    <div>이메일</div>
                    <div>{user.email ?? '-'}</div>
                </div>
                <div className={style.profile}>
                    <div>로그인 방식</div>
                    <div>{user.provider === 'KAKAO' ? '카카오' : '구글'}</div>
                </div>

                <div className={style.line} />
                <ProfileEditModal
                    className={cn(style.profileEdit, style.touchable)}
                    user={{ name: user.name, email: user.email ?? '' }}
                />

                <div className={cn(style.profile, style.touchable)}>
                    <div onClick={() => logoutHandler()}>로그아웃</div>
                </div>
                <div className={(style.withdraw, style.touchable)}>
                    <div onClick={() => withdrawHandler()}>계정삭제</div>
                </div>
            </div>
        </div>
    );
};
