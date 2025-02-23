/** common response */
export type CurveRes = {
    id: number;
    position: string;
    bubbleId: number;
    config: PenConfig;
};

/** createCurveAPI */
export type CreateCurveParams = {
    curve: Curve;
    bubbleId: number;
    workspaceId: string;
};
export type CreateCurveReq = {
    position: string; // Base64
    bubbleId: number;
    config: PenConfig;
};
export type CreateCurveRes = CurveRes;

/** updateCurveAPI */
export type UpdateCurveParams = {
    curve: Curve;
    bubbleId: number;
    workspaceId: string;
};
export type UpdateCurveReq = {
    position: string;
    bubbleId: number;
    config: PenConfig;
};
export type UpdateCurveRes = CurveRes;

/** deleteCurveAPI */
export type DeleteCurveReq = {
    curveId: number;
    workspaceId: string;
};
export type DeleteCurveRes = {
    curveId: number;
};

/** restoreCurveAPI */
export type RestoreCurveReq = {
    curveId: number;
    workspaceId: string;
};
export type RestoreCurveRes = CurveRes;
