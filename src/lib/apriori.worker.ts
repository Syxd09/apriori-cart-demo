import { runAprioriAlgorithm } from './apriori';

// Define message types
type WorkerMessage = {
    type: 'RUN_ALGORITHM';
    payload: {
        transactions: string[][];
        minSupport: number;
        minConfidence: number;
    };
};

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, payload } = e.data;

    if (type === 'RUN_ALGORITHM') {
        try {
            const { transactions, minSupport, minConfidence } = payload;

            console.log('👷 Worker: Starting Apriori algorithm...');
            const startTime = performance.now();

            const result = runAprioriAlgorithm(transactions, minSupport, minConfidence);

            const endTime = performance.now();
            console.log(`👷 Worker: Finished in ${(endTime - startTime).toFixed(2)}ms`);

            // Send results back to main thread
            self.postMessage({
                type: 'SUCCESS',
                payload: result
            });
        } catch (error) {
            console.error('👷 Worker: Error running algorithm', error);
            self.postMessage({
                type: 'ERROR',
                payload: error instanceof Error ? error.message : 'Unknown error in worker'
            });
        }
    }
};
