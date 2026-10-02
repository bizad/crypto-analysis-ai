import React, { useState } from 'react';
import { Lightbulb, ShieldAlert, Sparkles, HelpCircle, X, Layers, Mail } from 'lucide-react';
import { Language, Theme } from '../types';

interface FloatingBubbleMenuProps {
  onOpenGuide: () => void;
  onOpenDisclaimer: () => void;
  onOpenContact: () => void;
  lang: Language;
  theme: Theme;
}

export const FloatingBubbleMenu: React.FC<FloatingBubbleMenuProps> = ({
  onOpenGuide,
  onOpenDisclaimer,
  onOpenContact,
  lang,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed bottom-6 ${
        lang === 'fa' ? 'left-5 sm:left-7' : 'right-5 sm:right-7'
      } z-40 flex flex-col items-center gap-3`}
    >
      {/* Expanded Bubble Options */}
      {isOpen && (
        <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Bubble Item 1: Contact Us (Letter Icon) */}
          <div className="relative group flex items-center">
            {/* Bubble Tooltip Text */}
            <div
              className={`absolute ${
                lang === 'fa' ? 'left-full ml-3' : 'right-full mr-3'
              } pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap`}
            >
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl border flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-900 border-emerald-500/40 text-emerald-300 shadow-emerald-950/60'
                    : 'bg-white border-emerald-300 text-emerald-800 shadow-slate-300'
                }`}
              >
                <span>{lang === 'fa' ? 'ارتباط و تماس با ما' : 'Contact Us'}</span>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    lang === 'fa'
                      ? 'right-full border-r-[6px] border-r-emerald-500/40'
                      : 'left-full border-l-[6px] border-l-emerald-500/40'
                  } border-y-[5px] border-y-transparent`}
                />
              </div>
            </div>

            {/* Bubble Button */}
            <button
              onClick={() => {
                if (typeof onOpenContact === 'function') {
                  onOpenContact();
                }
                setIsOpen(false);
              }}
              title={lang === 'fa' ? 'ارتباط و تماس با ما' : 'Contact Us'}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border ${
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-300 shadow-emerald-500/30 ring-2 ring-emerald-200'
              }`}
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          {/* Bubble Item 2: Guide */}
          <div className="relative group flex items-center">
            {/* Bubble Tooltip Text */}
            <div
              className={`absolute ${
                lang === 'fa' ? 'left-full ml-3' : 'right-full mr-3'
              } pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap`}
            >
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl border flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 shadow-cyan-950/60'
                    : 'bg-white border-cyan-300 text-cyan-800 shadow-slate-300'
                }`}
              >
                <span>{lang === 'fa' ? 'راهنمای کاربری و دریافت نتایج دقیق' : 'User Guide & Tips'}</span>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    lang === 'fa'
                      ? 'right-full border-r-[6px] border-r-cyan-500/40'
                      : 'left-full border-l-[6px] border-l-cyan-500/40'
                  } border-y-[5px] border-y-transparent`}
                />
              </div>
            </div>

            {/* Bubble Button */}
            <button
              onClick={() => {
                onOpenGuide();
                setIsOpen(false);
              }}
              title={lang === 'fa' ? 'راهنمای کاربری و نتایج دقیق' : 'User Guide & Accurate Results'}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border ${
                isDark
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400/50 shadow-cyan-600/30 ring-2 ring-cyan-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-300 shadow-cyan-500/30 ring-2 ring-cyan-200'
              }`}
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </div>

          {/* Bubble Item 3: Disclaimer */}
          <div className="relative group flex items-center">
            {/* Bubble Tooltip Text */}
            <div
              className={`absolute ${
                lang === 'fa' ? 'left-full ml-3' : 'right-full mr-3'
              } pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap`}
            >
              <div
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl border flex items-center gap-2 ${
                  isDark
                    ? 'bg-slate-900 border-amber-500/40 text-amber-300 shadow-amber-950/60'
                    : 'bg-white border-amber-300 text-amber-800 shadow-slate-300'
                }`}
              >
                <span>{lang === 'fa' ? 'سلب مسئولیت قانونی و مدیریت ریسک' : 'Risk & Legal Disclaimer'}</span>
                <div
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    lang === 'fa'
                      ? 'right-full border-r-[6px] border-r-amber-500/40'
                      : 'left-full border-l-[6px] border-l-amber-500/40'
                  } border-y-[5px] border-y-transparent`}
                />
              </div>
            </div>

            {/* Bubble Button */}
            <button
              onClick={() => {
                onOpenDisclaimer();
                setIsOpen(false);
              }}
              title={lang === 'fa' ? 'سلب مسئولیت قانونی و مدیریت ریسک' : 'Disclaimer & Risk Management'}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border ${
                isDark
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50 shadow-amber-600/30 ring-2 ring-amber-500/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-300 shadow-amber-500/30 ring-2 ring-amber-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Bubble Toggle Button */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={lang === 'fa' ? 'منوی حبابی راهنما و قوانین' : 'Guide & Rules Bubble Menu'}
          className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border relative ${
            isOpen
              ? isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white border-cyan-400/40 shadow-blue-600/30 ring-4 ring-cyan-500/20 animate-pulse-slow'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <HelpCircle className="w-6 h-6" />
              {/* Subtle bubble dot badge */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping opacity-75"></span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-900"></span>
            </>
          )}
        </button>

        {/* Floating Bubble Hint for the main trigger when closed */}
        {!isOpen && (
          <div
            className={`absolute bottom-full mb-2.5 ${
              lang === 'fa' ? 'left-0' : 'right-0'
            } pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100 z-50 whitespace-nowrap`}
          >
            <div
              className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-xl border ${
                isDark
                  ? 'bg-slate-900/95 border-slate-700 text-slate-200 shadow-black/50'
                  : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
              }`}
            >
              {lang === 'fa' ? 'منوی حبابی راهنما و قوانین' : 'Guide & Disclaimer Menu'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
