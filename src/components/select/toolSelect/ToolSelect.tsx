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
import { ReactComponent as PdfIcon } from '@/assets/icon/pdf.svg';
import { EraserModal } from '@/components/select/toolSelect/EraserModal';
import { useTutorial } from '@/components/tutorial/useTutorial';
import { ChangeEvent, useRef } from 'react';
import { OFF_SCREEN_HEIGHT, OFF_SCREEN_WIDTH } from '@/util/constant';
import { usePicture } from '@/objects/picture/usePicture';
import { useCursorStore } from '@/store/cursorStore';
import { workerFactory } from '@/util/worker/wokerFactory';
import { blobToArrayBuffer } from '@/util/rawData';
import { uploadFileAPI } from '@/api/files/file';
import { APIException } from '@/api/exceptions';
import { usePdf } from '@/objects/pdf/usePdf';

export const ToolSelect = () => {
    const { setMode, mode } = useConfigStore((state) => state);
    const setCursor = useCursorStore((state) => state.setCursor);
    const { addBubbleIconRef, penIconRef, eraserIconRef, handIconRef } = useTutorial();
    const { setCreatingPicture } = usePicture();
    const { setCreatingPdf } = usePdf();
    const pictureInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    const handlePictureButtonClick = () => {
        if (!pictureInputRef.current) return;
        pictureInputRef.current.click();
    };

    const handlePdfButtonClick = () => {
        if (!pdfInputRef.current) return;
        pdfInputRef.current.click();
    };

    const hanldeAddPicture = ({ target }: ChangeEvent<HTMLInputElement>) => {
        const file = target?.files?.[0];
        if (file === undefined) return;
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
        setCreatingPicture(image, offCanvas);
    };

    const hanldeAddPdf = async ({ target }: ChangeEvent<HTMLInputElement>) => {
        const file = target?.files?.[0];
        if (file === undefined) return;
        console.log(file.size, file.type, file.name);

        const data = await blobToArrayBuffer(file);

        const workerInfo = workerFactory.createWorker('pdf');
        if (!workerInfo) return;
        const { workerId, worker } = workerInfo;

        worker.postMessage({ command: 'save', pdf: { name: file.name, data: data } });
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { fid } = await uploadFileAPI(formData);
            const offCanvas = new OffscreenCanvas(OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT);
            setCreatingPdf(fid, workerId, file.name, offCanvas);
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

        // 데이터 읽기 요청
        // worker.postMessage({ command: 'read', fileName: 'myPdfFile.pdf' });

        // worker.onmessage = (event) => {
        //     const message = event.data;
        //     if (message.command === 'saveResult') {
        //         console.log('Save result:', message.success);
        //     } else if (message.command === 'readResult') {
        //         if (message.arrayBuffer) {

        //             const url = window.URL.createObjectURL(message.arrayBuffer);
        //             const a = document.createElement('a');
        //             a.href = url;
        //             a.download = message.name;
        //             document.body.appendChild(a);
        //             a.click();
        //             window.URL.revokeObjectURL(url);
        //         } else {
        //             console.log('PDF file not found.');
        //         }
        //     }
        // };
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
                        id="picture-input"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={hanldeAddPicture}
                    />
                </Select.Option>
                <Select.Option
                    className={`${style.option} ${mode === 'pdf' ? style.activeOption : ''}`}
                    value="pdf"
                    onSelect={() => {
                        handlePdfButtonClick();
                        setMode('pdf');
                        setCursor('edit');
                    }}
                >
                    <PdfIcon className={style.icon} />
                    <input
                        ref={pdfInputRef}
                        type="file"
                        id="pdf-input"
                        style={{ display: 'none' }}
                        accept="application/pdf"
                        onChange={hanldeAddPdf}
                    />
                </Select.Option>
            </Select.Content>
        </Select>
    );
};
