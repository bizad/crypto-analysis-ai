import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Target,
  ArrowDownCircle,
  ArrowUpCircle,
  Flame,
  CheckCircle2,
  Layers,
  Scale,
  RefreshCw,
  Info,
  Share2,
  Check,
} from 'lucide-react';
import { TechnicalAnalysisResult, CryptoCoin, Language, Theme, Candle } from '../types';
import { translations } from '../utils/translations';
import { shareContent } from '../utils/shareUtils';
import { CandlestickPredictionCard } from './CandlestickPredictionCard';

interface AIAnalysisPanelProps {
  coin: CryptoCoin;
  analysis: TechnicalAnalysisResult | null;
  candles?: Candle[];
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  lang: Language;
  theme: Theme;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  coin,
  analysis,
  candles = [],
  isAnalyzing,
  onTriggerAnalysis,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleShareAnalysis = async () => {
    if (!analysis) return;

    const recMap: Record<string, string> = {
      STRONG_BUY: 'خرید قوی (Strong Buy)',
      BUY: 'سیگنال خرید (Buy)',
      HOLD: 'نگهداری / نظارت (Hold)',
      SELL: 'سیگنال فروش (Sell)',
      STRONG_SELL: 'فروش فوری (Strong Sell)',
    };

    const recommendationLabel = recMap[analysis.recommendation] || analysis.recommendation;

    const summaryText =
      `📊 تحلیل تکنیکال هوش مصنوعی: ${coin.name} (${coin.symbol})\n` +
      `📈 وضعیت سیگنال: ${recommendationLabel}\n` +
      `🔥 پتانسیل رشد: ${analysis.growthPotentialScore}%\n` +
      `🎯 قیمت فعلی: $${coin.price.toLocaleString()}\n` +
      (analysis.tradeSetup?.entryPrice ? `🟢 محدوده ورود: $${analysis.tradeSetup.entryPrice}\n` : '') +
      (analysis.tradeSetup?.takeProfit1 ? `🎯 تارگت اول: $${analysis.tradeSetup.takeProfit1}\n` : '') +
      (analysis.tradeSetup?.stopLoss ? `🛑 حد ضرر: $${analysis.tradeSetup.stopLoss}\n` : '') +
      (analysis.keyFindings?.[0] ? `💡 نکته استراتژیک: ${analysis.keyFindings[0]}\n` : '') +
      `\n⚡ پلتفرم تحلیل جامع رمزارزها`;

    const res = await shareContent({
      title: `تحلیل تکنیکال ${coin.name}`,
      text: summaryText,
    });

    if (res.method !== 'cancelled') {
      setShareFeedback(lang === 'fa' ? res.messageFa : res.messageEn);
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-6 border transition-all shadow-xl flex flex-col gap-4 overflow-hidden w-full ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Header & Trigger Action: Fully responsive so button never overflows */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 flex-wrap">
              <span>{t.aiTechnicalAnalysis}</span>
              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {lang === 'fa'
                ? `بررسی رفتار قیمت، اندیکاتورها و اهداف تکنیکال ${coin.name}`
                : `Price action analysis, indicators, and technical setup for ${coin.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0 w-full sm:w-auto">
          {/* Web Share Button */}
          {analysis && (
            <button
              onClick={handleShareAnalysis}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm shrink-0 ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-purple-300 hover:text-purple-200'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
              }`}
              title={lang === 'fa' ? 'اشتراک‌گذاری خلاصه تحلیل تکنیکال' : 'Share Technical Analysis'}
            >
              {shareFeedback ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {shareFeedback
                  ? lang === 'fa'
                    ? 'اشتراک انجام شد'
                    : 'Shared'
                  : lang === 'fa'
                  ? 'اشتراک‌گذاری'
                  : 'Share'}
              </span>
            </button>
          )}

          {/* Trigger Analysis Button: Protected against overflow */}
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer whitespace-nowrap min-w-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>{t.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                <span>{t.runAnalysis}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Toast Banner if active */}
      {shareFeedback && (
        <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Analysis Content */}
      {analysis ? (
        <div className="flex flex-col gap-4">
          {/* Top Score Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* 1. Growth Potential Score */}
            <div
              className={`border rounded-2xl p-3 flex flex-col justify-between ${
                isDark ? 'bg-slate-950/80 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{t.growthScore}</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {analysis.growthPotentialScore}%
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400/80 font-medium">
                  {analysis.growthPotentialScore >= 90
                    ? '🔥 بسیار بالا'
                    : analysis.growthPotentialScore >= 75
                    ? 'پتانسیل خوب'
                    : 'متوسط'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full"
                  style={{ width: `${analysis.growthPotentialScore}%` }}
                />
              </div>
            </div>

            {/* 2. Recommendation / Signal */}
            <div
              className={`border rounded-2xl p-3 flex flex-col justify-between ${
                isDark ? 'bg-slate-950/80 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{t.recommendation}</span>
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {analysis.recommendation === 'STRONG_BUY'
                    ? lang === 'fa' ? 'خرید قوی' : 'STRONG BUY'
                    : analysis.recommendation === 'BUY'
                    ? lang === 'fa' ? 'سیگنال خرید' : 'BUY'
                    : analysis.recommendation === 'HOLD'
                    ? lang === 'fa' ? 'نگهداری / نظارت' : 'HOLD'
                    : lang === 'fa' ? 'خروج / فروش' : 'SELL'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 flex items-center justify-between">
                <span>{t.confidenceScore}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{analysis.confidenceScore}%</span>
              </div>
            </div>

            {/* 3. Trend Status */}
            <div
              className={`border rounded-2xl p-3 flex flex-col justify-between ${
                isDark ? 'bg-slate-950/80 border-cyan-500/30' : 'bg-cyan-50/70 border-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{t.marketTrend}</span>
                <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-cyan-700 dark:text-cyan-400 truncate">
                {lang === 'fa' ? analysis.trendFa : analysis.trendEn || analysis.trendFa}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between font-mono">
                <span>Status:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{analysis.trendStatus}</span>
              </div>
            </div>

            {/* 4. Risk / Reward */}
            <div
              className={`border rounded-2xl p-3 flex flex-col justify-between ${
                isDark ? 'bg-slate-950/80 border-purple-500/30' : 'bg-purple-50/70 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{t.riskReward}</span>
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400">
                {analysis.riskRewardRatio}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                {lang === 'fa' ? 'نسبت بازدهی به ریسک' : 'Risk to Reward Ratio'}
              </div>
            </div>
          </div>

          {/* 24h Candlestick Predicted Price Range */}
          <CandlestickPredictionCard
            coin={coin}
            candles={candles}
            analysis={analysis}
            lang={lang}
            theme={theme}
          />

          {/* Trade Setup Matrix (Entry, Take Profits, Stop Loss) */}
          <div
            className={`border rounded-2xl p-4 flex flex-col gap-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-200">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {lang === 'fa'
                    ? 'برنامه سطوح کلیدی تکنیکال و اهداف (Technical Setup Levels)'
                    : 'Technical Setup Levels & Targets'}
                </span>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-medium">
                {t.stepwiseEntry}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              {/* Entry Zone */}
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/90 border-cyan-500/30' : 'bg-white border-cyan-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-sans flex items-center gap-1">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t.entryZone}:</span>
                </div>
                <div className="text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                  ${analysis.entryZone?.min} - ${analysis.entryZone?.max}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  {lang === 'fa' ? 'توصیه: ورود در ۲ الی ۳ پله قیمتی' : 'Scale in 2-3 stages'}
                </div>
              </div>

              {/* Take Profits */}
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-white border-emerald-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-sans flex items-center gap-1">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.takeProfitTargets}:</span>
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xs space-y-0.5">
                  <div>
                    TP1: ${analysis.takeProfitTargets?.tp1}{' '}
                    <span className="text-[10px] opacity-85">
                      (+
                      {(
                        ((analysis.takeProfitTargets.tp1 - coin.price) / coin.price) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div>
                    TP2: ${analysis.takeProfitTargets?.tp2}{' '}
                    <span className="text-[10px] opacity-85">
                      (+
                      {(
                        ((analysis.takeProfitTargets.tp2 - coin.price) / coin.price) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div>
                    TP3: ${analysis.takeProfitTargets?.tp3}{' '}
                    <span className="text-[10px] opacity-85">
                      (+
                      {(
                        ((analysis.takeProfitTargets.tp3 - coin.price) / coin.price) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              </div>

              {/* Stop Loss */}
              <div
                className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-900/90 border-rose-500/30' : 'bg-white border-rose-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-sans flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{t.stopLoss}:</span>
                </div>
                <div className="text-rose-700 dark:text-rose-400 font-bold text-sm">
                  ${analysis.stopLoss}
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-sans mt-0.5">
                  {lang === 'fa' ? 'ریسک کنترل‌شده:' : 'Max Risk:'}{' '}
                  {Math.abs(
                    Number((((analysis.stopLoss - coin.price) / coin.price) * 100).toFixed(1))
                  )}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Patterns & Staged Entry Action Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Patterns */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {t.patternsDetected}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(lang === 'fa'
                  ? analysis.patternsDetected
                  : analysis.patternsDetectedEn || analysis.patternsDetected
                )?.map((pat, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 border ${
                      isDark
                        ? 'bg-slate-900 text-slate-200 border-slate-700'
                        : 'bg-white text-slate-800 font-semibold border-slate-200 shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {pat}
                  </span>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                isDark ? 'bg-slate-950/70 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {lang === 'fa' ? 'راهبرد ورود پله‌ای و مدیریت ریسک' : 'Staged Execution & Risk Strategy'}
              </span>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {lang === 'fa'
                  ? analysis.actionAdvice
                  : analysis.actionAdviceEn || analysis.actionAdvice}
              </p>
            </div>
          </div>

          {/* Indicator Confluence Table */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
              {t.confluence}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  RSI (14): {analysis.indicators?.rsi?.value}
                </div>
                <div className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                  {analysis.indicators?.rsi?.interpretation}
                </div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">MACD Confluence</div>
                <div className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                  {analysis.indicators?.macd?.interpretation}
                </div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Moving Averages</div>
                <div className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                  {analysis.indicators?.movingAverages?.summary}
                </div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Bollingers & Volume</div>
                <div className="text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                  {analysis.indicators?.volumeAnalysis}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Narrative Review */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t.detailedTechnicalReview}
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-justify">
              {lang === 'fa'
                ? analysis.aiDetailedPersianReview
                : analysis.aiDetailedEnglishReview || analysis.aiDetailedPersianReview}
            </div>
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="py-10 flex flex-col items-center justify-center gap-4 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {lang === 'fa' ? 'در حال پردازش عمیق کندل‌ها و سناریوهای تکنیکال...' : 'Analyzing candlestick patterns & indicators...'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {lang === 'fa'
                ? 'ارزیابی میانگین‌های متحرک، سطوح پیووت حمایتی/مقاومتی و الگوهای پرایس‌اکشن...'
                : 'Evaluating EMA ribbons, volume confluence, and calculating optimal risk-reward ratio...'}
            </p>
          </div>
          <div className="w-full max-w-md space-y-2.5 mt-2 px-4">
            <div className="h-3.5 bg-purple-500/15 dark:bg-purple-900/30 rounded-lg w-full" />
            <div className="h-3.5 bg-purple-500/15 dark:bg-purple-900/30 rounded-lg w-5/6 mx-auto" />
            <div className="h-3.5 bg-purple-500/15 dark:bg-purple-900/30 rounded-lg w-3/5 mx-auto" />
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
          <Sparkles className="w-8 h-8 text-purple-400/50 animate-bounce" />
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-300">
            {lang === 'fa'
              ? `تحلیل تکنیکال هوشمند برای ${coin.name} آماده است`
              : `AI Technical Analysis ready for ${coin.name}`}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            {lang === 'fa'
              ? 'با کلیک روی دکمه زیر، هوش مصنوعی کندل‌ها، میانگین‌ها و سطوح پیووت را ارزیابی کرده و اهداف ورود و خروج را مشخص می‌کند.'
              : 'Click below to run deep candlestick, indicator confluence, and breakout analysis.'}
          </p>
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold rounded-2xl transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            {t.runAnalysis}
          </button>
        </div>
      )}
    </div>
  );
};
