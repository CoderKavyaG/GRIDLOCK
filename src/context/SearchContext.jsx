import React, { createContext, useContext, useState, useEffect } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => setIsSearchOpen(false);
    const toggleSearch = () => setIsSearchOpen(prev => !prev);

    // Keyboard shortcut handler (Global)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleSearch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch, toggleSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
