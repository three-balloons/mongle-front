import Select from '@/headless/select/Select';
import style from '@/components/select/toolSelect/tool-select.module.css';
import { useConfigStore } from '@/store/configStore';
import { cn } from '@/util/cn';
import { ReactComponent as PenIcon } from '@/assets/icon/pen.svg';
import { ReactComponent as HandIcon } from '@/assets/icon/hand.svg';
import { ReactComponent as EraserIcon } from '@/assets/icon/eraser.svg';
import { ReactComponent as AddBubbleIcon } from '@/assets/icon/plus.svg';
import { ReactComponent as SelectIcon } from '@/assets/icon/select.svg';
import { ReactComponent as PictureIcon } from '@/assets/icon/picture.svg';
import { EraserModal } from '@/components/select/toolSelect/EraserModal';
import { useTutorial } from '@/components/tutorial/useTutorial';
import { ChangeEvent, useRef } from 'react';
import { OFF_SCREEN_HEIGHT, OFF_SCREEN_WIDTH } from '@/util/constant';
import { usePicture } from '@/objects/picture/usePicture';
import { useCursorStore } from '@/store/cursorStore';
import { uploadFileAPI } from '@/api/files/file';
import { APIException } from '@/api/exceptions';

export const ToolSelect = () => {
    const { setMode, mode } = useConfigStore((state) => state);
    const setCursor = useCursorStore((state) => state.setCursor);
    const { addBubbleIconRef, penIconRef, eraserIconRef, handIconRef } = useTutorial();
    const { setCreatingPicture } = usePicture();

    const pictureInputRef = useRef<HTMLInputElement>(null);

    const handlePictureButtonClick = () => {
        if (!pictureInputRef.current) return;
        pictureInputRef.current.click();
    };

    const hanldeAddPicture = async ({ target }: ChangeEvent<HTMLInputElement>) => {
        const file = target?.files?.[0];
        if (file === undefined) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { fid } = await uploadFileAPI(formData);

            const image = new Image();
            const imageUrl = URL.createObjectURL(file);
            image.src = imageUrl;
            const offCanvas = new OffscreenCanvas(OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT);
            image.addEventListener(
                'load',
                () => {
                    const offContext = offCanvas.getContext('2d');
                    offContext?.drawImage(image, 0, 0, OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT);
                },
                { once: true },
            );
            setCreatingPicture(image, offCanvas, fid);
        } catch (e) {
            if (e instanceof APIException) {
                // TODO
                console.error(`파일 저장에 실패했습니다 ${e}`);
                return;
            } else {
                // TODO
                console.error(e);
            }
        }
    };

    return (
        <Select className={style.default} initialOpen disableClose>
            <Select.Content className={style.content}>
                <div ref={handIconRef}>
                    <Select.Option
                        className={cn(style.option, mode === 'move' && style.activeOption)}
                        value="move"
                        onSelect={() => {
                            setMode('move');
                            setCursor('move');
                        }}
                    >
                        <HandIcon className={style.icon} />
                    </Select.Option>
                </div>
                <div ref={penIconRef}>
                    <Select.Option
                        className={cn(style.option, mode === 'draw' && style.activeOption)}
                        value="draw"
                        onSelect={() => {
                            setMode('draw');
                            setCursor('pen');
                        }}
                    >
                        <PenIcon className={style.icon} />
                    </Select.Option>
                </div>
                <div ref={eraserIconRef}>
                    <Select.Option
                        className={cn(style.option, mode === 'erase' && style.activeOption)}
                        value="erase"
                        onSelect={() => {
                            setMode('erase');
                            setCursor('eraser');
                        }}
                    >
                        {mode == 'erase' ? <EraserModal /> : <EraserIcon className={style.icon} />}
                    </Select.Option>
                </div>
                <div ref={addBubbleIconRef}>
                    <Select.Option
                        className={cn(style.option, mode === 'bubble' && style.activeOption)}
                        value="bubble"
                        onSelect={() => {
                            setMode('bubble');
                            setCursor('add');
                        }}
                    >
                        <AddBubbleIcon className={style.icon} />
                    </Select.Option>
                </div>
                <Select.Option
                    className={cn(style.option, mode === 'edit' && style.activeOption)}
                    value="edit"
                    onSelect={() => {
                        setMode('edit');
                        setCursor('edit');
                    }}
                >
                    <SelectIcon className={style.icon} />
                </Select.Option>
                <Select.Option
                    className={`${style.option} ${mode === 'picture' ? style.activeOption : ''}`}
                    value="picture"
                    onSelect={() => {
                        handlePictureButtonClick();
                        setMode('picture');
                        setCursor('edit');
                    }}
                >
                    <PictureIcon className={style.icon} />
                    <input
                        ref={pictureInputRef}
                        type="file"
                        id="file-input"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={hanldeAddPicture}
                    />
                </Select.Option>
            </Select.Content>
        </Select>
    );
};
