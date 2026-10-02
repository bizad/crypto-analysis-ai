// =======================================================================
// پیکربندی صرافی‌های پیشنهادی و لینک‌های معرف (Exchange Referral & Ads)
// شما می‌توانید لینک‌های زیر را با لینک دعوت اختصاصی خود جایگزین کرده
// یا صرافی‌های جدیدی به این فهرست اضافه کنید.
// =======================================================================

export interface ExchangeAd {
  id: string;
  name: string;
  nameFa: string;
  taglineFa: string;
  taglineEn: string;
  descriptionFa: string;
  descriptionEn: string;
  // لینک اختصاصی معرف خود را در این قسمت وارد کنید:
  referralLink: string;
  referralCode: string;
  discountTextFa: string;
  discountTextEn: string;
  badgeFa: string;
  badgeEn: string;
  type: 'iranian' | 'international';
  featuresFa: string[];
  featuresEn: string[];
  isFeatured?: boolean;
  brandColor: string; // Tailwind color accent
  logoUrl: string;
}

export const defaultExchanges: ExchangeAd[] = [
  {
    id: 'nobitex',
    name: 'Nobitex',
    nameFa: 'صرافی معتبر نوبیتکس',
    taglineFa: 'بزرگ‌ترین صرافی دانش‌بنیان رمزارز ایران با بالاترین نقدینگی',
    taglineEn: 'Premier Cryptocurrency Exchange in Iran',
    descriptionFa: 'بالاترین حجم معاملات تومانی و تتری در ایران، تسویه آنی ریالی، امنیت دارایی سرد و پشتیبانی شبانه‌روزی.',
    descriptionEn: 'Deepest IRT/USDT liquidity, instant fiat settlements, cold asset storage, and 24/7 support.',
    referralLink: 'https://nobitex.ir/signup/?refcode=57DDD81',
    referralCode: '57DDD81',
    discountTextFa: '۱۵٪ تخفیف دائمی کارمزد معاملات',
    discountTextEn: '15% Lifetime Fee Rebate',
    badgeFa: 'بازار تومانی و تتری پرسرعت',
    badgeEn: 'Highest IRT Liquidity',
    type: 'iranian',
    featuresFa: ['واریز و برداشت شتابی آنی', 'احراز هویت هوشمند سریع', 'کیف پول امن سرد'],
    featuresEn: ['Instant Bank Settlement', 'Fast Automated KYC', 'Secure Cold Storage'],
    isFeatured: true,
    brandColor: 'from-amber-500 to-orange-500',
    logoUrl: 'https://nobitex.ir/_next/static/media/nobitex-logo.f1910266.svg?dpl=f03af806f',
  },
  {
    id: 'tabdeal',
    name: 'Tabdeal',
    nameFa: 'صرافی معتبر تبدیل',
    taglineFa: 'پلتفرم پیشرفته با معاملات اهرم‌دار، تعهدی و بیش از ۷۰۰ بازار متنوع',
    taglineEn: 'Advanced Crypto Exchange with Margin & 700+ Markets',
    descriptionFa: 'تنوع بی‌نظیر رمزارزها، ابزارهای حرفه‌ای حد ضرر (Stop-Loss) و OCO، بدون محدودیت واریز و برداشت و با کارمزد رقابتی.',
    descriptionEn: '700+ crypto markets, advanced trading tools (Stop-Loss & OCO), leverage trading, and fast settlements.',
    referralLink: 'https://tabdeal.org/auth/register-req?refcode=8v6f3l',
    referralCode: '8v6f3l',
    discountTextFa: 'تخفیف ویژه کارمزد ترید',
    discountTextEn: 'Special Trading Fee Discount',
    badgeFa: 'معاملات تعهدی با اهرم',
    badgeEn: 'Margin & Futures Trading',
    type: 'iranian',
    featuresFa: ['بیش از ۷۰۰ بازار معاملاتی', 'ابزارهای معاملاتی OCO و حد ضرر', 'پشتیبانی تخصصی ۲۴ ساعته'],
    featuresEn: ['700+ Crypto Pairs', 'OCO & Stop Loss Orders', '24/7 Dedicated Support'],
    isFeatured: true,
    brandColor: 'from-blue-600 to-indigo-600',
    logoUrl: 'https://tabdeal.org/tabdeal-logo-light.svg',
  },
];
