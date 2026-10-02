import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Candle,
  CryptoCoin,
  Timeframe,
  TechnicalAnalysisResult,
  Language,
  Theme,
} from '../types';
import {
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  BarChart2,
  Activity,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { translations } from '../utils/translations';

interface TradingChartProps {
  coin: CryptoCoin;
  candles: Candle[];
  timeframe: Timeframe;
  onChangeTimeframe: (tf: Timeframe) => void;
  onRefreshChart?: () => void;
  supports?: number[];
  resistances?: number[];
  analysis?: TechnicalAnalysisResult | null;
  isLoading?: boolean;
  lang?: Language;
  theme?: Theme;
}

type SubChartType = 'VOLUME' | 'RSI' | 'MACD';

export const TradingChart: React.FC<TradingChartProps> = ({
  coin,
  candles,
  timeframe,
  onChangeTimeframe,
  onRefreshChart,
  supports = [],
  resistances = [],
  analysis,
  isLoading = false,
  lang = 'fa',
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[lang];
  const isDark = theme === 'dark';

  // Indicator Visibility Toggles
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showBB, setShowBB] = useState(true);
  const [showSR, setShowSR] = useState(true);
  const [showAISignals, setShowAISignals] = useState(true);
  const [subChart, setSubChart] = useState<SubChartType>('VOLUME');

  // Hover Crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // ResizeObserver for responsive high-DPI canvas
  const [dimensions, setDimensions] = useState({ width: 800, height: 440 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(320, Math.floor(width)),
          height: 440,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main Canvas Rendering Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = dimensions;

    // Set display and buffer dimensions for high DPI
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Layout configuration
    const paddingRight = 65; // Price scale
    const paddingBottom = 26; // Time scale
    const subChartHeight = 90;
    const mainChartHeight = height - subChartHeight - paddingBottom - 16;
    const chartWidth = width - paddingRight;

    // Background
    ctx.fillStyle = isDark ? '#060910' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate Price Min & Max
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (showBB && c.bbLower !== undefined && c.bbLower < minPrice) minPrice = c.bbLower;
      if (showBB && c.bbUpper !== undefined && c.bbUpper > maxPrice) maxPrice = c.bbUpper;
      if (showEMA20 && c.ema20 !== undefined) {
        if (c.ema20 < minPrice) minPrice = c.ema20;
        if (c.ema20 > maxPrice) maxPrice = c.ema20;
      }
    });

    // Add margin to min & max
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const finalPriceRange = maxPrice - minPrice;

    // Coordinate projection functions
    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / finalPriceRange) * mainChartHeight;
    };

    const candleCount = candles.length;
    const candleSpacing = chartWidth / candleCount;
    const candleWidth = Math.max(2, candleSpacing * 0.7);

    const getX = (index: number) => {
      return index * candleSpacing + candleSpacing / 2;
    };

    // 1. Draw Grid Lines & Price Ticks
    ctx.strokeStyle = isDark ? '#141c2e' : '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSteps = 5;

    for (let i = 0; i <= gridSteps; i++) {
      const price = minPrice + (finalPriceRange / gridSteps) * i;
      const y = getY(price);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = isDark ? '#64748b' : '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const labelText = price > 10 ? price.toFixed(2) : price.toFixed(4);
      ctx.fillText(labelText, chartWidth + 6, y);
    }

    // Time ticks
    const timeStep = Math.max(1, Math.floor(candleCount / 6));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < candleCount; i += timeStep) {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - paddingBottom);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.fillText(candles[i].formattedTime, x, height - paddingBottom + 6);
    }

    // 2. Draw Support and Resistance Lines
    if (showSR) {
      supports.forEach((sup) => {
        if (sup >= minPrice && sup <= maxPrice) {
          const y = getY(sup);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#10b981';
          ctx.font = '9px Vazirmatn, sans-serif';
          ctx.fillText(
            `${lang === 'fa' ? 'حمایت' : 'Support'}: $${sup}`,
            chartWidth - 65,
            y - 6
          );
        }
      });

      resistances.forEach((res) => {
        if (res >= minPrice && res <= maxPrice) {
          const y = getY(res);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#f43f5e';
          ctx.font = '9px Vazirmatn, sans-serif';
          ctx.fillText(
            `${lang === 'fa' ? 'مقاومت' : 'Resistance'}: $${res}`,
            chartWidth - 65,
            y - 6
          );
        }
      });
    }

    // 3. Draw AI Trade Setup Overlay (Entry, Take Profits, Stop Loss)
    if (showAISignals && analysis) {
      // Entry Zone
      if (analysis.entryZone) {
        const yEntryMin = getY(analysis.entryZone.min);
        const yEntryMax = getY(analysis.entryZone.max);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.fillRect(0, yEntryMax, chartWidth, yEntryMin - yEntryMax);

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.setLineDash([6, 3]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, yEntryMin);
        ctx.lineTo(chartWidth, yEntryMin);
        ctx.moveTo(0, yEntryMax);
        ctx.lineTo(chartWidth, yEntryMax);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 9px Vazirmatn, sans-serif';
        ctx.fillText(
          lang === 'fa' ? 'ناحیه ورود پله‌ای AI' : 'AI Staged Entry Zone',
          10,
          yEntryMax - 4
        );
      }

      // Take Profits
      if (analysis.takeProfitTargets) {
        const tps = [
          { label: 'TP1', val: analysis.takeProfitTargets.tp1 },
          { label: 'TP2', val: analysis.takeProfitTargets.tp2 },
          { label: 'TP3', val: analysis.takeProfitTargets.tp3 },
        ];

        tps.forEach(({ label, val }) => {
          if (val && val >= minPrice && val <= maxPrice) {
            const y = getY(val);
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.2;
            ctx.moveTo(0, y);
            ctx.lineTo(chartWidth, y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillText(`${label}: $${val}`, chartWidth - 85, y - 4);
          }
        });
      }

      // Stop Loss
      if (analysis.stopLoss && analysis.stopLoss >= minPrice && analysis.stopLoss <= maxPrice) {
        const y = getY(analysis.stopLoss);
        ctx.beginPath();
        ctx.setLineDash([4, 2]);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(
          `${lang === 'fa' ? 'حد ضرر' : 'Stop Loss'} (SL): $${analysis.stopLoss}`,
          chartWidth - 95,
          y + 12
        );
      }
    }

    // 4. Draw Bollinger Bands
    if (showBB) {
      // Area between Upper and Lower
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const c = candles[i];
        if (c.bbUpper !== undefined) {
          const x = getX(i);
          const y = getY(c.bbUpper);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = candleCount - 1; i >= 0; i--) {
        const c = candles[i];
        if (c.bbLower !== undefined) {
          const x = getX(i);
          const y = getY(c.bbLower);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Draw Upper line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      started = false;
      for (let i = 0; i < candleCount; i++) {
        if (candles[i].bbUpper !== undefined) {
          const x = getX(i);
          const y = getY(candles[i].bbUpper!);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      // Draw Lower line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      started = false;
      for (let i = 0; i < candleCount; i++) {
        if (candles[i].bbLower !== undefined) {
          const x = getX(i);
          const y = getY(candles[i].bbLower!);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // 5. Draw EMAs
    const drawLine = (prop: keyof Candle, color: string, width = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      let started = false;

      for (let i = 0; i < candleCount; i++) {
        const val = candles[i][prop] as number | undefined;
        if (val !== undefined) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    if (showEMA20) drawLine('ema20', '#06b6d4', 1.5);
    if (showEMA50) drawLine('ema50', '#a855f7', 1.5);
    if (showEMA200) drawLine('ema200', '#f59e0b', 2.0);

    // 6. Draw Candlesticks
    for (let i = 0; i < candleCount; i++) {
      const c = candles[i];
      const x = getX(i);
      const isUp = c.close >= c.open;
      const color = isUp ? '#10b981' : '#f43f5e';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yOpen - yClose));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    }

    // 7. Divider for Sub-Chart
    const subTop = mainChartHeight + 10;
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, subTop);
    ctx.lineTo(chartWidth, subTop);
    ctx.stroke();

    // 8. Draw Selected Sub-Chart (VOLUME / RSI / MACD)
    if (subChart === 'VOLUME') {
      let maxVol = 0;
      candles.forEach((c) => {
        if (c.volume > maxVol) maxVol = c.volume;
      });
      maxVol = maxVol || 1;

      const volBottom = height - paddingBottom;
      const volHeight = subChartHeight - 16;

      for (let i = 0; i < candleCount; i++) {
        const c = candles[i];
        const x = getX(i);
        const isUp = c.close >= c.open;
        const h = (c.volume / maxVol) * volHeight;

        ctx.fillStyle = isUp
          ? isDark
            ? 'rgba(16, 185, 129, 0.45)'
            : 'rgba(16, 185, 129, 0.6)'
          : isDark
          ? 'rgba(244, 63, 94, 0.45)'
          : 'rgba(244, 63, 94, 0.6)';
        ctx.fillRect(x - candleWidth / 2, volBottom - h, candleWidth, h);
      }

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Vol Max: ${(maxVol / 1000).toFixed(0)}k`, 10, subTop + 14);
    } else if (subChart === 'RSI') {
      const rsiTop = subTop + 12;
      const rsiHeight = subChartHeight - 24;

      const getRsiY = (rsiVal: number) => {
        return rsiTop + rsiHeight - (rsiVal / 100) * rsiHeight;
      };

      // 70 and 30 levels
      const y70 = getRsiY(70);
      const y30 = getRsiY(30);

      ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.08)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw RSI line
      ctx.beginPath();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const val = candles[i].rsi;
        if (val !== undefined) {
          const x = getX(i);
          const y = getRsiY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('RSI (14)', 10, subTop + 12);
      ctx.fillText('70', chartWidth + 6, y70);
      ctx.fillText('30', chartWidth + 6, y30);
    } else if (subChart === 'MACD') {
      let maxAbs = 0.0001;
      candles.forEach((c) => {
        if (c.macd !== undefined && Math.abs(c.macd) > maxAbs) maxAbs = Math.abs(c.macd);
        if (c.macdHist !== undefined && Math.abs(c.macdHist) > maxAbs) maxAbs = Math.abs(c.macdHist);
      });

      const macdCenter = subTop + subChartHeight / 2;
      const macdScale = (subChartHeight / 2 - 12) / maxAbs;

      // Histogram
      for (let i = 0; i < candleCount; i++) {
        const hist = candles[i].macdHist;
        if (hist !== undefined) {
          const x = getX(i);
          const h = hist * macdScale;
          ctx.fillStyle = hist >= 0 ? '#10b981' : '#f43f5e';
          ctx.fillRect(x - candleWidth / 2, macdCenter - Math.max(0, h), candleWidth, Math.abs(h));
        }
      }

      // MACD Line
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const val = candles[i].macd;
        if (val !== undefined) {
          const x = getX(i);
          const y = macdCenter - val * macdScale;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('MACD (12,26,9)', 10, subTop + 12);
    }

    // 9. Interactive Hover Crosshair & Details
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < candleCount && mousePos) {
      const activeCandle = candles[hoverIndex];
      const hx = getX(hoverIndex);
      const hy = getY(activeCandle.close);

      // Crosshair Lines
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height - paddingBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(chartWidth, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on right axis
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(chartWidth + 1, hy - 10, 60, 20);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(chartWidth + 1, hy - 10, 60, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(activeCandle.close.toFixed(activeCandle.close > 10 ? 2 : 4), chartWidth + 6, hy);
    }

    ctx.restore();
  }, [
    candles,
    dimensions,
    showEMA20,
    showEMA50,
    showEMA200,
    showBB,
    showSR,
    showAISignals,
    subChart,
    supports,
    resistances,
    analysis,
    hoverIndex,
    mousePos,
    isDark,
    lang,
  ]);

  // Mouse Handlers for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 65;
    const chartWidth = dimensions.width - paddingRight;

    if (x < 0 || x > chartWidth) {
      setHoverIndex(null);
      setMousePos(null);
      return;
    }

    const candleSpacing = chartWidth / candles.length;
    const index = Math.min(candles.length - 1, Math.max(0, Math.floor(x / candleSpacing)));

    setHoverIndex(index);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  const activeCandle =
    hoverIndex !== null && candles[hoverIndex]
      ? candles[hoverIndex]
      : candles[candles.length - 1];

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border transition-all p-3 sm:p-4 flex flex-col gap-3 shadow-xl ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}
    >
      {/* Chart Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/40">
        {/* Timeframe selector + Refresh Chart Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1">
            {(['15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onChangeTimeframe(tf)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isDark
                    ? 'bg-slate-950/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {onRefreshChart && (
            <button
              onClick={onRefreshChart}
              disabled={isLoading}
              title={t.refreshChartTooltip}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                isDark
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-200'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
              <span className="text-[11px]">
                {isLoading ? t.refreshingChart : t.refreshChart}
              </span>
            </button>
          )}
        </div>

        {/* Indicators and Layers Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-0.5 rounded-lg border font-mono transition-colors cursor-pointer ${
              showEMA20
                ? isDark
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-semibold'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-300 font-semibold'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-slate-200'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-0.5 rounded-lg border font-mono transition-colors cursor-pointer ${
              showEMA50
                ? isDark
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 font-semibold'
                  : 'bg-purple-50 text-purple-700 border-purple-300 font-semibold'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-slate-200'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            EMA 50
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2 py-0.5 rounded-lg border font-mono transition-colors cursor-pointer ${
              showBB
                ? isDark
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/40 font-semibold'
                  : 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-slate-200'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            BB (20,2)
          </button>
          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-2 py-0.5 rounded-lg border font-mono transition-colors cursor-pointer ${
              showSR
                ? isDark
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-semibold'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-slate-200'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            S/R Pivots
          </button>
          <button
            onClick={() => setShowAISignals(!showAISignals)}
            className={`px-2 py-0.5 rounded-lg border font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              showAISignals
                ? isDark
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 font-semibold'
                  : 'bg-amber-50 text-amber-700 border-amber-300 font-semibold'
                : isDark
                ? 'text-slate-400 border-transparent hover:text-slate-200'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            AI Setups
          </button>
        </div>

        {/* Sub-Chart Selector (Volume / RSI / MACD) */}
        <div
          className={`flex items-center gap-1 p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {(['VOLUME', 'RSI', 'MACD'] as SubChartType[]).map((sub) => (
            <button
              key={sub}
              onClick={() => setSubChart(sub)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                subChart === sub
                  ? isDark
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'bg-white text-cyan-700 shadow-xs border border-slate-200 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Live Candle Data Ribbon (OHLCV) */}
      {activeCandle && (
        <div
          className={`flex items-center justify-between text-xs font-mono overflow-x-auto py-1 border-b gap-3 ${
            isDark ? 'border-slate-800/40 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-3 shrink-0">
            <span>
              O: <strong className="text-slate-900 dark:text-slate-200">${activeCandle.open}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-700 dark:text-emerald-400">${activeCandle.high}</strong>
            </span>
            <span>
              L: <strong className="text-rose-700 dark:text-rose-400">${activeCandle.low}</strong>
            </span>
            <span>
              C: <strong className="text-slate-900 dark:text-slate-200">${activeCandle.close}</strong>
            </span>
            <span>
              Vol: <strong className="text-slate-900 dark:text-slate-300">{(activeCandle.volume / 1000).toFixed(1)}k</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            {activeCandle.formattedTime}
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="relative w-full h-[440px] rounded-2xl overflow-hidden cursor-crosshair">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-emerald-400">
                {lang === 'fa' ? 'در حال بارگذاری کندل‌ها...' : 'Loading candles...'}
              </span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
