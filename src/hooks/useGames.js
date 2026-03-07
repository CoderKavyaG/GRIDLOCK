import { useState, useEffect } from 'react';
import axios from 'axios';

export const useGames = (endpointFn, dependency = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const url = dependency ? endpointFn(dependency) : endpointFn();
                const response = await axios.get(url);
                if (isMounted) {
                    setData(response.data?.results || response.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.error || err.message || 'An error occurred');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (endpointFn) {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, [endpointFn, dependency]);

    return { data, loading, error };
};
