import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Globe, Sparkles, TrendingUp, X, Compass } from 'lucide-react';
import { CoinSearchResult, Language, Theme } from '../types';
import { translations } from '../utils/translations';
import { useRateLimit } from '../hooks/useRateLimit';

interface CoinSearchBarProps {
  onSelectCoin: (coinId: string) => void;
  lang: Language;
  theme: Theme;
  currentSymbol: string;
}

// User specified: In suggestions only Bitcoin and Ethereum are shown, the rest is up to user search
const QUICK_TRENDING = [
  { id: 'bitcoin', symbol: 'BTC', name: 'بیت‌کوین', enName: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'اتریوم', enName: 'Ethereum' },
];

export const CoinSearchBar: React.FC<CoinSearchBarProps> = ({
  onSelectCoin,
  lang,
  theme,
  currentSymbol,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Client-side rate limit throttling for live public search queries
  const { executeWithRateLimit: executeSearch } = useRateLimit({
    maxRequests: 25,
    windowMs: 30000,
    cooldownMs: 250,
    storageKey: 'coin_search_throttle',
  });

  // Debounced search with client-side rate throttling
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      executeSearch(async () => {
        const res = await fetch(`/api/crypto/search?query=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.results)) {
            setResults(data.results);
            setIsOpen(true);
          }
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }, 280);

    return () => clearTimeout(handler);
  }, [query, executeSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (coinId: string) => {
    onSelectCoin(coinId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Bar with psychological trust styling */}
      <div
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all shadow-sm ${
          isDark
            ? 'bg-slate-900/95 border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 text-slate-100'
            : 'bg-white border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 text-slate-900'
        }`}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}
        />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={t.searchPlaceholder}
          className="w-full bg-transparent border-none outline-none text-sm sm:text-base placeholder:text-slate-400 font-medium"
        />

        {isLoading ? (
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="text-slate-400 hover:text-slate-200 cursor-pointer p-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-mono shrink-0 ${
            isDark
              ? 'bg-slate-950/80 border-slate-800 text-emerald-400/90'
              : 'bg-slate-100 border-slate-200 text-emerald-700 font-semibold'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-500" />
          <span>CMC & CG API</span>
        </div>
      </div>

      {/* Suggested Chips: Strictly Bitcoin & Ethereum only, per user directive */}
      <div className="flex items-center justify-between gap-2.5 overflow-x-auto py-2 no-scrollbar text-sm">
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={`text-xs sm:text-sm font-medium shrink-0 flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {t.suggestedCoins}
          </span>
          {QUICK_TRENDING.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-mono font-semibold transition-all shrink-0 cursor-pointer border flex items-center gap-2 ${
                currentSymbol === item.symbol
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-sm font-bold'
                  : isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <span className="font-bold">{item.symbol}</span>
              <span className="text-xs opacity-80 font-sans">
                ({lang === 'fa' ? item.name : item.enName})
              </span>
            </button>
          ))}
        </div>

        {/* Informative helper hint for user */}
        <div
          className={`hidden md:flex items-center gap-1.5 text-xs truncate ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {lang === 'fa'
              ? 'جستجوی سایر ارزها در بیش از ۱۰,۰۰۰ توکن جهانی'
              : 'Search 10,000+ coins via search bar above'}
          </span>
        </div>
      </div>

      {/* Dropdown Live Results */}
      {isOpen && query.trim().length > 0 && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-700 divide-slate-800' : 'bg-white border-slate-200 divide-slate-100'
          } divide-y`}
        >
          <div
            className={`p-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>
              {lang === 'fa'
                ? `نتایج جستجو در CoinGecko و CoinMarketCap (${results.length} مورد)`
                : `CoinGecko & CoinMarketCap Matches (${results.length} found)`}
            </span>
            <span className="font-mono text-xs text-emerald-400">Live Query</span>
          </div>

          {results.length === 0 && !isLoading ? (
            <div className="p-5 text-center text-sm text-slate-400">
              {t.noResultsFound}
            </div>
          ) : (
            results.map((coin) => (
              <div
                key={coin.id}
                onClick={() => handleSelect(coin.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isDark ? 'hover:bg-slate-800/80 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {coin.thumb ? (
                    <img
                      src={coin.thumb}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono">
                      {coin.symbol[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base">{coin.name}</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {coin.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{coin.id}</span>
                      {coin.market_cap_rank && (
                        <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                          #{coin.market_cap_rank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs sm:text-sm">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'fa' ? 'انتخاب و تحلیل' : 'Analyze'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
