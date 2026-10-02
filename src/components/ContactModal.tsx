import React, { useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  User,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const creatorEmail = 'hamed.farri@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(creatorEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('crypto_auth_token');
      await fetch('/api/user/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: formData.subject.trim() || `پیام تماس از طرف ${formData.name}`,
          department: 'GENERAL',
          message: `فرستنده: ${formData.name} (${formData.email})\nموضوع: ${formData.subject || 'عمومی'}\n\nپیام:\n${formData.message}`,
        }),
      });
    } catch {}

    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all transform scale-100 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{t.contactUs}</h3>
              <p className="text-xs text-slate-400">{t.contactSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Info Card */}
        <div className="p-5 sm:p-6 space-y-5">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/30 to-slate-900 border-emerald-500/30'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 font-mono text-base shadow-sm shrink-0">
                HF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base">
                    {lang === 'fa' ? 'حامد فرّی' : 'Hamed Farri'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
                    {lang === 'fa' ? 'سازنده و طراح پلتفرم' : 'Creator & Developer'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{creatorEmail}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.emailCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyEmail}</span>
                </>
              )}
            </button>
          </div>

          {/* Form */}
          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-emerald-400">
                {lang === 'fa' ? 'پیام شما دریافت شد' : 'Message Sent Successfully'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.messageSentSuccess}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {t.nameField} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={lang === 'fa' ? 'مثال: علی احمدی' : 'e.g. John Doe'}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100'
                        : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {t.emailField} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100'
                        : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  {t.subjectField}
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder={
                    lang === 'fa'
                      ? 'پیشنهاد ویژگی جدید، سوال تحلیلی یا همکاری'
                      : 'Feature suggestion, inquiry or feedback'
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  {t.messageField} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={
                    lang === 'fa'
                      ? 'نظرات، پیشنهادات ارتقای چارت یا درخواست‌های خود را بنویسید...'
                      : 'Write your message or inquiry here...'
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all resize-none ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {lang === 'fa'
                      ? 'پاسخ مستقیم توسط حامد فرّی'
                      : 'Direct review by Hamed Farri'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.analyzing : t.sendMessage}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
