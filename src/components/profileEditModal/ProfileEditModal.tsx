import Modal from '@/headless/modal/Modal';
import style from '@/components/profileEditModal/profile-edit-modal.module.css';
import objectStyle from '@/style/common/object.module.css';
import { cn } from '@/util/cn';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/react-query/quertClient';
import { updateUserAPI } from '@/api/users/user';

type ProfileEditModalProps = {
    user: {
        name: string;
        email: string;
    };
    className?: string;
};
export const ProfileEditModal = ({ user, className }: ProfileEditModalProps) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const { mutate: updateUser } = useMutation({
        mutationFn: ({ name, email }: { name: string; email: string }) => updateUserAPI({ name, email }),
    });
    const updateHandler = () => {
        updateUser(
            { name: name, email: email },
            {
                onSuccess: () => {
                    console.log('저장 성공');
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                },
            },
        );
        return;
    };

    return (
        <Modal className={cn(className)}>
            <Modal.Opener className={style.opener}>
                <div>정보수정</div>
            </Modal.Opener>
            <Modal.Overlay className={style.overlay} zIndex={0} />
            <Modal.Content className={style.content}>
                <div className={cn(style.profile, style.touchable)}>
                    <div>이름</div>
                    <input
                        type="text"
                        value={name}
                        placeholder="이름을 입력해주세요"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className={cn(style.profile, style.touchable)}>
                    <div>이메일</div>
                    <input
                        type="text"
                        value={email}
                        placeholder="이메일을 입력해주세요"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <Modal.Closer className={style.save}>
                    <button className={objectStyle.buttonBig} onClick={updateHandler}>
                        저장하기
                    </button>
                </Modal.Closer>
            </Modal.Content>
        </Modal>
    );
};
