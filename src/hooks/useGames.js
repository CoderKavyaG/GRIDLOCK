import { useState, useEffect } from 'react';
import axios from 'axios';
import { mockGames } from '../utils/mockData';

// Simple in-memory cache
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (url) => {
    const cached = apiCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[CACHE HIT]', url.split('?')[0]);
        return cached.data;
    }
    return null;
};

const setCachedData = (url, data) => {
    apiCache.set(url, { data, timestamp: Date.now() });
};

export const useGames = (endpointFn, dependency = null, useMockOnError = true) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const url = dependency ? endpointFn(dependency) : endpointFn();
                
                // Check cache first
                const cachedData = getCachedData(url);
                if (cachedData) {
                    if (isMounted) {
                        setData(cachedData);
                        setError(null);
                        setIsUsingMockData(false);
                        setLoading(false);
                    }
                    return;
                }
                
                const response = await axios.get(url, { timeout: 8000 });
                if (isMounted) {
                    const result = response.data?.results || response.data || [];
                    setData(result);
                    setCachedData(url, result);
                    setError(null);
                    setIsUsingMockData(false);
                }
            } catch (err) {
                console.error('API Error:', err.message);
                if (isMounted) {
                    // Determine mock data type based on endpoint function
                    let mockType = 'topRated';
                    const fnStr = endpointFn?.toString() || '';
                    if (fnStr.includes('mood')) mockType = 'moodGames';
                    
                    if (useMockOnError) {
                        const mockData = mockGames[mockType];
                        setData(Array.isArray(mockData) ? mockData : Object.values(mockData));
                        setError(null);
                        setIsUsingMockData(true);
                        console.warn(`[DEV MODE] Using mock data for ${mockType}`);
                    } else {
                        setData([]);
                        setError(err.response?.data?.error || err.message || 'Failed to load games');
                        setIsUsingMockData(false);
                    }
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
    }, [endpointFn, dependency, useMockOnError]);

    return { data: data || [], loading, error, isUsingMockData };
};
