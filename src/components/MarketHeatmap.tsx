import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CryptoCoin, Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface MarketHeatmapProps {
  coins: CryptoCoin[];
  selectedCoinId: string;
  onSelectCoin: (coinId: string) => void;
  lang: Language;
  theme: Theme;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type SizeMetric = 'marketCap' | 'volume24h' | 'equal';
type FilterMode = 'ALL' | 'GAINERS' | 'LOSERS';

interface TreemapLeafData {
  coin: CryptoCoin;
  value: number;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  coins,
  selectedCoinId,
  onSelectCoin,
  lang,
  theme,
  onRefresh,
  isRefreshing = false,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 520,
  });

  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('marketCap');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [hoveredCoin, setHoveredCoin] = useState<CryptoCoin | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Observe container dimensions dynamically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width } = entry.contentRect;
      // Maintain ergonomic aspect ratio: at least 460px height on mobile, up to 560px on desktop
      const computedHeight = Math.max(450, Math.min(620, Math.round(width * 0.54)));
      setDimensions({ width: Math.max(width, 300), height: computedHeight });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 2. Extract Top 20 cryptocurrencies sorted by market cap rank or marketCap
  const top20Coins = useMemo(() => {
    if (!coins || coins.length === 0) return [];
    const sorted = [...coins].sort((a, b) => {
      const rankA = a.marketCapRank || 999;
      const rankB = b.marketCapRank || 999;
      if (rankA !== rankB) return rankA - rankB;
      return (b.marketCap || 0) - (a.marketCap || 0);
    });
    return sorted.slice(0, 20);
  }, [coins]);

  // 3. Filtered coins
  const filteredCoins = useMemo(() => {
    if (filterMode === 'GAINERS') {
      return top20Coins.filter((c) => c.change24h >= 0);
    }
    if (filterMode === 'LOSERS') {
      return top20Coins.filter((c) => c.change24h < 0);
    }
    return top20Coins;
  }, [top20Coins, filterMode]);

  // 4. Market breadth summary metrics
  const marketStats = useMemo(() => {
    if (top20Coins.length === 0) {
      return { gainersCount: 0, losersCount: 0, avgChange: 0, bestGainer: null, worstLoser: null };
    }
    let gainers = 0;
    let losers = 0;
    let sumChange = 0;
    let best: CryptoCoin = top20Coins[0];
    let worst: CryptoCoin = top20Coins[0];

    top20Coins.forEach((c) => {
      sumChange += c.change24h;
      if (c.change24h >= 0) gainers++;
      else losers++;

      if (c.change24h > best.change24h) best = c;
      if (c.change24h < worst.change24h) worst = c;
    });

    return {
      gainersCount: gainers,
      losersCount: losers,
      avgChange: Number((sumChange / top20Coins.length).toFixed(2)),
      bestGainer: best,
      worstLoser: worst,
    };
  }, [top20Coins]);

  // 5. Compute D3 Treemap layout
  const treemapLeaves = useMemo(() => {
    if (filteredCoins.length === 0 || dimensions.width <= 0 || dimensions.height <= 0) {
      return [];
    }

    // Build hierarchy root
    const rootData = {
      name: 'root',
      children: filteredCoins.map((coin) => {
        let val = 1;
        if (sizeMetric === 'marketCap') {
          // Use square-root scaling for market cap to prevent Bitcoin from occupying 80% of screen while maintaining hierarchy
          val = Math.sqrt(Math.max(coin.marketCap || 1000000, 1000000));
        } else if (sizeMetric === 'volume24h') {
          val = Math.sqrt(Math.max(coin.volume24h || 100000, 100000));
        } else {
          val = 1;
        }
        return {
          coin,
          value: val,
        };
      }),
    };

    const hierarchyNode = d3
      .hierarchy<any>(rootData)
      .sum((d) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<any>()
      .size([dimensions.width, dimensions.height])
      .paddingInner(3)
      .paddingOuter(2)
      .round(true);

    const root = treemapLayout(hierarchyNode);
    return root.leaves() as Array<d3.HierarchyRectangularNode<TreemapLeafData>>;
  }, [filteredCoins, dimensions, sizeMetric]);

  // Color generator for 24h percentage change
  const getTileColorStyle = (change: number) => {
    if (change >= 10) {
      return isDark
        ? 'bg-emerald-600 border-emerald-400/60 text-white'
        : 'bg-emerald-600 border-emerald-700 text-white shadow-xs';
    }
    if (change >= 5) {
      return isDark
        ? 'bg-emerald-700/90 border-emerald-500/40 text-emerald-50'
        : 'bg-emerald-500 border-emerald-600 text-white shadow-xs';
    }
    if (change >= 2) {
      return isDark
        ? 'bg-emerald-800/80 border-emerald-600/30 text-emerald-100'
        : 'bg-emerald-100 border-emerald-400 text-emerald-950';
    }
    if (change >= 0) {
      return isDark
        ? 'bg-emerald-950/70 border-emerald-700/30 text-emerald-200'
        : 'bg-emerald-50 border-emerald-300 text-emerald-950';
    }
    if (change > -2) {
      return isDark
        ? 'bg-rose-950/60 border-rose-800/30 text-rose-200'
        : 'bg-rose-50 border-rose-300 text-rose-950';
    }
    if (change > -5) {
      return isDark
        ? 'bg-rose-900/80 border-rose-700/40 text-rose-100'
        : 'bg-rose-100 border-rose-400 text-rose-950';
    }
    if (change > -10) {
      return isDark
        ? 'bg-rose-700/90 border-rose-500/50 text-white'
        : 'bg-rose-500 border-rose-600 text-white shadow-xs';
    }
    return isDark
      ? 'bg-rose-600 border-rose-400/60 text-white'
      : 'bg-rose-600 border-rose-700 text-white shadow-xs';
  };

  // Format large numbers
  const formatCurrency = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
  };

  return (
    <div
      id="market-heatmap-section"
      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col gap-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800/90' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3.5 border-slate-200 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {t.marketHeatmapTitle}
            </h2>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              D3 Treemap
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t.marketHeatmapSubtitle}
          </p>
        </div>

        {/* Action Controls: Size Metric & Filter */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Sizing Metric selector */}
          <div
            className={`flex items-center rounded-xl border p-0.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setSizeMetric('marketCap')}
              title={t.sizeByMarketCap}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'marketCap'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'fa' ? 'مارکت‌کپ' : 'Cap'}
            </button>
            <button
              onClick={() => setSizeMetric('volume24h')}
              title={t.sizeByVolume}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'volume24h'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'fa' ? 'حجم ۲۴س' : 'Vol'}
            </button>
            <button
              onClick={() => setSizeMetric('equal')}
              title={t.sizeByEqual}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                sizeMetric === 'equal'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'fa' ? 'یکسان' : 'Equal'}
            </button>
          </div>

          {/* Filter selector */}
          <div
            className={`flex items-center rounded-xl border p-0.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterMode('GAINERS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'GAINERS'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.filterGainers}
            </button>
            <button
              onClick={() => setFilterMode('LOSERS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMode === 'LOSERS'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.filterLosers}
            </button>
          </div>

          {/* Optional Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={lang === 'fa' ? 'بروزرسانی داده‌های زنده' : 'Refresh live prices'}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Market Breadth & Sentiment Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div
          className={`p-2.5 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'fa' ? 'ارزهای مثبت / منفی:' : 'Gainers vs Losers:'}
          </span>
          <div className="flex items-center gap-1.5 font-bold font-mono">
            <span className="text-emerald-600 dark:text-emerald-400">{marketStats.gainersCount} ▲</span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 dark:text-rose-400">{marketStats.losersCount} ▼</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'fa' ? 'میانگین نوسان بازار:' : 'Market Avg 24h:'}
          </span>
          <span
            className={`font-bold font-mono ${
              marketStats.avgChange >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {marketStats.avgChange >= 0 ? `+${marketStats.avgChange}%` : `${marketStats.avgChange}%`}
          </span>
        </div>

        {marketStats.bestGainer && (
          <div
            onClick={() => onSelectCoin(marketStats.bestGainer!.id)}
            className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isDark ? 'bg-slate-950/50 border-emerald-500/20' : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'fa' ? 'بیشترین رشد:' : 'Top Gainer:'}
            </span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {marketStats.bestGainer.symbol} (+{marketStats.bestGainer.change24h}%)
            </span>
          </div>
        )}

        {marketStats.worstLoser && (
          <div
            onClick={() => onSelectCoin(marketStats.worstLoser!.id)}
            className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isDark ? 'bg-slate-950/50 border-rose-500/20' : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'fa' ? 'بیشترین افت:' : 'Top Loser:'}
            </span>
            <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
              {marketStats.worstLoser.symbol} ({marketStats.worstLoser.change24h}%)
            </span>
          </div>
        )}
      </div>

      {/* D3 Treemap Heatmap Canvas Container */}
      <div
        ref={containerRef}
        id="d3-treemap-heatmap-container"
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 select-none"
        style={{ height: `${dimensions.height}px` }}
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setMousePos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
        }}
        onMouseLeave={() => setHoveredCoin(null)}
      >
        {treemapLeaves.map((leaf, index) => {
          const coin = leaf.data.coin;
          const isSelected = coin.id === selectedCoinId;
          const width = Math.max(0, leaf.x1 - leaf.x0);
          const height = Math.max(0, leaf.y1 - leaf.y0);

          // Only render tiles with positive dimensions
          if (width <= 4 || height <= 4) return null;

          const isCompact = width < 75 || height < 50;
          const isUltraCompact = width < 55 || height < 38;
          const colorClass = getTileColorStyle(coin.change24h);

          return (
            <div
              key={coin.id || index}
              id={`heatmap-tile-${coin.symbol.toLowerCase()}`}
              onClick={() => onSelectCoin(coin.id)}
              onMouseEnter={() => setHoveredCoin(coin)}
              style={{
                position: 'absolute',
                left: `${leaf.x0}px`,
                top: `${leaf.y0}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              className={`rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden p-2 flex flex-col justify-between ${colorClass} ${
                isSelected ? 'ring-3 ring-amber-400 z-10 shadow-lg' : 'hover:scale-[1.01] hover:z-10'
              }`}
            >
              {/* Tile Top: Symbol & Rank */}
              <div className="flex items-center justify-between w-full gap-1">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span
                    className={`font-black tracking-wider leading-none ${
                      isUltraCompact
                        ? 'text-xs'
                        : isCompact
                        ? 'text-sm'
                        : width > 130 && height > 90
                        ? 'text-lg sm:text-xl'
                        : 'text-sm sm:text-base'
                    }`}
                  >
                    {coin.symbol}
                  </span>
                  {!isCompact && coin.marketCapRank && (
                    <span className="text-[10px] opacity-75 font-mono">
                      #{coin.marketCapRank}
                    </span>
                  )}
                </div>

                {/* 24h percentage badge */}
                <div
                  className={`font-mono font-bold leading-none shrink-0 ${
                    isUltraCompact
                      ? 'text-[10px]'
                      : isCompact
                      ? 'text-xs'
                      : 'text-xs sm:text-sm'
                  }`}
                >
                  {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
                </div>
              </div>

              {/* Tile Center/Bottom: Price & Name */}
              {!isUltraCompact && (
                <div className="mt-auto pt-1 flex flex-col">
                  <span
                    className={`font-mono font-extrabold truncate ${
                      isCompact ? 'text-[11px]' : 'text-xs sm:text-sm'
                    }`}
                  >
                    {formatPrice(coin.price)}
                  </span>
                  {!isCompact && height > 65 && (
                    <span className="text-[10px] opacity-80 truncate font-sans">
                      {lang === 'fa' && coin.nameFa ? coin.nameFa : coin.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Tooltip with rich data on hover */}
        {hoveredCoin && (
          <div
            className="absolute z-30 pointer-events-none rounded-2xl p-3 text-xs shadow-2xl border backdrop-blur-md transition-all bg-slate-950/95 text-white border-slate-700 min-w-[210px]"
            style={{
              left: `${Math.min(mousePos.x + 15, dimensions.width - 230)}px`,
              top: `${Math.min(mousePos.y + 15, dimensions.height - 180)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm">{hoveredCoin.symbol}</span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'fa' && hoveredCoin.nameFa ? hoveredCoin.nameFa : hoveredCoin.name}
                </span>
              </div>
              <span
                className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                  hoveredCoin.change24h >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {hoveredCoin.change24h >= 0 ? `+${hoveredCoin.change24h}%` : `${hoveredCoin.change24h}%`}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans">{lang === 'fa' ? 'قیمت:' : 'Price:'}</span>
                <span className="font-bold text-amber-300">{formatPrice(hoveredCoin.price)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans">{lang === 'fa' ? 'ارزش بازار:' : 'Market Cap:'}</span>
                <span>{formatCurrency(hoveredCoin.marketCap)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-sans">{lang === 'fa' ? 'حجم ۲۴ ساعته:' : '24h Volume:'}</span>
                <span>{formatCurrency(hoveredCoin.volume24h)}</span>
              </div>
              {hoveredCoin.high24h > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-sans">{lang === 'fa' ? 'سقف ۲۴س:' : '24h High:'}</span>
                  <span>{formatPrice(hoveredCoin.high24h)}</span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-cyan-400 flex items-center justify-between">
              <span>{t.clickToAnalyze}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      {/* Color Scale Legend & Action Advice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 border-t border-slate-200 dark:border-slate-800/70">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'fa' ? 'راهنمای رنگ:' : 'Color Scale:'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
            +5%+
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-mono text-[10px] font-bold">
            +2%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 dark:bg-emerald-950 text-emerald-300 font-mono text-[10px]">
            0%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-900/60 dark:bg-rose-950 text-rose-300 font-mono text-[10px]">
            -2%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold">
            -5%-
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{t.clickToAnalyze}</span>
        </div>
      </div>
    </div>
  );
};
