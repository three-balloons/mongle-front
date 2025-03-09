import Modal from '@/headless/modal/Modal';
import style from '@/components/workspaceSettingModal/workspace-setting-modal.module.css';
import colorStyle from '@/style/common/theme.module.css';
import objectStyle from '@/style/common/object.module.css';
import { cn } from '@/util/cn';
import { useEffect, useState } from 'react';
import Select from '@/headless/select/Select';
import { ReactComponent as ModifyIcon } from '@/assets/icon/modify.svg';
import { ReactComponent as SettingIcon } from '@/assets/icon/setting.svg';
import { deleteWorkspaceAPI, updateWorkspaceAPI } from '@/api/workspaces/workspace';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/react-query/quertClient';

type WorkspaceSettingModalProps = {
    workspace: Workspace;
    className: string;
};
export const WorkspaceSettingModal = ({ workspace, className }: WorkspaceSettingModalProps) => {
    const [isNameChange, setIsNameChange] = useState(false);
    const [name, setName] = useState(workspace.name);
    const [theme, setTheme] = useState<Theme>(workspace.theme);

    useEffect(() => {
        setName(workspace.name);
        setTheme(workspace.theme);
    }, [workspace]);

    const { mutate: updateWorkspace } = useMutation({
        mutationFn: ({ workspaceId, name, theme }: { workspaceId: string; name: string; theme: string }) =>
            updateWorkspaceAPI({ workspaceId, name, theme }),
    });
    const { mutate: deleteWorkspace } = useMutation({
        mutationFn: ({ workspaceId }: { workspaceId: string }) => deleteWorkspaceAPI({ workspaceId }),
    });
    const saveHandler = () => {
        updateWorkspace(
            { workspaceId: workspace.id, name: name, theme: theme as string },
            {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
            },
        );
        return;
    };
    const deleteHandler = () => {
        deleteWorkspace(
            { workspaceId: workspace.id },
            {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
            },
        );
        return;
    };

    return (
        <Modal className={cn(className)}>
            <Modal.Opener className={style.opener}>
                <div className={style.openerName}>{name}</div>
                <SettingIcon className={style.iconDown} />
            </Modal.Opener>
            <Modal.Overlay className={style.overlay} zIndex={0} onClick={() => setTheme(workspace.theme)} />
            <Modal.Content className={style.content}>
                {isNameChange ? (
                    <div className={style.nameEditor}>
                        <input
                            className={cn(style.name, style.input)}
                            type="text"
                            value={name}
                            placeholder="이름을 입력해주세요"
                            onKeyDown={(e) => e.key === 'Enter' && setIsNameChange(false)}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button className={objectStyle.buttonSmall} onClick={() => setIsNameChange(false)}>
                            완료
                        </button>
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
                    </Select.Content>
                </Select>
                <div className={style.mutateButtonWrapper}>
                    <Modal.Closer className={style.delete}>
                        <button className={objectStyle.buttonBig} onClick={deleteHandler}>
                            삭제하기
                        </button>
                    </Modal.Closer>
                    <Modal.Closer className={style.save}>
                        <button className={objectStyle.buttonBig} onClick={saveHandler}>
                            저장하기
                        </button>
                    </Modal.Closer>
                </div>
            </Modal.Content>
        </Modal>
    );
};
