type CustomWorkerType = 'pdf';

class WorkerFactory {
    private workers: Map<number, Worker>;
    private nextWorkerId: number;

    constructor() {
        this.workers = new Map();
        this.nextWorkerId = 0;
    }

    createWorker(workerType: CustomWorkerType): { workerId: number; worker: Worker } | undefined {
        let cnt = 0;
        while (this.workers.has(this.nextWorkerId)) {
            this.nextWorkerId += 1;
            cnt += 1;
            if (cnt == 10) {
                console.warn(`Worker with ID ${this.nextWorkerId} already exists.`);
                return undefined;
            }
        }
        const workerId = this.nextWorkerId;

        try {
            if (workerType == 'pdf') {
                const worker = new Worker(new URL('./indexedDBWorker.ts', import.meta.url));
                // const worker = new Worker('indexedDBWorker.ts');
                this.workers.set(workerId, worker);
                return { workerId: workerId, worker: worker };
            }
        } catch (error) {
            console.error(`Error creating worker with ID ${workerId}:`, error);
            return undefined;
        }
    }

    removeWorker(workerId: number): boolean {
        const worker = this.workers.get(workerId);
        if (!worker) {
            console.warn(`Worker with ID ${workerId} not found.`);
            return false;
        }
        worker.terminate();
        this.workers.delete(workerId);
        return true;
    }

    getWorker(workerId: number): Worker | undefined {
        return this.workers.get(workerId);
    }

    getAllWorkers(): Map<number, Worker> {
        return this.workers;
    }
}

export const workerFactory = new WorkerFactory();
