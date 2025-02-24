// const INDEXED_DB_VERSION = 1;

// const savePdfToIndexedDB = (pdf) => {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('pdfDatabase', 1);

//         request.onupgradeneeded = (event) => {
//             const db = event.target.result;
//             db.createObjectStore('pdfs', { keyPath: 'name' });
//         };

//         request.onsuccess = (event) => {
//             const db = event.target.result;
//             const transaction = db.transaction(['pdfs'], 'readwrite');
//             const store = transaction.objectStore('pdfs');
//             store.put(pdf);
//             transaction.oncomplete = () => resolve(true);
//             transaction.onerror = () => reject();
//         };

//         request.onerror = (event) => {
//             reject(event.target.error);
//         };
//     });
// };

// const getPdfFromIndexedDB = (name) => {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('pdfDatabase', INDEXED_DB_VERSION);

//         request.onsuccess = (event) => {
//             const db = event.target.result;
//             const transaction = db.transaction(['pdfs'], 'readonly');
//             const store = transaction.objectStore('pdfs');
//             const getRequest = store.get(name);

//             getRequest.onsuccess = (event) => {
//                 const pdf = event.target.result;
//                 if (pdf) {
//                     resolve(pdf.data);
//                 } else {
//                     resolve(null);
//                 }
//             };

//             getRequest.onerror = (event) => {
//                 reject(event.target.error);
//             };
//         };

//         request.onerror = (event) => {
//             reject(event.target.error);
//         };
//     });
// };

// onmessage = (event) => {
//     const message = event.data;
//     if (message.command === 'save') {
//         savePdfToIndexedDB(message.pdf)
//             .then((success) => postMessage({ command: 'saveResult', success }))
//             .catch((error) => console.error('Error in worker:', error));
//     } else if (message.command === 'read') {
//         getPdfFromIndexedDB(message.name)
//             .then((arrayBuffer) => postMessage({ command: 'readResult', arrayBuffer, name: message.name }))
//             .catch((error) => console.error('Error in worker:', error));
//     }
// };

const INDEXED_DB_VERSION = 1;

const savePdfToIndexedDB = (pdf: { name: string; data: ArrayBuffer }): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pdfDatabase', 1);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('pdfs', { keyPath: 'name' });
        };

        request.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['pdfs'], 'readwrite');
            const store = transaction.objectStore('pdfs');
            store.put(pdf);
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject();
        };

        request.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

const getPdfFromIndexedDB = (name: string): Promise<ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pdfDatabase', INDEXED_DB_VERSION);

        request.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = db.transaction(['pdfs'], 'readonly');
            const store = transaction.objectStore('pdfs');
            const getRequest = store.get(name);

            getRequest.onsuccess = (event: Event) => {
                const pdf = (event.target as IDBRequest).result;
                if (pdf) {
                    resolve(pdf.data);
                } else {
                    resolve(null);
                }
            };

            getRequest.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        };

        request.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        };
    });
};

onmessage = (event) => {
    const message = event.data;
    if (message.command === 'save') {
        savePdfToIndexedDB(message.pdf)
            .then((success) => postMessage({ command: 'saveResult', success }))
            .catch((error) => console.error('Error in worker:', error));
    } else if (message.command === 'read') {
        getPdfFromIndexedDB(message.name)
            .then((arrayBuffer) => postMessage({ command: 'readResult', arrayBuffer, name: message.name }))
            .catch((error) => console.error('Error in worker:', error));
    }
};
