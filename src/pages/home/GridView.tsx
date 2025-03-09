import { getUserAPI } from '@/api/users/user';
import { getAllWorkspaceAPI } from '@/api/workspaces/workspace';
import { CreateWorkspaceModal } from '@/components/createWorkspaceModal/CreateWorkspaceModal';
import { WorkspaceSettingModal } from '@/components/workspaceSettingModal/WorkspaceSettingModal';
import style from '@/pages/home/grid-view.module.css';
import objectStyle from '@/style/common/object.module.css';
import { cn } from '@/util/cn';
import { getThemeStyle } from '@/util/getThemeStyle';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const GridView = () => {
    const navigate = useNavigate();
    const workspacesQuery = useQuery({
        queryKey: ['workspaces'],
        queryFn: () => getAllWorkspaceAPI(),
    });

    const getUserQuery = useQuery({
        queryKey: ['users'],
        queryFn: () => getUserAPI(),
    });

    if (workspacesQuery.isLoading || workspacesQuery.isPending) return <>로딩중</>;
    if (workspacesQuery.isError) return <>에러입니다 ㅠ.ㅠ</>;
    const workspaces: Array<Workspace> = workspacesQuery.data ?? [];
    if (getUserQuery.isLoading || getUserQuery.isPending || !getUserQuery.data) return <>로딩중</>;
    if (getUserQuery.isError) return <>에러입니다 ㅠ.ㅠ</>;
    const user = getUserQuery.data;
    return (
        <div className={style.default}>
            <h1>{user.name}의 작업 공간</h1>
            <div className={style.workspaceContainer}>
                {workspaces.map((workspace, index) => {
                    return (
                        <div key={index} className={style.workspaceWrapper}>
                            <div
                                className={cn(objectStyle.bubble, getThemeStyle(workspace.theme), style.bubble)}
                                style={{ animationDelay: `${Math.random()}s` }}
                                onClick={() => navigate(`/workspace/${workspace.id}`)}
                            ></div>
                            <WorkspaceSettingModal key={index} className={style.workspaceName} workspace={workspace} />
                        </div>
                    );
                })}
                <div className={style.workspaceWrapper}>
                    <CreateWorkspaceModal className={style.addWorkspaceButton} />
                </div>
            </div>
        </div>
    );
};
