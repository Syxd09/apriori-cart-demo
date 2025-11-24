import { useState, useEffect, useCallback, useRef } from 'react';
import type { AssociationRule, FrequentItemset, MiningStats } from '@/types';

interface AprioriResult {
    associationRules: AssociationRule[];
    frequentItemsets: FrequentItemset[];
    stats: MiningStats;
}

export const useAprioriWorker = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AprioriResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize worker
        workerRef.current = new Worker(new URL('../lib/apriori.worker.ts', import.meta.url), {
            type: 'module'
        });

        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'SUCCESS') {
                setResult(payload);
                setIsLoading(false);
            } else if (type === 'ERROR') {
                setError(payload);
                setIsLoading(false);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const runAlgorithm = useCallback((
        transactions: string[][],
        minSupport: number,
        minConfidence: number
    ) => {
        setIsLoading(true);
        setError(null);

        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'RUN_ALGORITHM',
                payload: { transactions, minSupport, minConfidence }
            });
        } else {
            setError('Worker not initialized');
            setIsLoading(false);
        }
    }, []);

    return { runAlgorithm, isLoading, result, error };
};
