export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(buffer);
    const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binaryString);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array.buffer;
};

export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target && event.target.result instanceof ArrayBuffer) {
                resolve(event.target.result);
            } else {
                reject(new Error('Failed to convert Blob to ArrayBuffer.'));
            }
        };

        reader.onerror = (event) => {
            reject(new Error('Error reading Blob: ' + event.target?.error));
        };

        reader.readAsArrayBuffer(blob);
    });
};
