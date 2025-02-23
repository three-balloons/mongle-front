/** common response */
export type ShapeRes =
    | {
          type: 'curve';
          id: number;
          position: string;
          config: PenConfig;
      }
    | {
          type: 'picture';
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
      }
    | {
          type: 'pdf';
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
export type BubbleRes = {
    id: number;
    path: string;
    name: string;
    top: number;
    left: number;
    width: number;
    height: number;
    shapes: ShapeRes[];
};

/** getBubblesAPI */
export type GetBubbleReq = {
    workspaceId: string;
    bubbleId: number;
    depth?: number;
};
export type GetBubbleRes = BubbleRes[];

/** getAllBubblesAPI */
export type GetAllBubbleReq = {
    workspaceId: string;
    depth?: number;
};

export type GetAllBubbleRes = BubbleRes[];

/** deleteBubbleAPI */
export type DeleteBubbleReq = {
    workspaceId: string;
    bubbleId: number;
};
export type DeleteBubbleRes = {
    id: number;
};

/** createBubbleAPI */
export type CreateBubbleReq = {
    workspaceId: string;
    path: string;
    name: string;
    top: number;
    left: number;
    height: number;
    width: number;
};
export type CreateBubblePrams = {
    path: string;
    name: string;
    top: number;
    left: number;
    height: number;
    width: number;
};
export type CreateBubbleRes = BubbleRes;

/** updateBubbleAPI */
export type UpdateBubbleReq = {
    newPath?: string;
    name?: string;
    top?: number;
    left?: number;
    height?: number;
    width?: number;
};
export type UpdateBubblePrams = {
    workspaceId: string;
    bubbleId: number;
    newPath?: string;
    name?: string;
    top?: number;
    left?: number;
    height?: number;
    width?: number;
};
export type UpdateBubbleRes = BubbleRes;

/** restoreBubbleAPI */
export type RestoreBubbleParams = {
    workspaceId: string;
    bubbleId: string;
};
export type RestoreBubbleReq = undefined;
export type RestoreBubbleRes = {
    id: string;
};
