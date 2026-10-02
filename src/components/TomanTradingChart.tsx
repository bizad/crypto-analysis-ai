import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Candle,
  CryptoCoin,
  Timeframe,
  Language,
  Theme,
} from '../types';
import {
  Coins,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  BarChart2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface TomanTradingChartProps {
  coin: CryptoCoin;
  candles: Candle[];
  timeframe: Timeframe;
  onChangeTimeframe?: (tf: Timeframe) => void;
  onRefreshChart?: () => void;
  isLoading?: boolean;
  lang?: Language;
  theme?: Theme;
}

export const TomanTradingChart: React.FC<TomanTradingChartProps> = ({
  coin,
  candles,
  timeframe,
  onChangeTimeframe,
  onRefreshChart,
  isLoading = false,
  lang = 'fa',
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[lang];
  const isDark = theme === 'dark';

  // Live Tether to Toman rate connected to Nobitex Exchange
  const [usdtRate, setUsdtRate] = useState<number>(230440);
  const [nobitexInfo, setNobitexInfo] = useState<{
    dayChange?: number;
    dayHigh?: number;
    dayLow?: number;
    hasDirectPair?: boolean;
    source?: string;
  }>({
    dayChange: -1.52,
    dayHigh: 234382,
    dayLow: 227205,
    source: 'Nobitex',
  });
  const [isRefreshingToman, setIsRefreshingToman] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 380 });

  // Fetch or refresh live USDT to Toman rate from Nobitex API
  const fetchTomanRate = async () => {
    try {
      const res = await fetch(`/api/crypto/toman-data/${encodeURIComponent(coin.symbol)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tomanData) {
          const td = data.tomanData;
          if (td.usdtRate) {
            setUsdtRate(td.usdtRate);
          }
          setNobitexInfo({
            dayChange: td.nobitexDayChange,
            dayHigh: td.nobitexDayHigh,
            dayLow: td.nobitexDayLow,
            hasDirectPair: td.hasDirectNobitexPair,
            source: td.source || 'Nobitex',
          });
        }
      }
    } catch (e) {
      // Smooth fallback
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchTomanRate();
    const interval = setInterval(() => {
      if (isMounted) fetchTomanRate();
    }, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coin.symbol]);

  const handleManualRefresh = async () => {
    setIsRefreshingToman(true);
    try {
      await fetchTomanRate();
      if (onRefreshChart) {
        await onRefreshChart();
      }
    } finally {
      setTimeout(() => setIsRefreshingToman(false), 400);
    }
  };

  // Convert candle dataset into Toman dataset
  const tomanCandles = useMemo(() => {
    return candles.map((c) => ({
      ...c,
      open: Math.round(c.open * usdtRate),
      high: Math.round(c.high * usdtRate),
      low: Math.round(c.low * usdtRate),
      close: Math.round(c.close * usdtRate),
      volumeToman: Math.round((c.volume || 100) * c.close * usdtRate),
    }));
  }, [candles, usdtRate]);

  // Responsive High-DPI Canvas measurement
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(320, Math.floor(width)),
          height: 380,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Format Toman numbers nicely
  const formatTomanNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      const billions = (num / 1_000_000_000).toFixed(2);
      return lang === 'fa' ? `${billions} میلیارد تومان` : `${billions}B Tomans`;
    }
    if (num >= 1_000_000) {
      const millions = (num / 1_000_000).toFixed(1);
      return lang === 'fa' ? `${millions} میلیون تومان` : `${millions}M Tomans`;
    }
    return `${num.toLocaleString()} ${lang === 'fa' ? 'تومان' : 'Tomans'}`;
  };

  // Format short axis label
  const formatAxisToman = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + (lang === 'fa' ? ' م.ت' : 'B');
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + (lang === 'fa' ? ' م' : 'M');
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  // Render Toman Candlestick Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || tomanCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = dimensions;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Color theme
    const bg = isDark ? '#020617' : '#ffffff';
    const gridLine = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(226, 232, 240, 0.7)';
    const textCol = isDark ? '#94a3b8' : '#64748b';
    const upColor = '#10b981'; // Emerald
    const downColor = '#f43f5e'; // Rose

    // Clear background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const rightMargin = 85;
    const bottomMargin = 30;
    const chartWidth = width - rightMargin;
    const chartHeight = height - bottomMargin;

    // Determine min/max in Toman
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const c of tomanCandles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    if (minPrice === maxPrice) {
      minPrice *= 0.99;
      maxPrice *= 1.01;
    }

    const pricePadding = (maxPrice - minPrice) * 0.08;
    const pMin = minPrice - pricePadding;
    const pMax = maxPrice + pricePadding;
    const pRange = pMax - pMin;

    const getY = (price: number) => {
      return chartHeight - ((price - pMin) / pRange) * chartHeight;
    };

    // Horizontal grid lines
    ctx.strokeStyle = gridLine;
    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = textCol;
    ctx.textAlign = 'left';

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const price = pMin + (pRange / gridSteps) * i;
      const y = getY(price);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillText(formatAxisToman(price), chartWidth + 6, y + 3);
    }

    // Candle geometry
    const totalCandles = tomanCandles.length;
    const candleWidth = Math.max(3, (chartWidth / totalCandles) * 0.65);
    const candleGap = chartWidth / totalCandles;

    // Draw Candles
    tomanCandles.forEach((c, idx) => {
      const x = idx * candleGap + candleGap / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? upColor : downColor;

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Candle Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Volume bar at bottom
      const maxVol = Math.max(...tomanCandles.map((it) => it.volumeToman || 1));
      const volHeight = Math.min(45, ((c.volumeToman || 1) / maxVol) * 45);
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
      ctx.fillRect(x - candleWidth / 2, chartHeight - volHeight, candleWidth, volHeight);

      // Time labels at bottom
      if (idx % Math.ceil(totalCandles / 6) === 0) {
        ctx.fillStyle = textCol;
        ctx.fillText(c.formattedTime, x - 12, height - 8);
      }
    });

    // Hover Crosshair
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < totalCandles) {
      const activeCandle = tomanCandles[hoverIndex];
      const hx = hoverIndex * candleGap + candleGap / 2;
      const hy = getY(activeCandle.close);

      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(chartWidth, hy);
      ctx.stroke();

      // Active price pill
      ctx.setLineDash([]);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(chartWidth + 2, hy - 10, rightMargin - 4, 20);
      ctx.fillStyle = '#020617';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(formatAxisToman(activeCandle.close), chartWidth + 5, hy + 3);
      ctx.restore();
    }
  }, [tomanCandles, dimensions, isDark, hoverIndex, lang]);

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || tomanCandles.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = dimensions.width - 85;

    if (x >= 0 && x <= chartWidth) {
      const candleGap = chartWidth / tomanCandles.length;
      const idx = Math.floor(x / candleGap);
      if (idx >= 0 && idx < tomanCandles.length) {
        setHoverIndex(idx);
      }
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const currentTomanPrice = Math.round(coin.price * usdtRate);
  const activeCandle = hoverIndex !== null ? tomanCandles[hoverIndex] : tomanCandles[tomanCandles.length - 1];

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-xl flex flex-col gap-3.5 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black flex items-center gap-1.5">
                <span>{t.tomanChart}</span>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  {coin.symbol} / IRT
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t.tomanChartSubtitle}
            </p>
          </div>
        </div>

        {/* Live Toman Rate & Nobitex Conversion Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Live Tether Exchange Rate Badge (Without brand name) */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 text-[11px] font-sans">
                {lang === 'fa' ? 'قیمت دلار تتر:' : 'Live USDT:'}
              </span>
            </div>
            <span className="font-bold text-emerald-400">
              {usdtRate.toLocaleString()} {lang === 'fa' ? 'تومان' : 'IRT'}
            </span>
            {nobitexInfo.dayChange !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  nobitexInfo.dayChange >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {nobitexInfo.dayChange >= 0 ? '+' : ''}
                {nobitexInfo.dayChange}%
              </span>
            )}
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 ${
              isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <span className="text-[11px] font-sans">{t.priceToman}:</span>
            <span className="font-black text-sm">
              {formatTomanNumber(currentTomanPrice)}
            </span>
          </div>

          {/* Dedicated Refresh Chart & Live Rate Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshingToman || isLoading}
            title={lang === 'fa' ? 'بروزرسانی کندل‌های تومانی و استعلام نرخ زنده تتر' : 'Refresh Toman candles & live Tether rate'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
              isDark
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshingToman || isLoading ? 'animate-spin text-amber-400' : 'text-amber-400'
              }`}
            />
            <span className="text-[11px]">
              {isRefreshingToman || isLoading ? t.refreshingChart : t.refreshChart}
            </span>
          </button>
        </div>
      </div>

      {/* OHLC Bar in Tomans */}
      {activeCandle && (
        <div
          className={`flex items-center justify-between text-xs font-mono px-3 py-2 rounded-xl border overflow-x-auto gap-4 ${
            isDark
              ? 'bg-slate-950/50 border-slate-800/60 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'fa' ? 'زمان:' : 'Time:'}{' '}
              <strong className="text-slate-900 dark:text-slate-200">{activeCandle.formattedTime}</strong>
            </span>
            <span>
              O:{' '}
              <strong className="text-slate-900 dark:text-slate-200">
                {activeCandle.open.toLocaleString()}
              </strong>
            </span>
            <span>
              H:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                {activeCandle.high.toLocaleString()}
              </strong>
            </span>
            <span>
              L:{' '}
              <strong className="text-rose-700 dark:text-rose-400">
                {activeCandle.low.toLocaleString()}
              </strong>
            </span>
            <span>
              C:{' '}
              <strong className="text-amber-700 dark:text-amber-400">
                {activeCandle.close.toLocaleString()}
              </strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-sans">
            {lang === 'fa' ? 'واحد: تومان ایران' : 'Denominated in Iranian Tomans'}
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-[380px] block cursor-crosshair"
        />
      </div>

      {/* Metric Highlights in Tomans */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono pt-1">
        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-0.5">{t.high24h} (IRT)</div>
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            {formatTomanNumber(Math.round(coin.high24h * usdtRate))}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-0.5">{t.low24h} (IRT)</div>
          <div className="font-bold text-rose-700 dark:text-rose-400">
            {formatTomanNumber(Math.round(coin.low24h * usdtRate))}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-0.5">{t.change24h}</div>
          <div className={`font-bold flex items-center gap-1 ${coin.change24h >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans mb-0.5">
            {lang === 'fa' ? 'منبع نرخ دلار تتر' : 'Live Tether Source'}
          </div>
          <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">{lang === 'fa' ? 'نرخ لحظه‌ای بازار' : 'Real-Time Market'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
