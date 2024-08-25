import ToggleList from '@/headless/toggleList/ToggleList';
import style from '@/components/explorer/bubbleToggleList/bubble-toggle-list.module.css';
import { cn } from '@/util/cn';
import { ReactComponent as ArrowIcon } from '@/assets/icon/button-right.svg';
import { useRenderer } from '@/objects/renderer/useRenderer';
import { useConfigStore } from '@/store/configStore';
import { useCamera } from '@/objects/camera/useCamera';
import { useLog } from '@/objects/log/useLog';
import { useBubble } from '@/objects/bubble/useBubble';

type BubbleToggleListProps = {
    name: string;
    path: string;
    children: Array<BubbleTreeNode>;
    className?: string;
};

export const BubbleToggleList = ({ name, children, path, className }: BubbleToggleListProps) => {
    const { getCameraView } = useRenderer();
    const { zoomBubble, updateCameraView } = useCamera();
    const { setFocusBubblePath } = useBubble();
    const { pushLog } = useLog();
    const { mode } = useConfigStore((state) => state);
    const zoomAtBubble = (bubblePath: string) => {
        if (mode == 'animate') return;
        const originView = { ...getCameraView() };
        if (bubblePath == '') {
            setFocusBubblePath(undefined);
            const { y: height, x: width } = getCameraView().size;
            const newView = {
                pos: {
                    top: -height / 2,
                    left: -width / 2,
                    width: width,
                    height: height,
                },
                size: {
                    x: width,
                    y: height,
                },
                path: '/',
            };
            updateCameraView(newView, originView.pos);
            pushLog([{ type: 'move', object: originView, options: { newCameraView: newView } }]);
            return;
        }
        setFocusBubblePath(bubblePath);
        const newView = zoomBubble(bubblePath);
        if (newView) pushLog([{ type: 'move', object: originView, options: { newCameraView: newView } }]);
    };
    return (
        <ToggleList className={cn(style.default, className)}>
            {({ open }: { open: boolean }) => (
                <>
                    <ToggleList.Button className={cn(style.title)}>
                        <ArrowIcon className={cn(style.toggleButton, open ? style.rotated : style.idle)} />
                        <span className={cn(style.titleText)} onClick={() => zoomAtBubble(path)}>
                            {name}
                        </span>
                    </ToggleList.Button>
                    <ToggleList.Content>
                        {children.length > 0 &&
                            children.map((child, index) => {
                                if (child.children.length == 0)
                                    return (
                                        <div
                                            key={index}
                                            className={cn(style.title, style.marginLeft16)}
                                            onClick={() => zoomAtBubble(path + '/' + child.name)}
                                        >
                                            {child.name}
                                        </div>
                                    );
                                return (
                                    <BubbleToggleList
                                        key={index}
                                        name={child.name}
                                        children={child.children}
                                        path={path + '/' + child.name}
                                        className={style.marginLeft}
                                    />
                                );
                            })}
                    </ToggleList.Content>
                </>
            )}
        </ToggleList>
    );
};
