// TODO: penConfig 추가할 것
interface Curve {
    position: Curve2D;
    path: string;
    config: PenConfig;
    isVisible: boolean;
    id: number | undefined;
}

interface Bubble extends Rect {
    path: string;
    curves: Array<Curve>;
    children: Array<Bubble>;
    parent: Bubble | undefined;
    isBubblized: boolean;
    isVisible: boolean;
}

type BubbleTreeNode = {
    name: string;
    children: Array<BubbleTreeNode>;
    this: Bubble | undefined;
};

interface Workspace {
    id: string;
    name: string;
    theme: Theme;
}
