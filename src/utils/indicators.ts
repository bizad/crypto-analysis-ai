import { Candle } from '../types';

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  const k = 2 / (period + 1);
  const emaValues: (number | undefined)[] = [];
  let prevEma: number | undefined = undefined;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      emaValues.push(undefined);
    } else if (i === period - 1) {
      // First EMA is simple SMA
      const slice = prices.slice(0, period);
      const sum = slice.reduce((a, b) => a + b, 0);
      prevEma = sum / period;
      emaValues.push(prevEma);
    } else if (prevEma !== undefined) {
      prevEma = prices[i] * k + prevEma * (1 - k);
      emaValues.push(prevEma);
    }
  }
  return emaValues;
}

/**
 * Calculates Relative Strength Index (RSI 14)
 */
export function calculateRSI(closes: number[], period: number = 14): (number | undefined)[] {
  const rsiValues: (number | undefined)[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsiValues.push(undefined);
      continue;
    }

    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    if (i < period) {
      avgGain += gain;
      avgLoss += loss;
      rsiValues.push(undefined);
      if (i === period - 1) {
        avgGain /= period;
        avgLoss /= period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);
        rsiValues[i] = rsi;
      }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      rsiValues.push(rsi);
    }
  }
  return rsiValues;
}

/**
 * Calculates Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: (number | undefined)[]; middle: (number | undefined)[]; lower: (number | undefined)[] } {
  const upper: (number | undefined)[] = [];
  const middle: (number | undefined)[] = [];
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(undefined);
      middle.push(undefined);
      lower.push(undefined);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    middle.push(mean);
    upper.push(mean + multiplier * stdDev);
    lower.push(mean - multiplier * stdDev);
  }

  return { upper, middle, lower };
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: (number | undefined)[];
  signal: (number | undefined)[];
  histogram: (number | undefined)[];
} {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  const macdLine: (number | undefined)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f !== undefined && s !== undefined) {
      macdLine.push(f - s);
    } else {
      macdLine.push(undefined);
    }
  }

  // Filter defined macd to calculate signal line
  const validMacdValues: number[] = [];
  const validIndices: number[] = [];
  macdLine.forEach((val, idx) => {
    if (val !== undefined) {
      validMacdValues.push(val);
      validIndices.push(idx);
    }
  });

  const signalLineValid = calculateEMA(validMacdValues, signalPeriod);
  const signalLine: (number | undefined)[] = new Array(closes.length).fill(undefined);
  validIndices.forEach((origIdx, i) => {
    signalLine[origIdx] = signalLineValid[i];
  });

  const histogram: (number | undefined)[] = [];
  for (let i = 0; i < closes.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m !== undefined && s !== undefined) {
      histogram.push(m - s);
    } else {
      histogram.push(undefined);
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Enriches candles with all technical indicators
 */
export function enrichCandlesWithIndicators(rawCandles: Candle[]): Candle[] {
  if (rawCandles.length === 0) return [];
  const closes = rawCandles.map((c) => c.close);

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsi = calculateRSI(closes, 14);
  const bb = calculateBollingerBands(closes, 20, 2);
  const macdData = calculateMACD(closes, 12, 26, 9);

  return rawCandles.map((candle, idx) => ({
    ...candle,
    ema20: ema20[idx],
    ema50: ema50[idx],
    ema200: ema200[idx],
    rsi: rsi[idx],
    bbUpper: bb.upper[idx],
    bbMiddle: bb.middle[idx],
    bbLower: bb.lower[idx],
    macd: macdData.macd[idx],
    macdSignal: macdData.signal[idx],
    macdHist: macdData.histogram[idx],
  }));
}

/**
 * Detects Key Support and Resistance pivots from candle peaks & troughs
 */
export function detectKeyLevels(candles: Candle[]): { supports: number[]; resistances: number[] } {
  if (candles.length < 10) return { supports: [], resistances: [] };

  const currentPrice = candles[candles.length - 1].close;
  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  // Look for 3-bar swing highs and lows
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const prev1 = candles[i - 1];
    const prev2 = candles[i - 2];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];

    if (c.high > prev1.high && c.high > prev2.high && c.high > next1.high && c.high > next2.high) {
      pivotHighs.push(c.high);
    }
    if (c.low < prev1.low && c.low < prev2.low && c.low < next1.low && c.low < next2.low) {
      pivotLows.push(c.low);
    }
  }

  // Filter and cluster levels
  const resistances = pivotHighs
    .filter((h) => h >= currentPrice * 0.99)
    .sort((a, b) => a - b)
    .slice(0, 3);

  const supports = pivotLows
    .filter((l) => l <= currentPrice * 1.01)
    .sort((a, b) => b - a)
    .slice(0, 3);

  // Fallbacks if not enough swings
  if (resistances.length === 0) {
    resistances.push(currentPrice * 1.03, currentPrice * 1.07);
  }
  if (supports.length === 0) {
    supports.push(currentPrice * 0.97, currentPrice * 0.93);
  }

  return {
    supports: supports.map((v) => Number(v.toFixed(v > 10 ? 2 : 4))),
    resistances: resistances.map((v) => Number(v.toFixed(v > 10 ? 2 : 4))),
  };
}
