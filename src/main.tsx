import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import '@/style/index.css';
import * as serviceWorkerRegistration from '@/pwa/serviceWorkerRegistration.ts';
const IS_MOCK = import.meta.env.VITE_IS_MOCK === 'true';
async function enableMocking() {
    if (process.env.NODE_ENV !== 'development' || !IS_MOCK) {
        return;
    }
    return;
    // const { worker } = await import('./mocks/browser');

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    // return worker.start();
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
});

serviceWorkerRegistration.register();
