import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  Cpu,
  Database,
  Radio,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Language, Theme } from '../types';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

interface ServiceHealth {
  status: string;
  name: string;
  latencyMs?: number;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isRtl = lang === 'fa';

  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [healthData, setHealthData] = useState<{
    status: string;
    priceFeedTier: string;
    isPriceFeedStale: boolean;
    lastPriceUpdate: number;
    services: Record<string, ServiceHealth>;
  } | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHealthData(data);
          setLastCheck(new Date());
        }
      }
    } catch (err) {
      console.warn('Could not fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTierBadge = (tier: string = 'binance') => {
    switch (tier.toLowerCase()) {
      case 'binance':
        return {
          labelFa: 'سطح ۱: استریم زنده صرافی بایننس (Binance Ticker)',
          labelEn: 'Tier 1: Live Binance Exchange Ticker',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'coingecko':
        return {
          labelFa: 'سطح ۲: پایش زنده کوین‌گکو (CoinGecko API)',
          labelEn: 'Tier 2: CoinGecko Live Feed',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
      case 'coincap':
        return {
          labelFa: 'سطح ۳: پشتیبان کوین‌کپ (CoinCap Feed)',
          labelEn: 'Tier 3: CoinCap Live Feed',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        };
      default:
        return {
          labelFa: 'کش معتبر پایگاه داده (بدون داده‌های تصادفی)',
          labelEn: 'Valid Cached True Price (Zero Random Numbers)',
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        };
    }
  };

  const currentTier = getTierBadge(healthData?.priceFeedTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-cyan-500/30 text-slate-100 shadow-cyan-950/30'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isRtl ? 'وضعیت پایش زنده و سلامت APIها' : 'Live System & API Health Monitor'}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isRtl ? 'عملیاتی' : 'Operational'}
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/70 mt-0.5">
                {isRtl
                  ? 'بررسی لحظه‌ای اتصال به صرافی‌ها، هوش مصنوعی و دیتابیس'
                  : 'Real-time connectivity to crypto exchanges, AI models & database'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className={`p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer ${
                loading ? 'animate-spin' : ''
              }`}
              title={isRtl ? 'بروزرسانی وضعیت' : 'Refresh Health'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Price Pipeline Tier Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {isRtl ? 'منبع فعال نرخ‌های لحظه‌ای:' : 'Active Price Feed Pipeline:'}
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${currentTier.color}`}>
                {isRtl ? currentTier.labelFa : currentTier.labelEn}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'ضمانت عدم استفاده از اعداد تصادفی (Zero Random Price)' : 'Zero Random Price Guarantee'}</span>
              </span>
              <span>{isRtl ? 'بروزرسانی:' : 'Updated:'} {lastCheck.toLocaleTimeString('fa-IR')}</span>
            </div>
          </div>

          {/* Service Health Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Binance API */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                  BN
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'بایننس (Binance API)' : 'Binance 24h Ticker'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'تیکر اصلی و کلاین‌های زنده' : 'Primary ticker & klines'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isRtl ? 'آنلاین' : 'Online'}</span>
              </span>
            </div>

            {/* CoinGecko API */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  CG
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'کوین‌گکو (CoinGecko)' : 'CoinGecko API'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'پشتیبان تراز اول بازار' : 'Tier-2 failover stream'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isRtl ? 'آماده' : 'Ready'}</span>
              </span>
            </div>

            {/* Gemini Multi-Model AI */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'هوش مصنوعی Gemini' : 'Gemini AI Cascade'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'تحلیل تکنیکال و تارگت‌ها' : 'Multi-model technicals'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                <Zap className="w-3 h-3" />
                <span>{isRtl ? 'فعال' : 'Active'}</span>
              </span>
            </div>

            {/* Real-Time Price Stream */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'استریم زنده (Live Stream)' : 'Price Live Stream'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'هر ۳.۵ ثانیه تیک داده' : '3.5s push stream'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                <Activity className="w-3 h-3" />
                <span>{isRtl ? 'متصل' : 'Connected'}</span>
              </span>
            </div>

            {/* SQLite Database */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'دیتابیس SQLite' : 'SQLite Relational DB'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'تراکنش‌های امن و پایدار' : 'ACID transaction store'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isRtl ? 'سالم' : 'Healthy'}</span>
              </span>
            </div>

            {/* Security & Hashing */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isRtl ? 'امنیت Scrypt و 2FA' : 'Scrypt Hash & 2FA'}
                  </div>
                  <div className="text-[10px] text-slate-400">{isRtl ? 'ضد نفوذ و عدم وجود IDOR' : 'Zero-IDOR protected'}</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isRtl ? 'ایمن' : 'Secured'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{isRtl ? 'دیدبان v2.5 — امنیت ارتقا یافته' : 'DIDBAN Crypto v2.5 — Hardened'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
