// TODO workspace response will be included userId

/** getWorkspaceAPI */
export type GetWorkspaceParams = {
    workspaceId: string;
};
export type GetWorkspaceRes = Workspace;

/** getAllWorkspaceAPI */
export type GetAllWorkspaceRes = Array<Workspace>;

/** updateWorkspaceAPI */
export type UpdateWorkspacePrams = {
    workspaceId: string;
    name: string;
    theme: string;
};
export type UpdateWorkspaceReq = {
    name: string;
    theme: string;
};
export type UpdateWorkspaceRes = Workspace;

/** deleteWorkspaceAPI */
export type DeleteWorkspaceReq = {
    workspaceId: string;
};
export type DeleteWorkspaceRes = {
    id: string;
};

/** createWorkspaceAPI */
export type CreateWorkspaceReq = {
    name: string;
    theme: string;
};
export type CreateWorkspaceRes = Workspace;

/** getDeletedWorkspaceAPI */
export type GetDeletedWorkspaceRes = Array<Workspace>;

/** restoreWorkspaceAPI */
export type RestoreWorkspaceParams = {
    workspaceId: string;
};
export type RestoreWorkspaceReq = Record<string, never>;
export type RestoreWorkspaceRes = {
    id: string;
};
