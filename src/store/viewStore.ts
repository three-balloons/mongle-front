import { createStore } from '@/store/store';
import { WORKSPACE_INNER_HALF_SIZE } from '@/util/constant';

type State = {
    cameraView: ViewCoord;
};

type Action = {
    setCameraView: (cameraView: ViewCoord) => void;
};
type Store = State & Action;

export const useViewStore = createStore<Store>((set) => ({
    cameraView: {
        pos: {
            top: -(WORKSPACE_INNER_HALF_SIZE / 2),
            left: -(WORKSPACE_INNER_HALF_SIZE / 2),
            width: WORKSPACE_INNER_HALF_SIZE,
            height: WORKSPACE_INNER_HALF_SIZE,
        },
        path: '/',
        size: { x: WORKSPACE_INNER_HALF_SIZE, y: WORKSPACE_INNER_HALF_SIZE },
    },
    setCameraView: (cameraView) => set({ cameraView: cameraView }),
}));
