/**
 * Utility helper for sharing analysis summary via Web Share API with clipboard fallback
 */

export interface ShareDataPayload {
  title: string;
  text: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'share-api' | 'clipboard' | 'cancelled' | 'error';
  messageFa: string;
  messageEn: string;
}

export async function shareContent(payload: ShareDataPayload): Promise<ShareResult> {
  const shareUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullTextWithUrl = `${payload.text}\n\n🔗 لینک پلتفرم:\n${shareUrl}`;

  // 1. Try Web Share API if supported
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'share-api',
        messageFa: 'تحلیل با موفقیت به اشتراک گذاشته شد!',
        messageEn: 'Analysis shared successfully!',
      };
    } catch (err: any) {
      // User cancelled share dialog (AbortError)
      if (err?.name === 'AbortError') {
        return {
          success: false,
          method: 'cancelled',
          messageFa: 'اشتراک‌گذاری لغو شد.',
          messageEn: 'Share cancelled.',
        };
      }
      // Otherwise fall through to clipboard copy
    }
  }

  // 2. Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(fullTextWithUrl);
      return {
        success: true,
        method: 'clipboard',
        messageFa: 'خلاصه تحلیل در کلیپ‌بورد کپی شد (آماده ارسال در تلگرام، واتساپ و پیام‌رسان‌ها)',
        messageEn: 'Analysis copied to clipboard (ready to paste in Telegram, WhatsApp, etc.)',
      };
    } catch (_clipErr) {
      // Continue to textarea fallback
    }
  }

  // 3. Document execCommand fallback for older or restricted environments
  try {
    const textArea = document.createElement('textarea');
    textArea.value = fullTextWithUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return {
        success: true,
        method: 'clipboard',
        messageFa: 'خلاصه تحلیل کپی شد!',
        messageEn: 'Analysis copied to clipboard!',
      };
    }
  } catch (_e) {
    // ignore
  }

  return {
    success: false,
    method: 'error',
    messageFa: 'خطا در اشتراک‌گذاری یا کپی متن.',
    messageEn: 'Could not share or copy analysis.',
  };
}
