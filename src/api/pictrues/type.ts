/** common response */
export type PictureRes = {
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
    fid: string;
    isFlippedX: boolean;
    isFlippedY: boolean;
    path: string;
    angle: number;
};

/** getPictureAPI */
export type GetPictureReq = {
    workspaceId: string;
    pictureId: string;
};
export type GetPictureRes = PictureRes;

/** deletePictureAPI */
export type DeletePictureReq = {
    workspaceId: string;
    pictureId: string;
};
export type DeletePictureRes = {
    id: string;
};

/** createPictureAPI */
export type CreatePicturePrams = {
    workspaceId: string;
    left: number;
    top: number;
    width: number;
    height: number;
    isFlippedX: boolean;
    isFlippedY: boolean;
    angle: number;
    path: string;
    fid: string;
};
export type CreatePictureReq = {
    top: number;
    left: number;
    width: number;
    height: number;
    isFlippedX: boolean;
    isFlippedY: boolean;
    angle: number; // degree [0, 360)
    path: string;
    fid: string;
};
export type CreatePictureRes = PictureRes;

/** restoreBubbleAPI */
export type RestorePicturePrams = {
    workspaceId: string;
    pictureId: string;
};
export type RestorePictureReq = undefined;
export type RestorePictureRes = {
    id: number;
};
