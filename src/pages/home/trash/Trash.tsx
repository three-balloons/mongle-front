import { getDeletedWorkspaceAPI, restoreWorkspaceAPI } from '@/api/workspaces/workspace';
import style from '@/pages/home/trash/trash.module.css';
import { queryClient } from '@/react-query/quertClient';
import objectStyle from '@/style/common/object.module.css';
import { cn } from '@/util/cn';
import { WORKSPACE_RETENTION_PERIOD } from '@/util/constant';
import { differenceInDaysformat } from '@/util/dateFormat';
import { getThemeStyle } from '@/util/getThemeStyle';
import { useMutation, useQuery } from '@tanstack/react-query';

export const Trash = () => {
    const deletedWorkspacesQuery = useQuery({
        queryKey: ['workspaces'],
        queryFn: () => {
            return getDeletedWorkspaceAPI();
        },
    });
    const { mutateAsync: restoreWorkspace } = useMutation({
        mutationFn: async (workspaceId: string) => await restoreWorkspaceAPI({ workspaceId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
    });

    const restoreHandler = async (workspaceId: string) => {
        await restoreWorkspace(workspaceId);
    };

    if (deletedWorkspacesQuery.isLoading || deletedWorkspacesQuery.isPending) return <>로딩중</>;
    if (deletedWorkspacesQuery.isError) return <>에러입니다 ㅠ.ㅠ</>;
    const trashList = deletedWorkspacesQuery.data ?? [];
    if (trashList.length == 0)
        return (
            <div className={style.defaultEmpty}>
                <div className={style.empty}>버린 작업 공간이 없습니다</div>
                <div className={style.descriptionEmpty}>
                    {`삭제한 작업 공간은 휴지통에 보관되며 ${WORKSPACE_RETENTION_PERIOD}일 후 완전히 삭제됩니다`}
                </div>
            </div>
        );
    return (
        <div className={style.default}>
            <h1>휴지통</h1>
            <div className={style.trashs}>
                {trashList.map((workspace, index) => {
                    return (
                        <div key={index} className={style.workspaceWrapper}>
                            <div className={style.deleteDate}>
                                {WORKSPACE_RETENTION_PERIOD - differenceInDaysformat(workspace.deletedAt)}일 남음
                            </div>
                            <div className={cn(objectStyle.bubble, getThemeStyle(workspace.theme))}></div>
                            <div className={style.workspaceName}>{workspace.name}</div>
                            <div className={style.restoration} onClick={() => restoreHandler(workspace.id)}>
                                복구하기
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
