import { createContext, useRef } from 'react';

export type PdfContextProps = {
    setCreatingPdf: (fid: string, workerId: number, pdfName: string, offScreen: OffscreenCanvas) => void;
    getCreatingPdf: () => { fid: string; offScreen: OffscreenCanvas } | undefined;

    // TODO selected는 shape로 통합시키기기
    setSelectedPdfs: (pdfs: PDF[]) => void;
    getSelectedPdfs: () => PDF[];
};

export const PdfContext = createContext<PdfContextProps | undefined>(undefined);

type PdfProviderProps = {
    children: React.ReactNode;
};

export const PdfProvider: React.FC<PdfProviderProps> = ({ children }) => {
    const creatingPdfRef = useRef<
        { fid: string; offScreen: OffscreenCanvas; workerId: number; pdfName: string } | undefined
    >(undefined);
    const selectedPdfsRef = useRef<PDF[]>([]);
    const setCreatingPdf = (fid: string, workerId: number, pdfName: string, offScreen: OffscreenCanvas) => {
        creatingPdfRef.current = { fid: fid, offScreen: offScreen, workerId: workerId, pdfName: pdfName };
    };

    const getCreatingPdf = () => {
        return creatingPdfRef.current;
    };

    const setSelectedPdfs = (pdfs: PDF[]) => {
        selectedPdfsRef.current = [...pdfs];
    };

    const getSelectedPdfs = () => {
        return selectedPdfsRef.current;
    };

    return (
        <PdfContext.Provider
            value={{
                setCreatingPdf,
                getCreatingPdf,
                setSelectedPdfs,
                getSelectedPdfs,
            }}
        >
            {children}
        </PdfContext.Provider>
    );
};
