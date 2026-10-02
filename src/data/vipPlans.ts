import { VipPlan } from '../types';

// Cryptocurrency (USDT) Deposit Info
export const VIP_WALLET_ADDRESS = '0xB466F843CFEc387E974a26f59FbCA7C6bB2a6ed2';
export const VIP_NETWORK = 'BEP-20 (Binance Smart Chain)';
export const VIP_NETWORK_FA = 'بپ بیست (BEP-20 / بایننس اسمارت چین)';
export const VIP_PAYMENT_CURRENCY = 'USDT (تتر)';

// Iranian Banking Card Transfer (کارت به کارت شتاب)
export const VIP_CARD_NUMBER = '6219861908950438';
export const VIP_CARD_NUMBER_FORMATTED = '۶۲۱۹ - ۸۶۱۹ - ۰۸۹۵ - ۰۴۳۸';
export const VIP_CARD_HOLDER = 'حامد فری';
export const VIP_CARD_BANK = 'بانک سامان';

// 10-minute deadline based on live Nobitex USD rate
export const VIP_DEPOSIT_WINDOW_MINUTES = 10;
export const VIP_DEPOSIT_WINDOW_SECONDS = 600; // 10 minutes = 600 seconds

// Support & Receipt Submission Channels
export const VIP_SUPPORT_PHONE = '09214046903';
export const VIP_SUPPORT_PHONE_INTL = '+989214046903';

// Direct links to messengers
export const getWhatsAppReceiptUrl = (planName: string, amountToman: string, amountUsdt: number) =>
  `https://wa.me/989214046903?text=${encodeURIComponent(
    `سلام، فیش واریز اشتراک VIP دیده‌بان کریپتو به کارت سامان حامد فری را ارسال می‌کنم.\nپلن انتخابی: ${planName} (${amountUsdt} دلار / ${amountToman} تومان)`
  )}`;

export const getBaleReceiptUrl = () => `https://ble.ir/09214046903`;
export const getRubikaReceiptUrl = () => `https://rubika.ir`;

export const VIP_PLANS: VipPlan[] = [
  {
    id: 'weekly',
    nameFa: 'هفتگی (۷ روزه)',
    nameEn: 'Weekly (7 Days)',
    priceUsdt: 1,
    durationDays: 7,
    badgeFa: 'پایه و اقتصادی',
    badgeEn: 'Starter',
    savingsFa: 'تست و بررسی امکانات',
  },
  {
    id: 'monthly',
    nameFa: 'ماهانه (۳۰ روزه)',
    nameEn: 'Monthly (30 Days)',
    priceUsdt: 3.5,
    durationDays: 30,
    badgeFa: 'محبوب‌ترین انتخاب',
    badgeEn: 'Most Popular',
    savingsFa: 'صرفه‌جویی ۱۲٪ نسبت به هفتگی',
  },
  {
    id: 'quarterly',
    nameFa: 'سه ماهه (۹۰ روزه)',
    nameEn: 'Quarterly (3 Months)',
    priceUsdt: 9,
    durationDays: 90,
    badgeFa: 'پیشنهاد تریدرها',
    badgeEn: 'Recommended',
    savingsFa: 'صرفه‌جویی ۲۵٪ نسبت به ماهانه',
  },
  {
    id: 'semi_annual',
    nameFa: 'شش ماهه (۱۸۰ روزه)',
    nameEn: 'Semi-Annual (6 Months)',
    priceUsdt: 15,
    durationDays: 180,
    badgeFa: 'ارزش فوق‌العاده',
    badgeEn: 'Great Value',
    savingsFa: 'صرفه‌جویی ۳۰٪ نسبت به پلن ۳ ماهه',
  },
  {
    id: 'annual',
    nameFa: 'یک ساله (۳۶۵ روزه)',
    nameEn: 'Annual (1 Year)',
    priceUsdt: 25,
    durationDays: 365,
    badgeFa: 'حداکثر تخفیف و بازدهی',
    badgeEn: 'Best Savings',
    savingsFa: 'بیشترین صرفه‌جویی اقتصادی (۴۰٪+)',
  },
];

