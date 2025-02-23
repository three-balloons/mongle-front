import Modal from '@/headless/modal/Modal';
import style from '@/components/createWorkspaceModal/create-workspace-modal.module.css';
import colorStyle from '@/style/common/theme.module.css';
import objectStyle from '@/style/common/object.module.css';
import { cn } from '@/util/cn';
import { useEffect, useState } from 'react';
import Select from '@/headless/select/Select';
import { ReactComponent as ModifyIcon } from '@/assets/icon/modify.svg';
import { createWorkspaceAPI } from '@/api/workspaces/workspace';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/react-query/quertClient';
import { UNNAMED } from '@/util/constant';

type CreateWorkspaceModalProps = {
    className: string;
};
export const CreateWorkspaceModal = ({ className }: CreateWorkspaceModalProps) => {
    const [isNameChange, setIsNameChange] = useState(false);
    const [name, setName] = useState(UNNAMED);
    const [theme, setTheme] = useState<Theme>('하늘');
    const [isNameValid, setIsNameValid] = useState(true);

    useEffect(() => {
        setName('');
        setTheme('하늘');
        setIsNameValid(true);
    }, []);

    const { mutate: createWorkspace } = useMutation({
        mutationFn: ({ name, theme }: { name: string; theme: string }) => createWorkspaceAPI({ name, theme }),
    });

    const checkNameValid = () => {
        if (name == '') {
            setIsNameValid(false);
            return false;
        } else {
            setIsNameValid(true);
            return true;
        }
    };
    const createHandler = () => {
        createWorkspace(
            { name: name, theme: theme as string },
            {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
            },
        );
        return;
    };

    return (
        <Modal className={cn(className)}>
            <Modal.Opener className={style.opener}>
                <div className={style.openerName}>추가하기</div>
            </Modal.Opener>
            <Modal.Overlay className={style.overlay} zIndex={0} onClick={() => setTheme('하늘')} />
            <Modal.Content className={style.content}>
                {isNameChange || name == '' ? (
                    <div>
                        <div className={style.nameEditor}>
                            <input
                                className={cn(style.name, style.input)}
                                type="text"
                                value={name}
                                placeholder="이름을 입력해주세요"
                                onKeyDown={(e) => e.key === 'Enter' && setIsNameChange(false)}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button
                                className={objectStyle.buttonSmall}
                                onClick={() => {
                                    if (checkNameValid()) setIsNameChange(false);
                                }}
                            >
                                완료
                            </button>
                        </div>
                        {!isNameValid && <div className={style.nameInvalidAlert}>* 이름을 입력해주세요</div>}
                    </div>
                ) : (
                    <div className={style.nameEditor} onClick={() => setIsNameChange(true)}>
                        <div className={style.name}>{name}</div>
                        <ModifyIcon className={style.iconModify} />
                    </div>
                )}

                <Select initialOpen disableClose>
                    <div className={style.themeTitle}>테마선택</div>
                    <Select.Content className={style.theme}>
                        <Select.Option
                            className={style.option}
                            value={theme}
                            onSelect={() => {
                                setTheme('하늘');
                            }}
                        >
                            <div className={cn(colorStyle.themeBlue, style.themeOption)}>
                                <div
                                    className={cn(style.colorSample, theme == '하늘' && style.colorSampleSelected)}
                                ></div>
                                <div className={cn(theme == '하늘' && style.themeSelected)}>하늘</div>
                            </div>
                        </Select.Option>
                        <Select.Option
                            className={style.option}
                            value={theme}
                            onSelect={() => {
                                setTheme('분홍');
                            }}
                        >
                            <div className={cn(colorStyle.themePink, style.themeOption)}>
                                <div
                                    className={cn(style.colorSample, theme == '분홍' && style.colorSampleSelected)}
                                ></div>
                                <div className={cn(theme == '분홍' && style.themeSelected)}>분홍</div>
                            </div>
                        </Select.Option>
                        <Select.Option
                            className={style.option}
                            value={theme}
                            onSelect={() => {
                                setTheme('연두');
                            }}
                        >
                            <div className={cn(colorStyle.themeGreen, style.themeOption)}>
                                <div
                                    className={cn(style.colorSample, theme == '연두' && style.colorSampleSelected)}
                                ></div>
                                <div className={cn(theme == '연두' && style.themeSelected)}>연두</div>
                            </div>
                        </Select.Option>
                        <Select.Option
                            className={style.option}
                            value={theme}
                            onSelect={() => {
                                setTheme('노랑');
                            }}
                        >
                            <div className={cn(colorStyle.themeYellow, style.themeOption)}>
                                <div
                                    className={cn(style.colorSample, theme == '노랑' && style.colorSampleSelected)}
                                ></div>
                                <div className={cn(theme == '노랑' && style.themeSelected)}>노랑</div>
                            </div>
                        </Select.Option>
                        {/* <Select.Option
                        className={style.option}
                        value={theme}
                        onSelect={() => {
                            setTheme('하양');
                        }}
                    >
                        <div className={cn(colorStyle.themeWhite, style.themeOption)}>
                            <div className={style.colorSample}></div>
                            <div className={cn(theme == '하양' && style.themeSelected)}>하양</div>
                        </div>
                    </Select.Option>
                    <Select.Option
                        className={style.option}
                        value={theme}
                        onSelect={() => {
                            setTheme('검정');
                        }}
                    >
                        <div className={cn(colorStyle.themeBlack, style.themeOption)}>
                            <div className={style.colorSample}></div>
                            <div className={cn(theme == '검정' && style.themeSelected)}>검정</div>
                        </div>
                    </Select.Option> */}
                    </Select.Content>
                </Select>
                <Modal.Closer className={style.save}>
                    <button className={objectStyle.buttonBig} onClick={createHandler}>
                        생성하기
                    </button>
                </Modal.Closer>
            </Modal.Content>
        </Modal>
    );
};
