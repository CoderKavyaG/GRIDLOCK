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
    const [data, setData] = useState([]); // Start with empty array, never null
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
                        const dataArray = Array.isArray(cachedData) ? cachedData : [];
                        setData(dataArray);
                        setError(null);
                        setIsUsingMockData(false);
                        setLoading(false);
                    }
                    return;
                }
                
                const response = await axios.get(url, { timeout: 8000 });
                if (isMounted) {
                    // Safely extract results from response
                    const result = response?.data?.results || response?.data || [];
                    // Ensure result is always an array
                    const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.results) ? result.results : []);
                    setData(dataArray || []);
                    setCachedData(url, dataArray || []);
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
                        try {
                            const mockData = mockGames[mockType];
                            if (!mockData) {
                                console.warn(`No mock data available for ${mockType}, using topRated fallback`);
                                const fallbackData = mockGames['topRated'] || [];
                                setData(Array.isArray(fallbackData) ? fallbackData : Object.values(fallbackData) || []);
                            } else {
                                const dataArray = Array.isArray(mockData) ? mockData : (Object.values(mockData) || []);
                                setData(Array.isArray(dataArray) ? dataArray : []);
                            }
                            setError(null);
                            setIsUsingMockData(true);
                            console.warn(`[DEV MODE] Using mock data for ${mockType}`);
                        } catch (mockErr) {
                            console.error('Failed to load mock data:', mockErr);
                            setData([]);
                            setError('Failed to load games');
                            setIsUsingMockData(false);
                        }
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

    // Always return data as array, never null or undefined
    return { data: Array.isArray(data) ? data : [], loading, error, isUsingMockData };
};
