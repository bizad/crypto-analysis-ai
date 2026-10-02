import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CryptoCoin,
  Timeframe,
  Candle,
  TechnicalAnalysisResult,
  FundamentalAnalysisResult,
  Language,
  Theme,
  ThemeMode,
  VipSubscription,
  UserAccount,
} from './types';
import { INITIAL_COINS, generateSyntheticCandles } from './data/cryptoData';
import { translations } from './utils/translations';
import { Header } from './components/Header';
import { CoinProfileCard } from './components/CoinProfileCard';
import { TradingChart } from './components/TradingChart';
import { TomanTradingChart } from './components/TomanTradingChart';
import { CoinSearchBar } from './components/CoinSearchBar';
import { FearAndGreedWidget } from './components/FearAndGreedWidget';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { FundamentalAnalysisPanel } from './components/FundamentalAnalysisPanel';
import { GuideModal } from './components/GuideModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { GuideSection } from './components/GuideSection';
import { DisclaimerSection } from './components/DisclaimerSection';
import { FloatingBubbleMenu } from './components/FloatingBubbleMenu';
import { HeroDesignSection } from './components/HeroDesignSection';
import { ExchangeAdsSection } from './components/ExchangeAdsSection';
import { ContactModal } from './components/ContactModal';
import { VipSubscriptionModal } from './components/VipSubscriptionModal';
import { MarketHeatmap } from './components/MarketHeatmap';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SystemHealthModal } from './components/SystemHealthModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { HiddenAdminModal } from './components/HiddenAdminModal';
import { AppNavigationBar } from './components/AppNavigationBar';
import { WatchdogExplorer, COIN_AVATARS } from './components/WatchdogExplorer';
import { AppNavigationSection } from './types';
import {
  VIP_PLANS,
  VIP_CARD_NUMBER_FORMATTED,
  VIP_CARD_BANK,
  VIP_CARD_HOLDER,
  VIP_SUPPORT_PHONE,
} from './data/vipPlans';
import {
  LineChart,
  Newspaper,
  ShieldCheck,
  Mail,
  User,
  ExternalLink,
  CheckCircle2,
  Globe,
  Radio,
  Activity,
  Database,
  Lock,
  Search,
  Crown,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

/**
 * Automatically detects the user's browser locale on the first visit
 * and sets the application language (fa/en) accordingly.
 * If user previously selected a language, their choice stored in localStorage is respected.
 */
function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('crypto_app_lang');
    if (saved === 'fa' || saved === 'en') {
      return saved;
    }

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const locales =
        navigator.languages && navigator.languages.length > 0
          ? navigator.languages
          : [navigator.language || ''];

      for (const loc of locales) {
        const cleanLoc = (loc || '').toLowerCase().trim();
        // Persian / Farsi language codes: fa, fa-ir, fa-af, per, etc.
        if (
          cleanLoc.startsWith('fa') ||
          cleanLoc.startsWith('per') ||
          cleanLoc.includes('iran') ||
          cleanLoc.includes('farsi')
        ) {
          return 'fa';
        }
      }
    }
    // Default to 'en' for non-Persian browser locales on first visit
    return 'en';
  } catch (err) {
    console.warn('Could not detect browser locale, defaulting to fa:', err);
    return 'fa';
  }
}

// Detect system theme preference (dark/light)
function getSystemTheme(): Theme {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (err) {
    console.warn('Could not read system color-scheme preference:', err);
  }
  return 'dark';
}

// Detect initial theme mode ('system' | 'dark' | 'light')
function detectInitialThemeMode(): ThemeMode {
  try {
    const savedMode = localStorage.getItem('crypto_app_theme_mode') as ThemeMode | null;
    if (savedMode === 'system' || savedMode === 'dark' || savedMode === 'light') {
      return savedMode;
    }
    // Default to 'system' to automatically detect system theme preferences (light/dark) on initial load
    return 'system';
  } catch (err) {
    console.warn('Could not read stored theme mode:', err);
    return 'system';
  }
}

export function App() {
  const [lang, setLang] = useState<Language>(detectInitialLanguage);

  const [themeMode, setThemeMode] = useState<ThemeMode>(detectInitialThemeMode);
  const [theme, setTheme] = useState<Theme>(() => {
    const initialMode = detectInitialThemeMode();
    if (initialMode === 'system') {
      return getSystemTheme();
    }
    const savedTheme = localStorage.getItem('crypto_app_theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return getSystemTheme();
  });

  const t = translations[lang];

  // Market Coins List (Top 20 cryptocurrencies for heatmap and fast selection)
  const [marketCoins, setMarketCoins] = useState<CryptoCoin[]>(() =>
    INITIAL_COINS.map((c) => ({
      ...c,
      thumb: c.thumb || COIN_AVATARS[c.symbol.toUpperCase()],
    }))
  );
  const [isFetchingCoins, setIsFetchingCoins] = useState<boolean>(false);

  // Active Coin State (Only the single searched/focused coin is examined)
  const [selectedCoin, setSelectedCoin] = useState<CryptoCoin>(() => {
    const c0 = INITIAL_COINS[0];
    return {
      ...c0,
      thumb: c0.thumb || COIN_AVATARS[c0.symbol.toUpperCase()],
    };
  });
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [supports, setSupports] = useState<number[]>([]);
  const [resistances, setResistances] = useState<number[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

  // AI Technical & Fundamental Analysis States
  const [technicalAnalysis, setTechnicalAnalysis] = useState<TechnicalAnalysisResult | null>(null);
  const [isAnalyzingTech, setIsAnalyzingTech] = useState<boolean>(false);

  const [fundamentalAnalysis, setFundamentalAnalysis] = useState<FundamentalAnalysisResult | null>(null);
  const [isAnalyzingFund, setIsAnalyzingFund] = useState<boolean>(false);

  // App Navigation Section: SEARCH is now the primary & default landing view per user request
  const [activeSection, setActiveSection] = useState<AppNavigationSection>('SEARCH');

  // Contact & VIP Modal States
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);
  const [vipQuotaBlocked, setVipQuotaBlocked] = useState<boolean>(false);

  // User Auth & Modals State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('crypto_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('crypto_auth_token');
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSystemHealthModalOpen, setIsSystemHealthModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [initialReferralCode, setInitialReferralCode] = useState('');

  // 20. Poll unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    const token = authToken || localStorage.getItem('crypto_auth_token');
    if (!token) {
      setUnreadNotificationsCount(1);
      return;
    }
    try {
      const res = await fetch('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          const unread = data.notifications.filter((n: any) => !n.read).length;
          setUnreadNotificationsCount(unread);
        }
      }
    } catch {}
  }, [authToken]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Live Nobitex USDT to Toman Rate
  const [usdtRate, setUsdtRate] = useState<number>(229324);

  // Fetch live Nobitex USDT rate on mount
  useEffect(() => {
    fetch('/api/crypto/toman-data/USDT')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.tomanData?.usdtRate) {
          setUsdtRate(d.tomanData.usdtRate);
        }
      })
      .catch(() => {});
  }, []);

  // Extract ?ref= from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        setInitialReferralCode(ref);
        // If guest, open invite / auth modal to guide them
        if (!currentUser) {
          setIsAuthModalOpen(true);
        }
      }
      if (window.location.hash === '#admin') {
        setIsAdminModalOpen(true);
      }
    }
  }, []);

  // Sync / Refresh current user profile from server
  useEffect(() => {
    if (authToken && currentUser?.id) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('crypto_user', JSON.stringify(data.user));
            // If user has active VIP in database, ensure VIP state is active in local app state
            if (data.user.isVip) {
              setVipSubscription({
                planId: (data.user.vipPlan as any) || 'monthly',
                planName: 'اشتراک VIP فعال',
                priceToman: 3900000,
                priceUsdt: 79,
                isActive: true,
                purchasedAt: Date.now() - 3600000,
                expiresAt: data.user.vipExpiresAt || Date.now() + 30 * 86400000,
                paymentMethod: 'toman',
              });
            }
          }
        })
        .catch((e) => console.warn('Sync me error:', e));
    }
  }, [authToken]);

  // VIP Subscription & Daily Quota Tracking (1 Free Analysis per Day for non-VIP)
  const [vipSubscription, setVipSubscription] = useState<VipSubscription | null>(() => {
    try {
      const saved = localStorage.getItem('crypto_vip_sub');
      if (saved) {
        const parsed: VipSubscription = JSON.parse(saved);
        if (parsed && parsed.isActive && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading VIP subscription:', e);
    }
    return null;
  });

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const [dailyUsage, setDailyUsage] = useState<{ date: string; count: number }>(() => {
    try {
      const saved = localStorage.getItem('crypto_daily_analysis');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.date === getTodayKey()) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading daily analysis usage:', e);
    }
    return { date: getTodayKey(), count: 0 };
  });

  const isVipActive = Boolean(
    (vipSubscription && vipSubscription.isActive && vipSubscription.expiresAt > Date.now()) ||
    (currentUser && currentUser.isVip && (!currentUser.vipExpiresAt || currentUser.vipExpiresAt > Date.now()))
  );

  // Each user receives 2 free analyses per day PLUS 1 additional analysis per week for EACH invited friend!
  const BASE_FREE_REFRESH_LIMIT = 2;
  const friendBonusLimit = currentUser?.weeklyBonusQuota || 0;
  const TOTAL_FREE_LIMIT = BASE_FREE_REFRESH_LIMIT + friendBonusLimit;

  const todayKey = getTodayKey();
  const currentUsageCount = dailyUsage.date === todayKey ? dailyUsage.count : 0;
  const remainingFreeToday = isVipActive ? 9999 : Math.max(0, TOTAL_FREE_LIMIT - currentUsageCount);

  // Function to verify and consume quota (allows if VIP or if daily count < limit)
  const checkAndConsumeQuota = (): boolean => {
    if (isVipActive) {
      return true;
    }
    const currentDay = getTodayKey();
    const currentCount = dailyUsage.date === currentDay ? dailyUsage.count : 0;
    if (currentCount >= TOTAL_FREE_LIMIT) {
      setVipQuotaBlocked(true);
      setIsVipModalOpen(true);
      return false;
    }

    // Consume 1 free manual analysis refresh
    const updated = { date: currentDay, count: currentCount + 1 };
    setDailyUsage(updated);
    localStorage.setItem('crypto_daily_analysis', JSON.stringify(updated));
    return true;
  };

  const handleAuthSuccess = (user: UserAccount, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('crypto_user', JSON.stringify(user));
    localStorage.setItem('crypto_auth_token', token);
    if (user.isVip) {
      setVipSubscription({
        planId: (user.vipPlan as any) || 'monthly',
        planName: 'اشتراک VIP فعال',
        priceToman: 3900000,
        priceUsdt: 79,
        isActive: true,
        purchasedAt: Date.now() - 3600000,
        expiresAt: user.vipExpiresAt || Date.now() + 30 * 86400000,
        paymentMethod: 'toman',
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('crypto_user');
    localStorage.removeItem('crypto_auth_token');
    setIsProfileModalOpen(false);
  };

  const handleActivateVip = (sub: VipSubscription) => {
    setVipSubscription(sub);
    localStorage.setItem('crypto_vip_sub', JSON.stringify(sub));
    setVipQuotaBlocked(false);
  };

  // Prevent repeated auto-calls
  const hasInitialized = useRef(false);

  // Listen for real-time OS theme preference changes when system-sync is active
  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
      return () => (mediaQuery as any).removeListener(handleSystemThemeChange);
    }
  }, [themeMode]);

  // Apply Theme & Direction Effects
  useEffect(() => {
    localStorage.setItem('crypto_app_theme', theme);
    document.documentElement.classList.add('theme-transitioning');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 450);
    return () => clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('crypto_app_lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.title = t.appTitle;
  }, [lang, t.appTitle]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeMode(nextTheme);
    try {
      localStorage.setItem('crypto_app_theme_mode', nextTheme);
      localStorage.setItem('crypto_app_theme', nextTheme);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleSystemSync = () => {
    if (themeMode === 'system') {
      // Disengage system sync: retain current theme as manual selection
      setThemeMode(theme);
      try {
        localStorage.setItem('crypto_app_theme_mode', theme);
        localStorage.setItem('crypto_app_theme', theme);
      } catch (e) {
        console.warn(e);
      }
    } else {
      // Engage system sync: immediately detect and sync with system preference
      const sysTheme = getSystemTheme();
      setThemeMode('system');
      setTheme(sysTheme);
      try {
        localStorage.setItem('crypto_app_theme_mode', 'system');
        localStorage.setItem('crypto_app_theme', sysTheme);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  // 1. Fetch Candles for currently selected coin with automatic retry & exact coin parameters
  const fetchCandles = useCallback(
    async (coin: CryptoCoin, tf: Timeframe, isRetry = false): Promise<Candle[]> => {
      setIsChartLoading(true);
      try {
        const cleanSymbol = encodeURIComponent((coin.symbol || 'BTC').replace(/[^a-zA-Z0-9]/g, ''));
        const queryParams = new URLSearchParams({
          timeframe: tf,
          coinId: coin.id || '',
          price: (coin.price || 0).toString(),
          change24h: (coin.change24h || 0).toString(),
        });
        const res = await fetch(`/api/crypto/candles/${cleanSymbol}?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.candles) && data.candles.length > 0) {
            setCandles(data.candles);
            setSupports(data.supports || []);
            setResistances(data.resistances || []);
            setIsChartLoading(false);
            return data.candles;
          }
        }
      } catch (err) {
        if (!isRetry) {
          // Retry once after brief interval
          await new Promise((r) => setTimeout(r, 700));
          return fetchCandles(coin, tf, true);
        }
        console.warn('Using client-side candle calculation:', err);
      }

      // Smooth fallback synthetic candles specific to this coin
      const trend = coin.change24h >= 0 ? 0.002 : -0.001;
      const synth = generateSyntheticCandles(coin.price || 100, 75, trend);
      setCandles(synth);
      setIsChartLoading(false);
      return synth;
    },
    []
  );

  // Trigger candle fetch on coin or timeframe change
  useEffect(() => {
    fetchCandles(selectedCoin, timeframe);
  }, [selectedCoin.id, timeframe, fetchCandles]);

  // 2. Trigger AI Technical Analysis
  const handleAnalyzeTechnical = useCallback(async (activeCandles?: Candle[], bypassQuota = false) => {
    if (!selectedCoin) return;
    if (!bypassQuota && !checkAndConsumeQuota()) return;

    setIsAnalyzingTech(true);
    const candleSet = activeCandles && activeCandles.length > 0 ? activeCandles : candles;

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin: selectedCoin,
          candles: candleSet,
          timeframe,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          setTechnicalAnalysis(data.analysis);
        }
      }
    } catch (err) {
      console.warn('Technical analysis request fallback handled:', err);
    } finally {
      setIsAnalyzingTech(false);
    }
  }, [selectedCoin, candles, timeframe, isVipActive, dailyUsage]);

  // 3. Trigger AI Fundamental Analysis
  const handleAnalyzeFundamental = useCallback(async (isManualRefresh = false) => {
    if (!selectedCoin) return;
    if (isManualRefresh && !checkAndConsumeQuota()) return;

    setIsAnalyzingFund(true);

    try {
      const res = await fetch('/api/ai/fundamental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin: selectedCoin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fundamental) {
          setFundamentalAnalysis(data.fundamental);
        }
      }
    } catch (err) {
      console.warn('Fundamental analysis request fallback handled:', err);
    } finally {
      setIsAnalyzingFund(false);
    }
  }, [selectedCoin, isVipActive, dailyUsage]);

  // Standalone chart refresher that fetches live candles and updates both USD & Toman charts
  const handleRefreshChart = useCallback(async (targetCoin = selectedCoin, targetTf = timeframe) => {
    if (!targetCoin) return candles;
    setIsChartLoading(true);
    try {
      const freshCandles = await fetchCandles(targetCoin, targetTf);
      setCandles(freshCandles);
      return freshCandles;
    } catch (err) {
      console.warn('Chart refresh error, retaining previous dataset:', err);
      return candles;
    } finally {
      setIsChartLoading(false);
    }
  }, [selectedCoin, timeframe, fetchCandles, candles]);

  // Trigger both analyses simultaneously AND guarantee charts are refreshed with latest market data
  const handleAnalyzeAll = useCallback(async (currentCandles?: Candle[], isAutoInit = false) => {
    if (!isAutoInit && !checkAndConsumeQuota()) return;

    let activeCandles = currentCandles;
    if (!activeCandles || activeCandles.length === 0) {
      activeCandles = await handleRefreshChart();
    }
    handleAnalyzeTechnical(activeCandles, true);
    handleAnalyzeFundamental(false);
  }, [handleRefreshChart, handleAnalyzeTechnical, handleAnalyzeFundamental, isVipActive, dailyUsage]);

  // Fetch Top 20 market coins with live prices from /api/crypto/coins
  const fetchMarketCoins = useCallback(async () => {
    setIsFetchingCoins(true);
    try {
      const res = await fetch('/api/crypto/coins');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.coins) && data.coins.length > 0) {
          const mappedCoins: CryptoCoin[] = data.coins.map((c: any) => ({
            ...c,
            thumb: c.thumb || COIN_AVATARS[c.symbol?.toUpperCase()] || '',
          }));
          setMarketCoins(mappedCoins);
          // Update selectedCoin if present in updated coins
          setSelectedCoin((prev) => {
            const updated = mappedCoins.find(
              (c: CryptoCoin) => c.id === prev.id || c.symbol.toUpperCase() === prev.symbol.toUpperCase()
            );
            if (updated) {
              return {
                ...prev,
                ...updated,
                thumb: updated.thumb || prev.thumb || COIN_AVATARS[prev.symbol.toUpperCase()],
              };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching market coins:', err);
    } finally {
      setIsFetchingCoins(false);
    }
  }, []);

  // 12. Real-time Live Price Streaming (SSE) with Fallback Polling
  useEffect(() => {
    fetchMarketCoins();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/prices/stream');
      eventSource.onopen = () => {
        setIsLiveStreaming(true);
      };
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && Array.isArray(data.coins) && data.coins.length > 0) {
            setIsLiveStreaming(true);
            setMarketCoins((prevCoins) => {
              const updatedMap = new Map(
                data.coins.map((c: any) => [c.id || c.symbol?.toUpperCase(), c])
              );
              return prevCoins.map((old) => {
                const live: any = updatedMap.get(old.id) || updatedMap.get(old.symbol?.toUpperCase());
                if (live && typeof live.current_price === 'number') {
                  return {
                    ...old,
                    current_price: live.current_price,
                    price_change_percentage_24h:
                      live.price_change_percentage_24h ?? old.price_change_percentage_24h,
                    high_24h: live.high_24h ?? old.high_24h,
                    low_24h: live.low_24h ?? old.low_24h,
                  };
                }
                return old;
              });
            });

            setSelectedCoin((prev) => {
              const live: any = data.coins.find(
                (c: any) =>
                  c.id === prev.id || c.symbol?.toUpperCase() === prev.symbol?.toUpperCase()
              );
              if (live && typeof live.current_price === 'number' && live.current_price !== prev.current_price) {
                return {
                  ...prev,
                  current_price: live.current_price,
                  price_change_percentage_24h:
                    live.price_change_percentage_24h ?? prev.price_change_percentage_24h,
                  high_24h: live.high_24h ?? prev.high_24h,
                  low_24h: live.low_24h ?? prev.low_24h,
                };
              }
              return prev;
            });
          }
        } catch {}
      };

      eventSource.onerror = () => {
        setIsLiveStreaming(false);
      };
    } catch {
      setIsLiveStreaming(false);
    }

    const interval = setInterval(fetchMarketCoins, 25000);
    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchMarketCoins]);

  // Auto-run first analysis once candles load initially
  useEffect(() => {
    if (!hasInitialized.current && candles.length > 0) {
      hasInitialized.current = true;
      handleAnalyzeAll(candles, true);
    }
  }, [candles, handleAnalyzeAll]);

  // Select a new coin from search or heatmap
  const handleSelectCoin = async (coinId: string) => {
    // Immediately check if coin already exists in marketCoins or INITIAL_COINS for instant UI response
    const localMatch =
      marketCoins.find((c) => c.id === coinId || c.symbol.toLowerCase() === coinId.toLowerCase()) ||
      INITIAL_COINS.find((c) => c.id === coinId || c.symbol.toLowerCase() === coinId.toLowerCase());

    let targetCoin = localMatch || selectedCoin;
    if (localMatch) {
      setSelectedCoin(localMatch);
      setTechnicalAnalysis(null);
      setFundamentalAnalysis(null);
    }

    try {
      const res = await fetch(`/api/crypto/coin/${encodeURIComponent(coinId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.coin) {
          targetCoin = {
            ...data.coin,
            thumb: data.coin.thumb || COIN_AVATARS[data.coin.symbol?.toUpperCase()] || '',
          };
          setSelectedCoin(targetCoin);
        }
      }
    } catch (err) {
      console.warn('Error selecting coin from search/api:', err);
    }

    // Log search telemetry for admin dashboard
    fetch('/api/telemetry/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${targetCoin.name} (${targetCoin.symbol})`,
        userId: currentUser?.id,
        userIdentifier: currentUser?.phone || currentUser?.email || 'guest',
      }),
    }).catch(() => {});

    // Fetch candles for newly selected coin and automatically update both technical & fundamental analyses
    const newCandles = await fetchCandles(targetCoin, timeframe);
    handleAnalyzeAll(newCandles, true);

    // If user selected coin from Heatmap view, switch to Technical view to inspect charts and AI
    if (activeSection === 'HEATMAP') {
      setActiveSection('TECHNICAL');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="app-root-container"
      className={`min-h-screen transition-colors duration-500 ease-in-out flex flex-col font-sans overflow-x-hidden ${
        isDark ? 'bg-[#050b18]/60 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Spacious Header with VIP, User Profile & Admin Controls */}
      <Header
        lang={lang}
        theme={theme}
        themeMode={themeMode}
        onToggleLang={toggleLang}
        onToggleTheme={toggleTheme}
        onToggleSystemSync={toggleSystemSync}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenVip={() => {
          setVipQuotaBlocked(false);
          setIsVipModalOpen(true);
        }}
        isVipActive={isVipActive}
        remainingFreeToday={remainingFreeToday}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenHealthModal={() => setIsSystemHealthModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        isLiveStreaming={isLiveStreaming}
      />

      {/* Main App Navigation Bar: Renders each distinct section separately */}
      <AppNavigationBar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        selectedCoin={selectedCoin}
        lang={lang}
        theme={theme}
        isVipActive={isVipActive}
      />

      {/* Main Content Area with Side Clearance for Iconic Navigation Rail */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          lang === 'fa' ? 'pr-14 sm:pr-16 md:pr-20' : 'pl-14 sm:pl-16 md:pl-20'
        }`}
      >
        {/* Futuristic Hero Banner & 3D Artwork (as designed in tarh.png) */}
        <section
          id="section-hero-banner"
          className="w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pt-3"
        >
          <HeroDesignSection
            lang={lang}
            theme={theme}
            selectedCoin={selectedCoin}
            onSelectCoin={handleSelectCoin}
            onNavigateSection={setActiveSection}
            onOpenAnalysis={() => setActiveSection('TECHNICAL')}
          />
        </section>

        {/* Persistent Exchange Referral & Top Analyses Section (matching tarh.png) */}
        <section
          id="section-persistent-exchanges"
          className="w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pt-4"
        >
          <ExchangeAdsSection
            lang={lang}
            theme={theme}
            onOpenContact={() => setIsContactOpen(true)}
          />
        </section>

        {/* Main Container: Distinct views for each section */}
        <main
          id="main-app-content"
          className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:px-6 py-4 flex flex-col gap-5"
        >
        {/* =========================================================================
            SECTION 1: TECHNICAL & CHARTS
            ========================================================================= */}
        {activeSection === 'TECHNICAL' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Selected Coin Spotlight Profile Card */}
            <div id="section-coin-profile">
              <CoinProfileCard
                coin={selectedCoin}
                lang={lang}
                theme={theme}
                isAnalyzing={isAnalyzingTech || isAnalyzingFund}
                onRefreshAnalysis={() => handleAnalyzeAll()}
              />
            </div>

            {/* Candlestick Charts & AI Setup Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Chart Area (7 columns) */}
              <div id="section-charts" className="lg:col-span-7 flex flex-col gap-5">
                {/* Dollar Candlestick Chart */}
                <TradingChart
                  coin={selectedCoin}
                  candles={candles}
                  timeframe={timeframe}
                  onChangeTimeframe={(tf) => setTimeframe(tf)}
                  onRefreshChart={() => handleRefreshChart()}
                  supports={supports}
                  resistances={resistances}
                  analysis={technicalAnalysis}
                  isLoading={isChartLoading}
                  lang={lang}
                  theme={theme}
                />

                {/* Toman Candlestick Chart (Right below the USD Chart) */}
                <TomanTradingChart
                  coin={selectedCoin}
                  candles={candles}
                  timeframe={timeframe}
                  onChangeTimeframe={(tf) => setTimeframe(tf)}
                  onRefreshChart={() => handleRefreshChart()}
                  isLoading={isChartLoading}
                  lang={lang}
                  theme={theme}
                />

                {/* Fear & Greed Sentiment Widget Placed Directly Underneath the Toman Chart */}
                <div id="section-fear-greed" className="w-full">
                  <FearAndGreedWidget
                    coin={selectedCoin}
                    lang={lang}
                    theme={theme}
                    isVipActive={isVipActive}
                    onOpenVipModal={() => {
                      setVipQuotaBlocked(true);
                      setIsVipModalOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* AI Technical Analysis Panel (5 columns) */}
              <div id="section-technical-ai" className="lg:col-span-5 flex flex-col gap-4">
                <AIAnalysisPanel
                  coin={selectedCoin}
                  analysis={technicalAnalysis}
                  candles={candles}
                  isAnalyzing={isAnalyzingTech}
                  onTriggerAnalysis={() => handleAnalyzeTechnical(candles)}
                  lang={lang}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2: FUNDAMENTAL & NEWS ANALYSIS
            ========================================================================= */}
        {activeSection === 'FUNDAMENTAL' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* Selected Coin Spotlight Profile Card */}
            <div id="section-coin-profile-fund">
              <CoinProfileCard
                coin={selectedCoin}
                lang={lang}
                theme={theme}
                isAnalyzing={isAnalyzingTech || isAnalyzingFund}
                onRefreshAnalysis={() => handleAnalyzeAll()}
              />
            </div>

            {/* Deep Fundamental Analysis Panel */}
            <div id="section-fundamental-ai">
              <FundamentalAnalysisPanel
                coin={selectedCoin}
                fundamental={fundamentalAnalysis}
                isLoading={isAnalyzingFund}
                onRefresh={() => handleAnalyzeFundamental(true)}
                lang={lang}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: MARKET HEATMAP (D3 TREE MAP)
            ========================================================================= */}
        {activeSection === 'HEATMAP' && (
          <div id="section-heatmap" className="animate-in fade-in duration-200">
            <MarketHeatmap
              coins={marketCoins}
              selectedCoinId={selectedCoin.id}
              onSelectCoin={handleSelectCoin}
              lang={lang}
              theme={theme}
              onRefresh={fetchMarketCoins}
              isRefreshing={isFetchingCoins}
            />
          </div>
        )}

        {/* =========================================================================
            SECTION 4: COIN EXPLORER & WATCHDOG (DEFAULT / PRIMARY HOME)
            ========================================================================= */}
        {activeSection === 'SEARCH' && (
          <WatchdogExplorer
            coins={marketCoins}
            selectedCoin={selectedCoin}
            onSelectCoin={handleSelectCoin}
            onNavigateToSection={(sec) => setActiveSection(sec)}
            usdtRate={usdtRate}
            lang={lang}
            theme={theme}
            isVipActive={isVipActive}
            onOpenVipModal={() => {
              setVipQuotaBlocked(true);
              setIsVipModalOpen(true);
            }}
          />
        )}

        {/* =========================================================================
            SECTION 5: VIP SUBSCRIPTIONS & SERVICES
            ========================================================================= */}
        {activeSection === 'VIP' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            {/* VIP Status Banner */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden ${
                isVipActive
                  ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40'
                  : 'bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border-purple-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {isVipActive
                        ? (lang === 'fa' ? 'اشتراک VIP شما فعال است!' : 'Your VIP Subscription is Active!')
                        : (lang === 'fa' ? 'ارتقا به حساب کاربری VIP هوش مصنوعی' : 'Upgrade to AI VIP Membership')}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    {lang === 'fa'
                      ? 'دسترسی نامحدود به موتور تحلیلی Gemini 2.5، پیش‌بینی نوسانات ۲۴ ساعته، پایش لحظه‌ای اخبار صرافی‌ها و ربات هوشمند تلگرام.'
                      : 'Unlimited Gemini 2.5 AI market analyses, 24h volatility forecasts, instant exchange news sentiment, and telegram signals.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setVipQuotaBlocked(false);
                      setIsVipModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{lang === 'fa' ? 'خرید و فعال‌سازی اشتراک VIP' : 'Activate VIP Now'}</span>
                  </button>

                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'fa' ? 'کسب درآمد رفرال' : 'Referral Rewards'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Card Deposit & 10-Minute Timer Highlight */}
            <div
              className={`p-4 sm:p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDark
                  ? 'bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-blue-500/30 text-white'
                  : 'bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-blue-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  سامان
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm">
                      {VIP_CARD_BANK} • صاحب حساب: {VIP_CARD_HOLDER}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      مهلت ۱۰ دقیقه‌ای با قیمت لحظه‌ای
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-mono font-black text-amber-400 mt-1" dir="ltr">
                    {VIP_CARD_NUMBER_FORMATTED}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">ارسال فیش واریز:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{VIP_SUPPORT_PHONE}</span>
                <span className="text-[10px] text-slate-400">(روبیکا • بله • واتس‌اپ)</span>
                <button
                  onClick={() => setIsVipModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-500/20 transition-all mr-auto sm:mr-0"
                >
                  مشاهده جزییات و پرداخت
                </button>
              </div>
            </div>

            {/* VIP Plans Grid - 5 Official Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {VIP_PLANS.map((plan) => {
                const planToman = Math.round(plan.priceUsdt * usdtRate);
                const isPopular = plan.id === 'monthly';
                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-3xl border flex flex-col justify-between transition-all ${
                      isPopular
                        ? 'border-amber-500/80 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-900 border-2 shadow-lg shadow-amber-500/10'
                        : isDark
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div>
                      {plan.badgeFa && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${
                            isPopular
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {lang === 'fa' ? plan.badgeFa : plan.badgeEn}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {lang === 'fa' ? plan.nameFa : plan.nameEn}
                      </h3>
                      <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                        {plan.priceUsdt} دلار / USDT
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 font-mono">
                        <div className="text-lg font-black text-emerald-400">
                          {planToman.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {lang === 'fa' ? 'تومان با نرخ لحظه‌ای' : 'Toman live'}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2">
                        {lang === 'fa' ? plan.savingsFa : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsVipModalOpen(true)}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs shadow cursor-pointer transition-all ${
                        isPopular
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {lang === 'fa' ? 'انتخاب و پرداخت' : 'Select & Pay'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 6: GUIDE
            ========================================================================= */}
        {activeSection === 'GUIDE' && (
          <div id="section-guide-view" className="animate-in fade-in duration-200">
            <GuideSection lang={lang} theme={theme} />
          </div>
        )}

        {/* =========================================================================
            SECTION 7: DISCLAIMER
            ========================================================================= */}
        {activeSection === 'DISCLAIMER' && (
          <div id="section-disclaimer-view" className="animate-in fade-in duration-200">
            <DisclaimerSection
              lang={lang}
              theme={theme}
              onOpenModal={() => setIsDisclaimerOpen(true)}
            />
          </div>
        )}

        {/* =========================================================================
            SECTION 8: CONTACT US
            ========================================================================= */}
        {activeSection === 'CONTACT' && (
          <div id="section-contact-view" className="animate-in fade-in duration-200 max-w-4xl mx-auto w-full">
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-xl ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/40">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                  <Mail className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {lang === 'fa' ? 'تماس با ما و پشتیبانی ۲۴/۷' : 'Contact Us & Support 24/7'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'fa'
                      ? 'ارتباط مستقیم با حامد فرّی (توسعه‌دهنده اصلی) و تیم پشتیبانی پلتفرم دیده‌بان'
                      : 'Direct contact with Hamed Farri (Lead Developer) & Support Team'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block mb-1">
                      {lang === 'fa' ? 'ایمیل رسمی توسعه‌دهنده:' : 'Official Developer Email:'}
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-400">hamed.farri@gmail.com</span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block mb-1">
                      {lang === 'fa' ? 'پشتیبانی پیام‌رسان‌ها (واتس‌اپ، بله، روبیکا):' : 'Messengers Support:'}
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-400">{VIP_SUPPORT_PHONE}</span>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block mb-1">
                      {lang === 'fa' ? 'کانال ارتباطی مستقیم و ثبت پیام:' : 'Quick Direct Message:'}
                    </span>
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="mt-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'ارسال پیام مستقیم / تیکت' : 'Send Direct Message / Ticket'}</span>
                    </button>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'همکاری‌های تجاری و تبلیغات' : 'Partnerships & Ads'}</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'fa'
                        ? 'جهت ثبت تبلیغات صرافی‌ها، ارائه بسته‌های تحلیلی اختصاصی، یا ادغام وب‌سرویس‌های مالی می‌توانید با ما در ارتباط باشید.'
                        : 'For exchange partner advertisements, customized market analytics packages, or API integrations, feel free to reach out.'}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>{lang === 'fa' ? 'پاسخگویی سریع کمتر از ۱ ساعت' : 'Fast response within 1 hour'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Trust & Creator Footer */}
      <footer
        className={`border-t py-8 text-xs transition-colors mt-auto ${
          isDark
            ? 'bg-slate-950 border-slate-900 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          {/* Top Footer: Creator Highlight & Contact Trigger */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 font-mono">
                HF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-200 dark:text-slate-100">
                    {t.developedBy}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-medium">
                    {lang === 'fa' ? 'توسعه‌دهنده اصلی' : 'Lead Developer'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'fa'
                    ? 'طراحی سیستم‌های الگوریتمی، پایش بازارهای مالی و ادغام هوش مصنوعی'
                    : 'Architected for algorithmic accuracy, financial analytics, and AI integrations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dedicated Admin Entry Point with 2FA - Icon only per user instruction */}
              <button
                id="footer-admin-btn"
                onClick={() => setIsAdminModalOpen(true)}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center border transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-purple-950/50 hover:bg-purple-900/70 border-purple-500/40 text-purple-200 hover:border-purple-400 shadow-purple-950/40'
                    : 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-900'
                }`}
                aria-label={lang === 'fa' ? 'ورود مدیریت امن (۲FA)' : 'Admin Portal (2FA)'}
                title={lang === 'fa' ? 'ورود مدیریت امن (۲FA)' : 'Admin Portal (2FA)'}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setIsContactOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/40 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{t.contactUs}</span>
              </button>
            </div>
          </div>

          {/* Bottom Footer: Data Sources, APIs & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 flex-wrap text-slate-400">
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                {t.trustedApisBadge}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span>
                © {new Date().getFullYear()} {t.appTitle}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        lang={lang}
        theme={theme}
      />

      {/* VIP Subscription Modal */}
      <VipSubscriptionModal
        isOpen={isVipModalOpen}
        onClose={() => {
          setIsVipModalOpen(false);
          setVipQuotaBlocked(false);
        }}
        onActivateVip={handleActivateVip}
        vipSubscription={vipSubscription}
        remainingFreeToday={remainingFreeToday}
        quotaBlockedNotice={vipQuotaBlocked}
        authToken={authToken || undefined}
        lang={lang}
        theme={theme}
      />

      {/* Authentication (Login / Register) Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
        theme={theme}
        initialReferralCode={initialReferralCode}
      />

      {/* User Profile Modal (Deposits, Tickets, Referral Stats) */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          authToken={authToken || undefined}
          onLogout={handleLogout}
          onOpenVipModal={() => setIsVipModalOpen(true)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* 20. In-App Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => {
          setIsNotificationsModalOpen(false);
          fetchUnreadCount();
        }}
        authToken={authToken || undefined}
        lang={lang}
        theme={theme}
        onOpenTickets={() => {
          setIsNotificationsModalOpen(false);
          setIsProfileModalOpen(true);
        }}
        onOpenVip={() => {
          setIsNotificationsModalOpen(false);
          setIsVipModalOpen(true);
        }}
      />

      {/* 23. Live System & APIs Health Modal */}
      <SystemHealthModal
        isOpen={isSystemHealthModalOpen}
        onClose={() => setIsSystemHealthModalOpen(false)}
        lang={lang}
        theme={theme}
      />

      {/* Invite Friends Modal (+1 Weekly Free Analysis per Friend) */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        lang={lang}
        theme={theme}
      />

      {/* Hidden Master Admin Backend Modal */}
      <HiddenAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Floating Bubble Menu for Guide & Legal/Risk Disclaimer */}
      <FloatingBubbleMenu
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        lang={lang}
        theme={theme}
      />

      {/* Guide & Precision Tips Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
        lang={lang}
        theme={theme}
      />

      {/* Legal & Risk Management Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
        lang={lang}
        theme={theme}
      />
    </div>
  );
}

export default App;
