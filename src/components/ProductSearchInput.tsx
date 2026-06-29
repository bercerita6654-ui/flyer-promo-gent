import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Database, AlertCircle, X, ChevronDown } from 'lucide-react';

interface ProductSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct: (product: string, brand: string) => void;
}

interface ProductItem {
  sku?: string;
  product: string;
  brand: string;
}

export default function ProductSearchInput({
  value,
  onChange,
  onSelectProduct,
}: ProductSearchInputProps) {
  const [suggestions, setSuggestions] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce and fetch suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error fetching product search suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Click outside close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        // Select first one if user just presses enter and there are suggestions
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: ProductItem) => {
    onSelectProduct(item.product, item.brand);
    setIsOpen(false);
    setActiveIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef} id="product-search-input-wrapper">
      <div className="relative flex items-center">
        {/* Search / Database Icon */}
        <span className="absolute left-3.5 text-slate-500 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <Database className="w-4 h-4 text-indigo-500" />
          )}
        </span>

        <input
          ref={inputRef}
          type="text"
          id="productName"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            fetchSuggestions(value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari SKU atau nama produk dari Stock List..."
          className="w-full pl-10 pr-10 py-3 bg-[#06080e] border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 placeholder-slate-600 text-sm transition-all outline-none shadow-inner"
          required
          autoComplete="off"
        />

        {/* Clear or Dropdown Toggle Buttons */}
        <div className="absolute right-3 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              title="Bersihkan input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div 
          className="absolute z-50 left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-[#090d16] border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          id="product-search-dropdown"
        >
          {/* Header Info */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-900 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-400" />
              DATABASE STOCK LIST
            </span>
            <span>{suggestions.length} ditemukan</span>
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex flex-col gap-1 border-b border-slate-950/20 last:border-b-0 ${
                    index === activeIndex
                      ? 'bg-indigo-600/15 text-white'
                      : 'text-slate-300 hover:bg-slate-900/50'
                  }`}
                >
                  <span className="font-semibold line-clamp-1">{item.product}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.sku && (
                      <span className="text-[10px] bg-[#05070a] text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-mono">
                        SKU: <span className="text-indigo-400 font-semibold">{item.sku}</span>
                      </span>
                    )}
                    {item.brand && (
                      <span className="text-[10px] text-slate-400">
                        Merek: <span className="text-indigo-300 font-semibold">{item.brand}</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-xs flex flex-col items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-600" />
              <span>Tidak ada produk yang persis cocok.</span>
              <span className="text-[10px] text-slate-600">Anda tetap bisa mengetik custom di atas secara bebas.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
