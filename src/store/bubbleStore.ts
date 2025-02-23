import { createStore } from '@/store/store';
import {
    BUBBLE_BORDER_WIDTH,
    RENDERED_FONT_SIZE,
    UNNAMED,
    WORKSPACE_INNER_HALF_SIZE,
    WORKSPACE_INNER_SIZE,
} from '@/util/constant';
import {
    bubble2globalWithRect,
    global2bubbleWithRect,
    global2bubbleWithVector2D,
    rect2View,
} from '@/util/coordSys/conversion';
import { getParentPath, getPathDepth, getPathDifferentDepth, pathToList } from '@/util/path/path';
import { isCollisionPointWithRect } from '@/util/shapes/collision';

type State = {
    workspaceId: string | undefined;
    bubbleLabel: number; // bubbleNum
    focusBubblePath: string | undefined;
    nextBubbleId: number;
    bubbleTreeRoot: BubbleTreeNode;
};

type Action = {
    /* TODO new */
    setFocusBubblePath: (path: string | undefined) => void;
    getFocusBubblePath: () => string | undefined;
    findBubble: (id: number) => Bubble | undefined;
    findBubbleByPath: (path: string) => Bubble | undefined;
    getAndDecreaseNextBubbleId: () => number;
    clearAllBubbles: () => void;
    getBubbles: (node?: BubbleTreeNode) => Array<Bubble>;
    addBubble: (bubble: Bubble, childrenIds: Array<number>) => void;
    getBubbleLabel: () => number;
    setBubbleLabel: (label: number) => void;
    removeBubble: (bubble: Bubble) => void;
    updateBubble: (id: number, bubble: Bubble) => void;
    identifyTouchRegion: (
        cameraView: ViewCoord,
        position: Vector2D,
    ) => { region: 'inside' | 'outside' | 'border' | 'name'; bubble: Bubble | undefined };

    /* 좌표 변환 */
    descendant2child: (descendant: Bubble, ancestorPath: string) => Bubble | undefined;
    getRatioWithCamera: (bubble: Bubble, cameraView: ViewCoord) => number | undefined;
    view2BubbleWithVector2D: (pos: Vector2D, cameraView: ViewCoord, bubblePath: string) => Vector2D;
    view2BubbleWithRect: (rect: Rect, cameraView: ViewCoord, bubblePath: string) => Rect;

    /* 버블 트리 */
    getDescendantBubbles: (path: string) => Array<Bubble>;
    getChildBubbles: (path: string) => Array<Bubble>;
    addBubblesInNode: (bubbbles: Array<Bubble>) => void;
};
type Store = State & Action;

export const useBubbleStore = createStore<Store>((set, get) => ({
    bubbleLabel: 0,
    focusBubblePath: undefined,
    nextBubbleId: -1,
    bubbleTreeRoot: {
        name: UNNAMED,
        children: [],
        this: {} as Bubble,
        parent: undefined,
    },

    workspaceId: undefined,
    setFocusBubblePath: (path) => set({ focusBubblePath: path }),
    getFocusBubblePath: () => get().focusBubblePath,
    clearAllBubbles: () =>
        set({
            bubbleTreeRoot: {
                name: get().workspaceId ?? UNNAMED,
                children: [],
                this: {} as Bubble,
                parent: undefined,
            },
        }),
    getBubbles: (node?: BubbleTreeNode) => {
        const { bubbleTreeRoot, getBubbles } = get();
        const currentNode: BubbleTreeNode = node ? node : bubbleTreeRoot;
        let ret: Array<Bubble> = [];
        if (currentNode.children.length == 0) {
            if (currentNode == bubbleTreeRoot) return [];
            else return [currentNode.this];
        }
        currentNode.children.forEach((child) => {
            if (currentNode != bubbleTreeRoot && currentNode.this) ret = [currentNode.this, ...ret];
            ret = [...ret, ...getBubbles(child)];
        });
        return ret;
    },
    addBubble: (bubble: Bubble, childrenIds: Array<number>) => {
        const { bubbleTreeRoot } = get();
        const pathList = pathToList(bubble.path);
        let currentNode: BubbleTreeNode | undefined = bubbleTreeRoot;
        let prevNode: BubbleTreeNode | undefined;
        for (const name of pathList) {
            if (name == '') continue;
            if (currentNode == undefined) return bubbleTreeRoot; // 비정상적인 경우(해당 경로가 없음)
            prevNode = currentNode;
            currentNode = currentNode.children.find((node) => node.name === name);
        }
        if (currentNode === undefined) {
            const newNode: BubbleTreeNode = {
                name: pathList[pathList.length - 1],
                children: [],
                this: bubble,
                parent: prevNode,
            };
            if (prevNode?.children) {
                newNode.this = bubble;
                newNode.children = prevNode.children.filter((child) => {
                    // const parentPath = getParentPath(bubble.path);
                    // const path = parentPath === '/' ? '/' + child.name : parentPath + '/' + child.this.id;
                    return childrenIds.find((childId) => childId == child.this.id);
                });
                prevNode.children = prevNode.children.filter((child) => {
                    // const parentPath = getParentPath(bubble.path);
                    // const path = parentPath === '/' ? '/' + child.name : parentPath + '/' + child.name;
                    const isNewNodeChild = childrenIds.find((childId) => childId == child.this.id);
                    if (isNewNodeChild && child.this) {
                        const parentBubble = prevNode.this;
                        const pos = global2bubbleWithRect(
                            bubble2globalWithRect(child.this as Rect, parentBubble),
                            bubble2globalWithRect(newNode.this as Rect, parentBubble),
                        );
                        // refernce 유지
                        child.this.top = pos.top;
                        child.this.left = pos.left;
                        child.this.height = pos.height;
                        child.this.width = pos.width;
                    }
                    return !isNewNodeChild;
                });
                prevNode.children.push(newNode);
                // 하위의 path 업데이트
                const updateDescendantPath = (node: BubbleTreeNode) => {
                    if (!node.this) return;
                    const path = node.this.path;
                    for (const child of node.children) {
                        if (child.this) {
                            child.this.path = path + '/' + child.this.name;
                            updateDescendantPath(child);
                        }
                    }
                };
                updateDescendantPath(newNode);
            }
        }
        set({ bubbleTreeRoot: { ...bubbleTreeRoot } });
    },
    getBubbleLabel: () => get().bubbleLabel, // TODO remove
    setBubbleLabel: (label: number) => set({ bubbleLabel: label }), // TODO remove
    removeBubble: (bubble: Bubble) => {
        const { bubbleTreeRoot } = get();
        const pathList = pathToList(bubble.path);
        let currentNode: BubbleTreeNode | undefined = bubbleTreeRoot;
        let prevNode: BubbleTreeNode | undefined;
        for (const name of pathList) {
            if (name == '') continue;
            if (currentNode == undefined) return; // 비정상적인 경우(해당 경로가 없음)
            prevNode = currentNode;
            currentNode = currentNode.children.find((node) => node.name === name);
        }
        if (prevNode && currentNode) {
            const parentPath = prevNode.this?.path ?? '/';
            currentNode.children.forEach((child) => {
                const pos = global2bubbleWithRect(
                    bubble2globalWithRect(child.this as Rect, currentNode.this),
                    prevNode.this,
                );
                if (child.this) {
                    child.this.top = pos.top;
                    child.this.left = pos.left;
                    child.this.height = pos.height;
                    child.this.width = pos.width;
                    child.this.path = parentPath === '/' ? parentPath + child.name : parentPath + '/' + child.name;
                }
            });
            prevNode.children = [...prevNode.children.filter((child) => child != currentNode), ...currentNode.children];
            const updateDescendantPath = (node: BubbleTreeNode) => {
                const path = node.this?.path ?? '';
                for (const child of node.children) {
                    if (child.this) {
                        child.this.path = path + '/' + child.this.name;
                        updateDescendantPath(child);
                    }
                }
            };
            updateDescendantPath(prevNode);
        }
        set({ bubbleTreeRoot: { ...bubbleTreeRoot } });
    },
    /**
     * path에 해당하는 bubble을 찾아 update(주소 변환 X)
     * @param path 변환시킬 bubble의 path
     * @param bubble 변환시킬 내용
     */
    updateBubble: (id: number, bubble: Bubble) => {
        const { findBubble, getChildBubbles, removeBubble, addBubble } = get();
        const remove = findBubble(id);
        let childrenIds: number[] = [];
        if (remove) {
            childrenIds = getChildBubbles(remove.path).map((child) => child.id);
            removeBubble(remove);
        }
        addBubble(bubble, childrenIds);
    },
    findBubbleByPath: (path: string) => {
        const { getBubbles } = get();
        if (path == '/') return undefined;
        return getBubbles().find((bubble) => bubble.path == path);
    },
    findBubble: (id: number) => {
        const { getBubbles } = get();
        return getBubbles().find((bubble) => bubble.id == id);
    },
    getAndDecreaseNextBubbleId: () => {
        const { nextBubbleId } = get();
        const ret = nextBubbleId;
        set({ nextBubbleId: nextBubbleId - 1 });
        return ret;
    },
    /**
     * 버블 안인지 밖인지 테두리인지 판단하는 함수
     */
    // TODO renaming
    identifyTouchRegion: (cameraView: ViewCoord, position: Vector2D) => {
        const { getBubbles, descendant2child } = get();
        const bubbles = getBubbles();
        bubbles.sort((a, b) => getPathDepth(b.path) - getPathDepth(a.path));
        for (const bubble of bubbles) {
            const bubbleView = descendant2child(bubble, cameraView.path);
            if (bubbleView) {
                const rect = rect2View(
                    {
                        top: bubbleView.top,
                        left: bubbleView.left,
                        width: bubbleView.width,
                        height: bubbleView.height,
                    },
                    cameraView,
                );
                if (
                    isCollisionPointWithRect(position, {
                        top: rect.top - RENDERED_FONT_SIZE,
                        left: rect.left,
                        width: bubble.nameSizeInCanvas,
                        height: RENDERED_FONT_SIZE,
                    })
                ) {
                    return {
                        region: 'name',
                        bubble: bubble,
                    };
                } else if (
                    isCollisionPointWithRect(position, {
                        top: rect.top - BUBBLE_BORDER_WIDTH,
                        left: rect.left - BUBBLE_BORDER_WIDTH,
                        width: rect.width + BUBBLE_BORDER_WIDTH * 2,
                        height: rect.height + BUBBLE_BORDER_WIDTH * 2,
                    })
                )
                    if (
                        isCollisionPointWithRect(position, {
                            top: rect.top + BUBBLE_BORDER_WIDTH,
                            left: rect.left + BUBBLE_BORDER_WIDTH,
                            width: rect.width - BUBBLE_BORDER_WIDTH * 2,
                            height: rect.height - BUBBLE_BORDER_WIDTH * 2,
                        })
                    )
                        return {
                            region: 'inside',
                            bubble: bubble,
                        };
                    else
                        return {
                            region: 'border',
                            bubble: bubble,
                        };
            }
        }
        return {
            region: 'outside',
            bubble: undefined,
        };
    },
    getDescendantBubbles: (path: string) => {
        const { bubbleTreeRoot } = get();
        const pathList = pathToList(path);
        let currentNode: BubbleTreeNode | undefined = bubbleTreeRoot;
        for (const name of pathList) {
            if (name == '') continue;
            currentNode = currentNode.children.find((node) => node.name === name);
            if (currentNode == undefined) return []; // 비정상적인 경우(해당 경로가 없음)
        }
        const findDescendants = (node: BubbleTreeNode): Array<Bubble> => {
            const childrenBubbles = node.children
                .map((child) => child.this)
                .filter((bubble): bubble is Bubble => bubble !== undefined);
            const descendants = node.children.flatMap((child) => findDescendants(child));
            return [...childrenBubbles, ...descendants];
        };
        return findDescendants(currentNode);
    },
    getChildBubbles: (path: string) => {
        const { bubbleTreeRoot, findBubbleByPath } = get();
        const bubble = findBubbleByPath(path);
        if (!bubble) return [];
        const pathList = pathToList(bubble.path);
        let currentNode: BubbleTreeNode | undefined = bubbleTreeRoot;
        for (const name of pathList) {
            if (name == '') continue;
            currentNode = currentNode.children.find((node) => node.name === name);
            if (currentNode == undefined) return []; // 비정상적인 경우(해당 경로가 없음)
        }
        return currentNode.children
            .map((child) => child.this)
            .filter((bubble): bubble is Bubble => bubble !== undefined);
    },

    /* 좌표 변환 */
    /**
     * 자손버블좌표계에서 자식버블좌표계로 변환
     *
     * 사용처: 버블 이동, 내부의 요소를 cameraView로 변환하기 위한 사전 작업
     *
     * TODO: 최적화, useBubble에 의존하고 있음 => 의존성 제거 혹은 계산부분 분리 필요
     */
    descendant2child: (descendant: Bubble, ancestorPath: string) => {
        const { findBubbleByPath } = get();
        const depth = getPathDifferentDepth(ancestorPath, descendant.path);
        if (depth == undefined) return undefined;
        if (depth <= 0) return undefined; // depth가 0 이하인 경우 render X
        if (depth == 1)
            return descendant; // descendant is child
        else if (depth > 1) {
            const ret: Bubble = { ...descendant };
            let parent: Bubble | undefined = ret;
            for (let i = 1; i < depth; i++) {
                const path = getParentPath(ret.path);
                if (path == undefined) return undefined;
                parent = findBubbleByPath(path);
                if (parent == undefined) return undefined;
                ret.path = parent.path;
                ret.top = (parent.height * (WORKSPACE_INNER_HALF_SIZE + ret.top)) / WORKSPACE_INNER_SIZE + parent.top;
                ret.left = (parent.width * (WORKSPACE_INNER_HALF_SIZE + ret.left)) / WORKSPACE_INNER_SIZE + parent.left;
                ret.height = (parent.height * ret.height) / WORKSPACE_INNER_SIZE;
                ret.width = (parent.width * ret.width) / WORKSPACE_INNER_SIZE;
            }
            return ret;
        }
    },
    /**
     * texture minification을 위한 비율 계산
     * 1보다 크면 bubble이 더 큼, 작으면 camera가 더 큼
     * alising이 필요하면 undefined 리턴?
     * renaming? : getRatioWithCameraForRendering
     */
    getRatioWithCamera: (bubble: Bubble, cameraView: ViewCoord) => {
        const { findBubbleByPath } = get();
        const depth = getPathDifferentDepth(cameraView.path, bubble.path);
        if (depth == undefined) return undefined;
        // TODO 0 이하의 경우 고려 안함
        if (depth == 0) return 200 / cameraView.pos.width;
        if (depth == 1) return bubble.width / cameraView.pos.width;
        else if (depth > 1) {
            let path: string | undefined = bubble.path;
            let ret = bubble.width;

            let parent: Bubble | undefined;
            for (let i = 1; i < depth; i++) {
                path = getParentPath(path);
                if (path == undefined) return undefined;
                parent = findBubbleByPath(path);
                if (parent == undefined) return undefined;
                ret = (ret * parent.width) / 200;
            }
            ret = ret / cameraView.pos.width;
            return ret;
        }
    },
    /**
     * 실제 View 위의 좌표를 bubble 내의 좌표로 변환
     */
    view2BubbleWithVector2D: (pos: Vector2D, cameraView: ViewCoord, bubblePath: string) => {
        const { findBubbleByPath, descendant2child } = get();
        let ret = { ...pos };

        const bubble = findBubbleByPath(bubblePath);
        if (bubble) {
            const bubbleView = descendant2child(bubble, cameraView.path);
            ret = global2bubbleWithVector2D(ret, bubbleView);
        }
        return ret;
    },
    /**
     * 실제 View 위의 좌표를 bubble 내의 좌표로 변환
     */
    view2BubbleWithRect: (rect: Rect, cameraView: ViewCoord, bubblePath: string) => {
        const { findBubbleByPath, descendant2child } = get();
        let ret = { ...rect };

        const bubble = findBubbleByPath(bubblePath);
        if (bubble) {
            const bubbleView = descendant2child(bubble, cameraView.path);
            ret = global2bubbleWithRect(ret, bubbleView);
        }
        return ret;
    },
    // TODO root 외 중간에 들어오는 경우도 가능하도록 설정
    addBubblesInNode: (bubbles: Array<Bubble>) => {
        const { bubbleTreeRoot: oldTreeRoot, bubbleLabel } = get();

        let bubbleNum = bubbleLabel;
        const workspaceName = oldTreeRoot.name;
        // bubble과 bubbleTree 간 동기화 문제
        // 임시로 사용하는 함수
        const addBubbleInitTree = (bubbleTreeRoot: BubbleTreeNode, bubble: Bubble) => {
            const pathList = pathToList(bubble.path);
            let currentNode: BubbleTreeNode | undefined = bubbleTreeRoot;
            let prevNode: BubbleTreeNode | undefined;
            for (const name of pathList) {
                if (name == '') continue;
                if (currentNode == undefined) break;
                prevNode = currentNode;
                currentNode = currentNode.children.find((node) => node.name === name);
            }
            if (currentNode === undefined) {
                const newNode: BubbleTreeNode = {
                    name: pathList[pathList.length - 1],
                    children: [],
                    this: bubble,
                    parent: prevNode,
                };
                if (prevNode?.children) {
                    newNode.this = bubble;
                    newNode.children = [];
                    prevNode.children.push(newNode);
                }
            }
        };

        const newBubbleTree: BubbleTreeNode = {
            name: workspaceName,
            children: [],
            this: {} as Bubble,
            parent: undefined,
        };
        bubbleNum = 0;
        bubbles.forEach((bubble) => {
            if (bubble) {
                if (bubble.name) {
                    const regex = /^mongle\s(\d+)$/;
                    const match = bubble.name.match(regex);

                    bubbleNum = match ? Math.max(bubbleNum, Number(match[1]) + 1) : bubbleNum;
                }
                addBubbleInitTree(newBubbleTree, bubble);
            }
            set({ bubbleLabel: bubbleNum });
        });
        set({ bubbleTreeRoot: { ...newBubbleTree } });
    },
}));
