'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'page' | 'api' | 'file' | 'doc';
  title: string;
  path: string;
  description?: string;
  icon?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock search data (replace with actual API call)
  const searchData: SearchResult[] = [
    { type: 'page', title: 'Main', path: '/main', icon: '🏠', description: 'Home page' },
    { type: 'page', title: 'Admin Panel', path: '/admin', icon: '⚙️', description: 'Administration' },
    { type: 'page', title: 'User Profile', path: '/user', icon: '👤', description: 'User settings' },
    { type: 'page', title: 'Dashboard', path: '/user-dashboard', icon: '📊', description: 'Analytics dashboard' },
    { type: 'page', title: 'Projects', path: '/projects', icon: '🚀', description: 'View projects' },
    { type: 'page', title: 'About Us', path: '/about', icon: 'ℹ️', description: 'Company info' },
    { type: 'page', title: 'Contact', path: '/contact', icon: '✉️', description: 'Get in touch' },
    { type: 'api', title: 'API Builder', path: '/admin', icon: '🔧', description: 'Create APIs' },
    { type: 'doc', title: 'Firebase Setup', path: '/docs/firebase', icon: '📄', description: 'Firebase integration guide' },
    { type: 'doc', title: 'Agentverse', path: '/docs/agentverse', icon: '📄', description: 'Agent architecture' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      // Simulate API call
      const timer = setTimeout(() => {
        const filtered = searchData.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
        setIsOpen(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (path: string) => {
    setQuery('');
    setIsOpen(false);
    router.push(path);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page':
        return 'text-blue-500';
      case 'api':
        return 'text-purple-500';
      case 'file':
        return 'text-green-500';
      case 'doc':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="Search pages, APIs, docs... (⌘K)"
          className="w-full pl-12 pr-4 py-2.5 bg-secondary/30 backdrop-blur-md border border-primary/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 placeholder:text-muted-foreground"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-primary/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelect(result.path)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors duration-200 text-left group"
              >
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform duration-200">
                  {result.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {result.title}
                    </h4>
                    <span
                      className={`text-xs uppercase font-semibold ${getTypeColor(
                        result.type
                      )}`}
                    >
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {result.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
                    {result.path}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-secondary/30 border-t border-primary/10 flex items-center justify-between text-xs text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-primary/10 rounded-xl shadow-2xl p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for pages, APIs, or documentation
          </p>
        </div>
      )}
    </div>
  );
}
