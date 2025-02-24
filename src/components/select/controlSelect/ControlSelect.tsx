import Select from '@/headless/select/Select';
import style from '@/components/select/controlSelect/control-select.module.css';
import { cn } from '@/util/cn';
import { ReactComponent as ShrinkIcon } from '@/assets/icon/shrink.svg';
import { ReactComponent as EnlargeIcon } from '@/assets/icon/enlarge.svg';
import { ReactComponent as UndoIcon } from '@/assets/icon/undo.svg';
import { ReactComponent as RedoIcon } from '@/assets/icon/redo.svg';
import { useViewStore } from '@/store/viewStore';
import { useLog } from '@/objects/log/useLog';
import { useRenderer } from '@/objects/renderer/useRenderer';
import { useConfigStore } from '@/store/configStore';
import { useCamera } from '@/objects/camera/useCamera';
import { useBubbleStore } from '@/store/bubbleStore';
import { useLogStore } from '@/store/useLogStore';
import { WORKSPACE_INNER_HALF_SIZE, WORKSPACE_INNER_SIZE } from '@/util/constant';

export const ControlSelect = () => {
    const { cameraView } = useViewStore((state) => state);
    const { mode } = useConfigStore((state) => state);
    const { undo, redo } = useLog();
    const getIsUndoAvailable = useLogStore((state) => state.getIsUndoAvailable);
    const getIsRedoAvailable = useLogStore((state) => state.getIsRedoAvailable);
    const setFocusBubblePath = useBubbleStore((state) => state.setFocusBubblePath);
    const { reRender } = useRenderer();
    const { updateCameraView } = useCamera();
    // TODO: 투터치 인터페이스 구현(줌/아웃 가능)
    const resizeView = (intensity: number) => {
        setFocusBubblePath(undefined);
        updateCameraView(
            {
                ...cameraView,
                pos: {
                    left: cameraView.pos.left + (cameraView.pos.width * intensity) / WORKSPACE_INNER_SIZE,
                    top: cameraView.pos.top + (cameraView.pos.height * intensity) / WORKSPACE_INNER_SIZE,
                    width: (cameraView.pos.width * (WORKSPACE_INNER_HALF_SIZE - intensity)) / WORKSPACE_INNER_HALF_SIZE,
                    height:
                        (cameraView.pos.height * (WORKSPACE_INNER_HALF_SIZE - intensity)) / WORKSPACE_INNER_HALF_SIZE,
                },
            },
            { ...cameraView },
        );
    };
    // addCameraUpdateLog(originView, newView);
    //         commitLog();

    return (
        <Select className={style.default} initialOpen disableClose>
            <Select.Content className={style.content}>
                <div className={style.resize}>
                    <Select.Option
                        className={cn(style.option, style.large)}
                        value={<ShrinkIcon className={style.large} />}
                        onSelect={() => {
                            if (mode == 'animate') return;
                            resizeView(-200);
                        }}
                    >
                        <ShrinkIcon className={style.large} />
                    </Select.Option>
                    <Select.Option
                        className={cn(style.option, style.large)}
                        value={<EnlargeIcon className={style.large} />}
                        onSelect={() => {
                            if (mode == 'animate') return;
                            resizeView(200);
                        }}
                    >
                        <EnlargeIcon className={style.large} />
                    </Select.Option>
                    <Select.Option
                        className={cn(style.option, style.large)}
                        value={
                            <UndoIcon className={cn(style.large, !getIsUndoAvailable() && style.disabled)}></UndoIcon>
                        }
                        onSelect={() => {
                            if (!getIsUndoAvailable()) return;
                            if (mode == 'animate') return;
                            undo();
                            reRender();
                        }}
                    >
                        {/* <Icon src={undoIcon} className={cn(style.large)} /> */}
                        <UndoIcon className={cn(style.large, !getIsUndoAvailable() && style.disabled)} />
                    </Select.Option>
                    <Select.Option
                        className={cn(style.option, style.large)}
                        value={<RedoIcon className={cn(style.large, !getIsRedoAvailable() && style.disabled)} />}
                        onSelect={() => {
                            if (!getIsRedoAvailable()) return;
                            if (mode == 'animate') return;
                            redo();
                            reRender();
                        }}
                    >
                        <RedoIcon className={cn(style.large, !getIsRedoAvailable() && style.disabled)} />
                    </Select.Option>
                </div>
            </Select.Content>
        </Select>
    );
};
