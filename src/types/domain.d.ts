/**
 * 비즈니스 로직에서 필요한 객체 타입
 */

// TODO: penConfig 추가할 것
interface Curve {
    type: 'curve';
    position: Curve2D;
    config: PenConfig;
    id: number;
}

interface Picture extends Rect {
    type: 'picture';
    offScreen: OffscreenCanvas;
    image: HTMLImageElement;
    isFlippedX: boolean;
    isFlippedY: boolean;
}

interface PDF extends Rect {
    type: 'pdf';
    offScreen: OffscreenCanvas;
    image: HTMLImageElement;
    isFlippedX: boolean;
    isFlippedY: boolean;
}

type Shape = Picture | Curve | PDF;

interface Bubble extends Rect {
    id: number;
    path: string;
    name: string;
    // curves: Array<Curve>;
    // pictures?: Array<Picture>;
    shapes: Array<Shape>; // TODO objects must be included
    nameSizeInCanvas: number; // 캔버스에서 나타나는 이름의 크기, 프론트에서만 사용
}

type BubbleTreeNode = {
    name: string;
    children: Array<BubbleTreeNode>;
    parent: BubbleTreeNode | undefined;
    this: Bubble; //| undefined;
};

interface Workspace {
    id: string;
    name: string;
    theme: Theme;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

interface User {
    id: number;
    provider: Provider;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    email?: string;
}
