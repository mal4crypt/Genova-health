import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
    placeholder = 'Search...',
    onSearch,
    className = ''
}) => {
    const [query, setQuery] = useState('');

    const handleSearch = (value) => {
        setQuery(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={placeholder}
                className="
                    w-full pl-10 pr-10 py-3 
                    bg-white dark:bg-gray-800 
                    border border-gray-300 dark:border-gray-600 
                    rounded-lg
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-colors
                "
            />
            {query && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
