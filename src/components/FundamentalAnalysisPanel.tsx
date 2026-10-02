import React, { useState } from 'react';
import {
  FileText,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Coins,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  RefreshCw,
  Share2,
  Check,
} from 'lucide-react';
import { FundamentalAnalysisResult, CryptoCoin, Language, Theme } from '../types';
import { translations } from '../utils/translations';
import { shareContent } from '../utils/shareUtils';

interface FundamentalAnalysisPanelProps {
  coin: CryptoCoin;
  fundamental: FundamentalAnalysisResult | null;
  isLoading: boolean;
  onRefresh?: () => void;
  lang: Language;
  theme: Theme;
}

export const FundamentalAnalysisPanel: React.FC<FundamentalAnalysisPanelProps> = ({
  coin,
  fundamental,
  isLoading,
  onRefresh,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div
        className={`rounded-3xl p-8 border flex flex-col items-center justify-center gap-3 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {lang === 'fa'
            ? `در حال واکشی و تحلیل شاخص‌های فاندامنتال، آن‌چین و اخبار ${coin.name}...`
            : `Fetching on-chain metrics, tokenomics, and news sentiment for ${coin.name}...`}
        </span>
      </div>
    );
  }

  if (!fundamental) {
    return (
      <div
        className={`rounded-3xl p-8 border text-center flex flex-col items-center justify-center gap-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {lang === 'fa'
            ? 'اطلاعات فاندامنتال هنوز بارگذاری نشده است.'
            : 'Fundamental data is not loaded yet.'}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.refreshFundamental}</span>
          </button>
        )}
      </div>
    );
  }

  const catalystsList =
    lang === 'fa'
      ? fundamental.keyCatalysts
      : fundamental.keyCatalystsEn || fundamental.keyCatalysts;

  const risksList =
    lang === 'fa'
      ? fundamental.keyRisks
      : fundamental.keyRisksEn || fundamental.keyRisks;

  const inflationStatusText =
    lang === 'fa'
      ? fundamental.tokenomicsHealth?.inflationStatus
      : fundamental.tokenomicsHealth?.inflationStatusEn || 'Low Inflation & Predictable Schedule';

  const ecosystemHealthText =
    lang === 'fa'
      ? fundamental.utilityAndAdoption?.ecosystemHealth
      : fundamental.utilityAndAdoption?.ecosystemHealthEn || 'Active on-chain traction and broad integrations';

  const summaryText =
    lang === 'fa'
      ? fundamental.summaryFa
      : fundamental.summaryEn || fundamental.summaryFa;

  const handleShareFundamental = async () => {
    if (!fundamental) return;

    const summaryShareText =
      `🌐 تحلیل فاندامنتال هوش مصنوعی: ${coin.name} (${coin.symbol})\n` +
      `🏆 امتیاز سلامت فاندامنتال: ${fundamental.fundamentalScore}% (گرید ${fundamental.rating})\n` +
      `📊 تمایلات بازار: ${fundamental.sentiment}\n` +
      `💎 ارزش بازار: $${(fundamental.marketCap / 1e9).toFixed(2)}B (رتبه ${fundamental.marketCapRank})\n\n` +
      `💡 خلاصه فاندامنتال:\n${summaryText}\n\n` +
      (catalystsList[0] ? `🚀 محرک رشد: ${catalystsList[0]}\n` : '') +
      (risksList[0] ? `⚠️ ریسک نظارتی/فنی: ${risksList[0]}\n` : '') +
      `\n⚡ پلتفرم تحلیل جامع رمزارزها`;

    const res = await shareContent({
      title: `تحلیل فاندامنتال ${coin.name}`,
      text: summaryShareText,
    });

    if (res.method !== 'cancelled') {
      setShareFeedback(lang === 'fa' ? res.messageFa : res.messageEn);
      setTimeout(() => setShareFeedback(null), 3500);
    }
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-6 border transition-all shadow-xl flex flex-col gap-5 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <span>{t.aiFundamentalAnalysis}</span>
              <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-500/30">
                On-Chain & Sentiment
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fa'
                ? `بررسی توکنومیکس، کاربرد اکوسیستم، ریسک‌ها و اخبار لحظه‌ای ${coin.name}`
                : `Tokenomics, ecosystem utility, risks, and live news sentiment for ${coin.name}`}
            </p>
          </div>
        </div>

        {/* Action & Sentiment */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
              fundamental.sentiment === 'VERY_BULLISH' || fundamental.sentiment === 'BULLISH'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                : fundamental.sentiment === 'NEUTRAL'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {lang === 'fa'
                ? fundamental.sentiment === 'VERY_BULLISH'
                  ? 'احساسات بسیار صعودی'
                  : fundamental.sentiment === 'BULLISH'
                  ? 'احساسات صعودی بازار'
                  : fundamental.sentiment === 'NEUTRAL'
                  ? 'احساسات خنثی / نظارت'
                  : 'احساسات محتاطانه / نزولی'
                : fundamental.sentiment === 'VERY_BULLISH'
                ? 'Strongly Bullish'
                : fundamental.sentiment === 'BULLISH'
                ? 'Bullish Sentiment'
                : fundamental.sentiment === 'NEUTRAL'
                ? 'Neutral / Monitoring'
                : 'Cautious / Bearish'}
            </span>
          </span>

          {/* Web Share Button */}
          <button
            onClick={handleShareFundamental}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-cyan-300 hover:text-cyan-200'
                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
            }`}
            title={lang === 'fa' ? 'اشتراک‌گذاری خلاصه تحلیل فاندامنتال' : 'Share Fundamental Analysis'}
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

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer shrink-0"
              title={lang === 'fa' ? 'بروزرسانی تحلیل فاندامنتال این ارز' : 'Refresh Fundamental Analysis'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading ? t.refreshingFundamental : t.refreshFundamental}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Share Toast Feedback */}
      {shareFeedback && (
        <div className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* Top 3 Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Fundamental Health Score & Rating */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.fundamentalScore}</div>
            <div className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-400 flex items-baseline gap-2">
              <span>{fundamental.fundamentalScore}%</span>
              <span className="text-xs bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-md font-bold">
                Grade {fundamental.rating}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Tokenomics Health */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.tokenomics}</div>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
              {fundamental.tokenomicsHealth?.score || 85}%
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {inflationStatusText}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Utility & Real Adoption */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}
        >
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.utilityAdoption}</div>
            <div className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400">
              {fundamental.utilityAndAdoption?.score || 88}%
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">
              {ecosystemHealthText}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div
        className={`p-4 rounded-2xl border leading-relaxed text-xs sm:text-sm text-justify ${
          isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          {lang === 'fa'
            ? 'ارزیابی تحلیلی بنیادین و چشم‌انداز کاربردی پروژه:'
            : 'Fundamental Analysis & Long-Term Value Proposition:'}
        </h3>
        <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
          {summaryText}
        </p>
      </div>

      {/* Catalysts & Risks Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Key Catalysts */}
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
            isDark ? 'bg-slate-950/60 border-emerald-500/20' : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.keyCatalysts}</span>
          </div>
          <ul className="space-y-1.5 text-xs">
            {catalystsList?.map((cat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Risks */}
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
            isDark ? 'bg-slate-950/60 border-rose-500/20' : 'bg-rose-50/70 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{t.keyRisks}</span>
          </div>
          <ul className="space-y-1.5 text-xs">
            {risksList?.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Curated News Feed */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Newspaper className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t.recentNewsSentiment}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'fa' ? 'پایش لحظه‌ای رسانه‌ها' : 'Live Curated Feed'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {fundamental.recentNews?.map((item, idx) => {
            const newsTitle = lang === 'fa' ? item.title : item.titleEn || item.title;
            const newsSummary = lang === 'fa' ? item.summary : item.summaryEn || item.summary;
            const newsTimeAgo = lang === 'fa' ? item.timeAgo : item.timeAgoEn || item.timeAgo;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {item.source}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.sentiment === 'BULLISH'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                          : item.sentiment === 'BEARISH'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-slate-200">
                    {newsTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {newsSummary}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
                  <span>{newsTimeAgo}</span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold flex items-center gap-0.5 cursor-pointer">
                    {lang === 'fa' ? 'جزئیات خبر' : 'Details'}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
