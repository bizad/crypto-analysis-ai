export type Timeframe = '15m' | '1h' | '4h' | '1d';

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export type Language = 'fa' | 'en';
export type Theme = 'dark' | 'light';
export type ThemeMode = 'system' | 'dark' | 'light';

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  nameFa?: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  marketCapRank?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number;
  ath?: number;
  athChangePercentage?: number;
  thumb?: string;
  growthPotentialScore: number; // 0 - 100
  signal: SignalType;
  category: string;
  breakoutSetup: string;
  breakoutSetupEn?: string;
  rsi14: number;
  macdCross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trend: 'صعودی' | 'نزولی' | 'رنج';
}

export interface Candle {
  time: number;
  formattedTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
}

export interface CandlestickPrediction24h {
  minPrice: number;
  maxPrice: number;
  mostLikelyPrice: number;
  volatilityPct: number;
  probabilityPct: number;
  primaryPatternNameFa: string;
  primaryPatternNameEn: string;
  patternBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  patternReliability: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  candleInsightFa: string;
  candleInsightEn: string;
  buyerSellerPressure: {
    buyerPct: number;
    sellerPct: number;
  };
}

export interface FearAndGreedData {
  value: number; // 0 - 100
  classification: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  labelFa: string;
  labelEn: string;
  previousClose?: number;
  previousWeek?: number;
  timestamp: number;
  isAssetSpecific?: boolean;
  assetSymbol?: string;
  assetName?: string;
  globalBtcValue?: number;
  globalBtcClassification?: string;
  historical?: Array<{
    value: number;
    date: string;
  }>;
}

export interface TechnicalAnalysisResult {
  symbol: string;
  timestamp: number;
  trendFa: string;
  trendEn: string;
  trendStatus: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  growthPotentialScore: number;
  confidenceScore: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL';
  patternsDetected: string[];
  patternsDetectedEn?: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  entryZone: { min: number; max: number };
  takeProfitTargets: {
    tp1: number;
    tp2: number;
    tp3: number;
  };
  stopLoss: number;
  riskRewardRatio: string;
  actionAdvice: string;
  actionAdviceEn?: string;
  aiDetailedPersianReview: string;
  aiDetailedEnglishReview?: string;
  predictedRange24h?: CandlestickPrediction24h;
  indicators: {
    rsi: { value: number; interpretation: string };
    macd: { signal: string; interpretation: string };
    movingAverages: { summary: string };
    bollingerBands: { status: string };
    volumeAnalysis: string;
  };
}

export interface NewsItem {
  title: string;
  titleEn?: string;
  source: string;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  summary: string;
  summaryEn?: string;
  timeAgo: string;
  timeAgoEn?: string;
}

export interface FundamentalAnalysisResult {
  symbol: string;
  fundamentalScore: number; // 0 - 100
  rating: 'A+' | 'A' | 'B' | 'C' | 'D';
  sentiment: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  summaryFa: string;
  summaryEn: string;
  tokenomicsHealth: {
    score: number;
    inflationStatus: string;
    inflationStatusEn?: string;
    supplyCirculatingPct: number;
    analysis: string;
    analysisEn?: string;
  };
  utilityAndAdoption: {
    score: number;
    useCases: string[];
    useCasesEn?: string[];
    ecosystemHealth: string;
    ecosystemHealthEn?: string;
  };
  keyCatalysts: string[];
  keyCatalystsEn?: string[];
  keyRisks: string[];
  keyRisksEn?: string[];
  recentNews: NewsItem[];
}

export interface TomanData {
  usdtRate: number; // e.g. 71,800 تومان
  coinPriceToman: number;
  formattedToman: string;
  change24h: number;
  high24hToman: number;
  low24hToman: number;
  volume24hToman: number;
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
}

export interface VipPlan {
  id: 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  nameFa: string;
  nameEn: string;
  priceUsdt: number;
  durationDays: number;
  badgeFa?: string;
  badgeEn?: string;
  savingsFa?: string;
}

export interface VipSubscription {
  isActive: boolean;
  planId: string;
  planNameFa: string;
  planNameEn: string;
  priceUsdt: number;
  txid?: string;
  walletAddress: string;
  startedAt: number;
  expiresAt: number;
}

export interface UserAccount {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number; // total friends invited
  weeklyBonusQuota: number; // +1 analysis per week for each friend
  usedWeeklyQuota: number;
  rewardBalanceUsdt: number; // current available 10% referral commission in USDT
  totalEarnedUsdt: number; // all-time accumulated commission in USDT
  bep20Address?: string; // saved BEP-20 Tether wallet
  isVip: boolean;
  vipPlan?: string;
  vipExpiresAt?: number;
  isBlocked?: boolean;
  blockedReason?: string;
  createdAt: number;
}

export interface WithdrawalItem {
  id: string;
  userId: string;
  userIdentifier: string;
  amountUsdt: number;
  bep20Address: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  txHash?: string;
  createdAt: number;
  reviewedAt?: number;
  adminNote?: string;
}

export interface DepositItem {
  id: string;
  userId: string;
  userIdentifier: string; // phone or email
  amount: number;
  currency: 'USDT' | 'TOMAN';
  planId: string;
  planName: string;
  txid: string;
  receiptNote?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  reviewedAt?: number;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt: number;
}

export interface TicketItem {
  id: string;
  userId: string;
  userIdentifier: string;
  subject: string;
  department: string;
  messages: TicketMessage[];
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED' | 'CLOSED';
  createdAt: number;
  updatedAt: number;
}

export interface NotificationItem {
  id: string;
  userId: string; // user ID or 'ALL'
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'VIP';
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface ApiHealthStatus {
  service: string;
  nameFa: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastChecked: number;
  details?: string;
}

export interface SearchLogEntry {
  id: string;
  userId?: string;
  userIdentifier: string;
  query: string;
  timestamp: number;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalDepositsCount: number;
  totalDepositsToman: number;
  totalDepositsUsdt: number;
  pendingDepositsCount: number;
  totalTicketsCount: number;
  openTicketsCount: number;
  totalSearchesCount: number;
  totalVipUsers: number;
  totalReferralsCount: number;
  totalWithdrawalsCount?: number;
  pendingWithdrawalsCount?: number;
  totalWithdrawalsUsdt?: number;
  totalDatabaseRecords?: number;
  totalTechnicalAnalysesCount?: number;
  totalFundamentalAnalysesCount?: number;
}

// 2FA Email Verification Log
export interface Admin2faVerification {
  id: string;
  adminEmail: string;
  code: string;
  expiresAt: number;
  attempts: number;
  isUsed: boolean;
  createdAt: number;
  ip?: string;
}

// Stored Technical Analysis Record
export interface StoredTechnicalAnalysis {
  id: string;
  symbol: string;
  timeframe: string;
  growthPotentialScore: number;
  confidenceScore: number;
  recommendation: string;
  predictedRangeMin?: number;
  predictedRangeMax?: number;
  analysis: TechnicalAnalysisResult;
  createdAt: number;
  updatedAt: number;
}

// Stored Fundamental Analysis Record
export interface StoredFundamentalAnalysis {
  id: string;
  symbol: string;
  fundamentalScore: number;
  rating: string;
  sentiment: string;
  analysis: FundamentalAnalysisResult;
  createdAt: number;
}

// Stored Fear & Greed History Record
export interface StoredFearAndGreedSnapshot {
  id: string;
  value: number;
  classification: string;
  labelFa: string;
  labelEn: string;
  previousClose: number;
  previousWeek: number;
  source: string;
  createdAt: number;
}

// Stored Exchange Referral Partner
export interface StoredExchangePartner {
  id: string;
  name: string;
  nameFa: string;
  type: 'IRANIAN' | 'GLOBAL';
  referralUrl: string;
  referralCode: string;
  discountPercent: number;
  clicksCount: number;
  isActive: boolean;
  featuresFa: string[];
  createdAt: number;
}

// Stored System & Platform Settings
export interface StoredSystemSettings {
  id: string;
  platformName: string;
  adminEmail: string;
  admin2faRequired: boolean;
  totpEnabled?: boolean;
  totpSecret?: string;
  totpBackupCodes?: string[];
  totpActivatedAt?: number;
  manualNobitexUsdtRate?: number;
  dailyFreeAnalysisLimit: number;
  maintenanceMode: boolean;
  announcementText?: string;
  announcementActive: boolean;
  contactEmail: string;
  supportPhone?: string;
  updatedAt: number;
}

// Stored Administrative & Security Audit Trail
export interface StoredAuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: number;
  ip?: string;
}

// App Navigation Section Type for dedicated views
export type AppNavigationSection =
  | 'TECHNICAL'
  | 'FUNDAMENTAL'
  | 'HEATMAP'
  | 'SEARCH'
  | 'VIP'
  | 'GUIDE'
  | 'DISCLAIMER'
  | 'CONTACT';

export interface VipPlanConfig {
  id: string;
  nameFa: string;
  nameEn: string;
  durationDays: number;
  priceUsdt: number;
  badgeFa?: string;
  badgeEn?: string;
  popular?: boolean;
  featuresFa: string[];
  featuresEn: string[];
}

// Database Table Overview for Admin Console
export interface DatabaseTableMeta {
  tableName: string;
  nameFa: string;
  descriptionFa: string;
  count: number;
  lastUpdated: number;
}

