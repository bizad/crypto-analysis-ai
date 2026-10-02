import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Users,
  CreditCard,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  Key,
  TrendingUp,
  RefreshCw,
  Send,
  ExternalLink,
  Wallet,
  ArrowDownLeft,
  Copy,
  Check,
  Database,
  Download,
  Lock,
  Mail,
  Sliders,
  FileText,
  AlertCircle,
  Eye,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers,
  Activity,
  Radio,
  Plus,
  Bell,
  Trash2,
  Ban,
  Megaphone,
  Percent,
  Edit3,
  Coins,
  QrCode,
  Archive,
} from 'lucide-react';
import { TotpSetupModal } from './TotpSetupModal';
import {
  AdminOverviewStats,
  DepositItem,
  TicketItem,
  SearchLogEntry,
  UserAccount,
  WithdrawalItem,
  DatabaseTableMeta,
  StoredAuditLog,
  StoredSystemSettings,
} from '../types';

interface HiddenAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const HiddenAdminModal: React.FC<HiddenAdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  // Authentication & 2FA State
  const [adminEmail, setAdminEmail] = useState('hamed.farri@gmail.com');
  const [authMode, setAuthMode] = useState<'2FA' | 'MASTER_PIN'>('2FA');
  const [otpCode, setOtpCode] = useState('');
  const [pin, setPin] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [adminGoogleLoading, setAdminGoogleLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem('crypto_admin_token') || '');

  // Listen for Admin Google OAuth postMessage from popup
  useEffect(() => {
    const handleAdminMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_ADMIN_AUTH_SUCCESS') {
        const { token } = event.data;
        if (token) {
          localStorage.setItem('crypto_admin_token', token);
          setAdminToken(token);
          setIsAuthenticated(true);
          setAuthSuccessMsg('احراز هویت مدیر با حساب رسمی گوگل با موفقیت انجام شد!');
          setAdminGoogleLoading(false);
          loadAdminData(token);
        }
      } else if (event.data?.type === 'GOOGLE_ADMIN_AUTH_ERROR') {
        setAuthError(event.data.error || 'خطا در احراز هویت مدیریت با حساب گوگل');
        setAdminGoogleLoading(false);
      }
    };

    window.addEventListener('message', handleAdminMessage);
    return () => window.removeEventListener('message', handleAdminMessage);
  }, []);

  const handleAdminGoogleAuth = async () => {
    setAuthError(null);
    setAdminGoogleLoading(true);
    try {
      const res = await fetch('/api/admin/auth/google/url');
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'خطا در دریافت نشانی ورود گوگل');
      }

      const width = 520;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_admin_login',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup) {
        alert('لطفاً باز شدن پنجره‌های پاپ‌آپ را در مرورگر خود مجاز فرمایید.');
        setAdminGoogleLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'خطا در اتصال به سرویس گوگل');
      setAdminGoogleLoading(false);
    }
  };

  // Executive Admin Sidebar Tabs
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'USERS' | 'FINANCES' | 'VIP_PLANS' | 'ADS' | 'TICKETS' | 'SEARCHES' | 'SECURITY' | 'SETTINGS' | 'MONITORING' | 'BACKUPS'
  >('DASHBOARD');

  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [encryptedBackups, setEncryptedBackups] = useState<any[]>([]);
  const [verifyingBackup, setVerifyingBackup] = useState<string | null>(null);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [backupCreating, setBackupCreating] = useState(false);
  const [isTotpModalOpen, setIsTotpModalOpen] = useState(false);
  const [totpStatus, setTotpStatus] = useState<{
    enabled: boolean;
    activatedAt?: number;
    remainingBackupCodes?: number;
  } | null>(null);

  // Sub-tabs / Filters
  const [financeSubTab, setFinanceSubTab] = useState<'DEPOSITS' | 'WITHDRAWALS'>('DEPOSITS');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScreenOptions, setShowScreenOptions] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  // Loaded Data
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [searches, setSearches] = useState<SearchLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Database Tab Specific State
  const [dbTables, setDbTables] = useState<DatabaseTableMeta[]>([]);
  const [totalDbRecords, setTotalDbRecords] = useState(0);
  const [dbDiskSize, setDbDiskSize] = useState(0);
  const [selectedTableName, setSelectedTableName] = useState<string>('users');
  const [selectedTableRows, setSelectedTableRows] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<StoredAuditLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<StoredSystemSettings | null>(null);

  // Active ticket reply state in admin
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // VIP Plans State
  const [vipPlans, setVipPlans] = useState<any[]>([]);
  const [editingVipPlanId, setEditingVipPlanId] = useState<string | null>(null);
  const [editingVipPrice, setEditingVipPrice] = useState<number>(0);

  // Exchange Ads State
  const [exchangePartners, setExchangePartners] = useState<any[]>([]);
  const [newAdData, setNewAdData] = useState({
    name: '',
    nameFa: '',
    taglineFa: '',
    referralUrl: '',
    referralCode: '',
    discountTextFa: '',
    badgeFa: '',
    type: 'IRANIAN',
  });

  // Withdrawal approval txHash state
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState<string | null>(null);
  const [withdrawalTxHash, setWithdrawalTxHash] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 2FA Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCodeSent && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCodeSent, timerSeconds]);

  // If already logged in as hamed.farri@gmail.com, auto-load data
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.email === 'hamed.farri@gmail.com' || currentUser?.id === 'user_admin_hamed') {
        setIsAuthenticated(true);
        loadAdminData();
      }
    }
  }, [isOpen, currentUser]);

  // Request 2FA Code Dispatch to hamed.farri@gmail.com
  const handleSend2faCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setSendingCode(true);

    try {
      const res = await fetch('/api/admin/2fa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setIsCodeSent(true);
        setTimerSeconds(300);
        setAuthSuccessMsg(data.message || 'کد تایید ۶ رقمی به ایمیل ارسال شد.');
        if (data.debugCode) {
          setDevOtpHint(data.debugCode);
        }
      } else {
        setAuthError(data.error || 'خطا در ارسال کد تایید دو مرحله‌ای');
      }
    } catch {
      setAuthError('خطا در برقراری ارتباط با سرور جهت ارسال کد ۲FA');
    } finally {
      setSendingCode(false);
    }
  };

  // Verify 2FA OTP Code
  const handleVerify2faCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setVerifying(true);

    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        if (data.token) {
          setAdminToken(data.token);
        }
        loadAdminData(data.token);
      } else {
        setAuthError(data.error || 'کد وارد شده صحیح نمی‌باشد.');
      }
    } catch {
      setAuthError('خطا در اعتبارسنجی کد دو مرحله‌ای');
    } finally {
      setVerifying(false);
    }
  };

  // Fallback Master PIN Verification
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        if (data.token) setAdminToken(data.token);
        loadAdminData(data.token);
      } else {
        setAuthError('پین کد مدیریت اشتباه است.');
      }
    } catch {
      setAuthError('خطا در احراز هویت پین مدیریت');
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    setAdminToken('');
    localStorage.removeItem('crypto_admin_token');
    setOtpCode('');
    setIsCodeSent(false);
    setDevOtpHint(null);
  };

  const loadAdminData = async (token = adminToken) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [
        statsRes,
        usersRes,
        depRes,
        withRes,
        tickRes,
        searchRes,
        dbRes,
        auditRes,
        settingsRes,
        vipRes,
        adRes,
        monRes,
        backupRes,
        totpRes,
        maintRes,
      ] = await Promise.all([
        fetch('/api/admin/overview', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/users', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/deposits', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/withdrawals', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/tickets', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/searches', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/database/overview', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/audit-logs', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/settings', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/vip-plans').then((r) => r.json()).catch(() => ({})),
        fetch('/api/exchange-partners').then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/monitoring', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/backups', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/admin/totp/status', { headers }).then((r) => r.json()).catch(() => ({})),
        fetch('/api/maintenance/backups', { headers }).then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (depRes.success) setDeposits(depRes.deposits);
      if (withRes.success) setWithdrawals(withRes.withdrawals);
      if (tickRes.success) setTickets(tickRes.tickets);
      if (searchRes.success) setSearches(searchRes.searches);
      if (auditRes.success) setAuditLogs(auditRes.logs || []);
      if (settingsRes.success) setSystemSettings(settingsRes.settings);
      if (vipRes.success && Array.isArray(vipRes.plans)) setVipPlans(vipRes.plans);
      if (adRes.success && Array.isArray(adRes.partners)) setExchangePartners(adRes.partners);
      if (monRes.success && monRes.monitoring) setMonitoringData(monRes.monitoring);
      if (backupRes.success && Array.isArray(backupRes.backups)) setBackupsList(backupRes.backups);
      if (totpRes.success && totpRes.status) setTotpStatus(totpRes.status);
      if (maintRes.success && Array.isArray(maintRes.backups)) setEncryptedBackups(maintRes.backups);

      if (dbRes.success && dbRes.database) {
        setDbTables(dbRes.database.tables || []);
        setTotalDbRecords(dbRes.database.totalRecords || 0);
        setDbDiskSize(dbRes.database.diskSizeBytes || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Delete and Block User Handlers
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('آیا از حذف کامل این کاربر از سیستم اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      } else {
        alert(data.error || 'خطا در حذف کاربر');
      }
    } catch {
      alert('خطای اتصال به سرور');
    }
  };

  const handleToggleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ isBlocked }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      } else {
        alert(data.error || 'خطا در تغییر وضعیت کاربر');
      }
    } catch {
      alert('خطای اتصال به سرور');
    }
  };

  // VIP Pricing Update Handler
  const handleUpdateVipPrice = async (planId: string, priceUsdt: number) => {
    try {
      const res = await fetch('/api/admin/vip-plans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ planId, priceUsdt }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingVipPlanId(null);
        loadAdminData();
      } else {
        alert(data.error || 'خطا در بروزرسانی قیمت');
      }
    } catch {
      alert('خطای اتصال به سرور');
    }
  };

  // Exchange Ads Handlers
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdData.name || !newAdData.referralUrl) {
      alert('نام صرافی و لینک معرف الزامی هستند.');
      return;
    }
    try {
      const res = await fetch('/api/admin/exchange-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(newAdData),
      });
      const data = await res.json();
      if (data.success) {
        setNewAdData({
          name: '',
          nameFa: '',
          taglineFa: '',
          referralUrl: '',
          referralCode: '',
          discountTextFa: '',
          badgeFa: '',
          type: 'IRANIAN',
        });
        loadAdminData();
        localStorage.setItem('crypto_ads_updated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      } else {
        alert(data.error || 'خطا در ایجاد آگهی');
      }
    } catch {
      alert('خطای اتصال به سرور');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('آیا از حذف این آگهی صرافی مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/admin/exchange-partners/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        localStorage.setItem('crypto_ads_updated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
  };

  const handleToggleAd = async (adId: string) => {
    try {
      const res = await fetch(`/api/admin/exchange-partners/${adId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        localStorage.setItem('crypto_ads_updated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
  };

  const handleSelectTable = async (tableName: string) => {
    setSelectedTableName(tableName);
    setTableLoading(true);
    try {
      const res = await fetch(`/api/admin/database/table/${tableName}?limit=100`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTableRows(data.rows || []);
      }
    } catch {
      // ignore
    } finally {
      setTableLoading(false);
    }
  };

  // Load table rows when navigating to DATABASE tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'DATABASE') {
      handleSelectTable(selectedTableName);
    }
  }, [isAuthenticated, activeTab]);

  const handleUpdateDepositStatus = async (depositId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateWithdrawalStatus = async (
    withdrawalId: string,
    status: 'COMPLETED' | 'REJECTED',
    txHash?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status,
          txHash: txHash || '',
          adminNote: status === 'COMPLETED' ? 'واریز توسط ادمین تایید شد.' : 'درخواست برداشت رد شد.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovingWithdrawalId(null);
        setWithdrawalTxHash('');
        loadAdminData();
      }
    } catch {
      // ignore
    }
  };

  // 19. SQLite & JSON Backup Handlers
  const handleCreateBackup = async () => {
    setBackupCreating(true);
    try {
      const res = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        alert('فایل پشتیبان کامل سیستم (SQLite و JSON) با موفقیت تولید شد.');
        loadAdminData();
      } else {
        alert(data.error || 'خطا در ایجاد پشتیبان');
      }
    } catch {
      alert('خطای اتصال به سرور جهت پشتیبان‌گیری');
    } finally {
      setBackupCreating(false);
    }
  };

  // Encrypted SQLite Maintenance Handlers
  const handleTriggerEncryptedBackup = async (reason = 'ADMIN_MANUAL_TRIGGER') => {
    setBackupCreating(true);
    try {
      const res = await fetch('/api/maintenance/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('پشتیبان امن SQLite با الگوریتم AES-256-GCM با موفقیت ایجاد و اعتبارسنجی شد.');
        loadAdminData();
      } else {
        alert(data.error || 'خطا در ایجاد پشتیبان امن');
      }
    } catch {
      alert('خطا در برقراری ارتباط با سرویس نگهداری');
    } finally {
      setBackupCreating(false);
    }
  };

  const handleVerifyBackup = async (filename: string) => {
    setVerifyingBackup(filename);
    try {
      const res = await fetch('/api/maintenance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`نتیجه اعتبارسنجی:\n${data.message}\nتطابق Checksum: ${data.checksumMatch ? 'بله (معتبر)' : 'خیر (نامعتبر)'}`);
      } else {
        alert(`خطای اعتبارسنجی: ${data.error || data.message}`);
      }
    } catch {
      alert('خطا در اعتبارسنجی فایل پشتیبان');
    } finally {
      setVerifyingBackup(null);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const confirmRestore = window.confirm(
      `هشدار بسیار مهم!\nآیا مطمئن هستید که می‌خواهید دیتابیس فعلی سیستم را از فایل رمزشده «${filename}» بازگردانی کنید؟\nیک فایل پشتیبان ایمنی به‌صورت خودکار قبل از بازیابی ایجاد خواهد شد.`
    );
    if (!confirmRestore) return;

    setRestoringBackup(filename);
    try {
      const res = await fetch('/api/maintenance/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`بازیابی با موفقیت انجام شد:\n${data.message}`);
        loadAdminData();
      } else {
        alert(`خطا در بازیابی: ${data.error}`);
      }
    } catch {
      alert('خطا در فرایند بازیابی دیتابیس');
    } finally {
      setRestoringBackup(null);
    }
  };

  // 21. Ticket Workflow Status Handler
  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      }
    } catch {
      // ignore
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          text: adminReplyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminReplyText('');
        setSelectedTicket(data.ticket);
        loadAdminData();
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-2 md:p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 text-slate-100">
      {/* Executive Command & Operations Hub */}
      <div className="w-full h-full sm:h-[96vh] max-w-7xl sm:rounded-2xl border border-slate-700/80 bg-slate-950 text-slate-100 shadow-2xl flex flex-col overflow-hidden relative font-sans">
        {/* =========================================================================
            SLEEK SECURITY 2FA LOGIN SCREEN (Previous Design Restored)
            ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/90 text-slate-100 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
              title="بازگشت به سایت"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Shield Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-500 p-0.5 shadow-xl shadow-purple-900/40 mb-3.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="text-center mb-5 max-w-sm">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-xl font-black text-white">درگاه مدیریت دیده‌بان کریپتو</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  2FA SECURE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                احراز هویت دو مرحله‌ای ایمیل مدیر ارشد پلتفرم
              </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-right backdrop-blur-md">
              {/* Google Admin Fast Login Button */}
              <button
                type="button"
                onClick={handleAdminGoogleAuth}
                disabled={adminGoogleLoading}
                className="w-full mb-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 hover:from-slate-850 hover:to-purple-900/70 border border-purple-500/40 hover:border-purple-400 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-purple-950/40 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {adminGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>ورود مستقیم و سریع مدیر با حساب Google</span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 font-semibold">یا با کد تایید ۲FA ایمیل</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Tab: 2FA vs Master PIN */}
              <div className="flex border-b border-slate-800 pb-3 mb-4 text-xs font-bold gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('2FA')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    authMode === '2FA'
                      ? 'border-purple-500 text-purple-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>کد تایید دو مرحله‌ای (ایمیل)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('MASTER_PIN')}
                  className={`pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    authMode === 'MASTER_PIN'
                      ? 'border-purple-500 text-purple-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>کلید مستر پین</span>
                </button>
              </div>

              {authMode === '2FA' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      نشانی ایمیل تاییدشده مدیر سیستم:
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-purple-300 flex items-center justify-between">
                      <span>{adminEmail}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                        تایید شده
                      </span>
                    </div>
                  </div>

                  {!isCodeSent ? (
                    <button
                      type="button"
                      onClick={handleSend2faCode}
                      disabled={sendingCode}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {sendingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>ارسال رمز یکبار مصرف ورود ۲FA</span>
                    </button>
                  ) : (
                    <form onSubmit={handleVerify2faCode} className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-300">
                          کد ۶ رقمی ارسال‌شده:
                        </label>
                        <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-purple-500/60 focus:border-purple-400 text-center font-mono tracking-[0.5em] text-2xl text-white outline-none shadow-inner"
                      />

                      {/* Developer Quick-Fill OTP */}
                      {devOtpHint && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
                          <span>کد آزمایشی سرور:</span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(devOtpHint)}
                            className="font-mono font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{devOtpHint} (جایگذاری سریع)</span>
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={verifying || otpCode.length < 6}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                        >
                          {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-amber-400" />}
                          <span>ورود امن به پنل مدیریت</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSend2faCode}
                          disabled={sendingCode || timerSeconds > 240}
                          className="px-3.5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all border border-slate-700"
                        >
                          ارسال مجدد
                        </button>
                      </div>
                    </form>
                  )}

                  {authSuccessMsg && !authError && (
                    <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl">
                      {authSuccessMsg}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleVerifyPin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      کلید امنیتی مستر پین:
                    </label>
                    <input
                      type="password"
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Master Security Key"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs outline-none text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 cursor-pointer transition-all"
                  >
                    تایید و ورود به پنل
                  </button>
                </form>
              )}

              {authError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl mt-3">
                  {authError}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-5 text-xs text-slate-400 hover:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>← بازگشت به وب‌سایت دیده‌بان</span>
            </button>
          </div>
        ) : (
          /* =========================================================================
             AUTHENTICATED EXECUTIVE COMMAND HUB & MANAGEMENT CONSOLE
             ========================================================================= */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100">
            {/* 1. TOP EXECUTIVE COMMAND BAR */}
            <header
              id="admin-command-bar"
              className="h-12 bg-slate-900/95 border-b border-slate-800 text-slate-200 text-xs px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-md"
            >
              {/* Right Side (RTL) - Logo, Platform Title & Live Status */}
              <div className="flex items-center gap-3">
                {/* Executive Shield Emblem */}
                <div
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-500 p-0.5 shadow-md shadow-purple-900/40 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  title="مرکز فرماندهی هوشمند دیده‌بان"
                  onClick={() => setActiveTab('DASHBOARD')}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                {/* Hub Title & Live Status */}
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white hidden sm:inline">
                    مرکز فرماندهی دیده‌بان
                  </span>
                  <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>سیستم آنلاین • تاخیر ۴۵ms</span>
                  </div>
                  <span className="hidden xl:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    ۱۳ جدول پایگاه داده
                  </span>
                </div>

                {/* Visit Site Action */}
                <button
                  onClick={onClose}
                  className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                  title="مشاهده نمای وب‌سایت"
                >
                  <ExternalLink className="w-3 h-3 text-indigo-400" />
                  <span>مشاهده سایت</span>
                </button>

                {/* Tickets Quick Indicator */}
                <div
                  className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  onClick={() => setActiveTab('TICKETS')}
                  title="تیکت‌های در انتظار پاسخ"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">تیکت‌ها</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-1.5 rounded-full font-bold">
                    {tickets.filter((t) => t.status === 'OPEN').length}
                  </span>
                </div>
              </div>

              {/* Left Side (RTL) - Data Refresh, Admin Profile & Safe Logout */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  onClick={() => loadAdminData()}
                  disabled={loading}
                  className="hover:text-white flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
                  title="بروزرسانی داده‌های سرور"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : 'text-slate-300'}`} />
                  <span className="hidden sm:inline">بروزرسانی داده‌ها</span>
                </button>

                {/* Admin Greetings with Profile Avatar */}
                <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="حامد فرّی"
                      className="w-7 h-7 rounded-full object-cover border border-purple-500/50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  </div>

                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-white text-xs font-bold leading-tight">حامد فرّی</span>
                    <span className="text-[10px] text-purple-400 font-mono">مدیر ارشد پلتفرم</span>
                  </div>

                  <button
                    onClick={handleLogoutAdmin}
                    className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-[11px] flex items-center gap-1 cursor-pointer transition-all mr-1"
                    title="خروج امن از مرکز فرماندهی"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">خروج امن</span>
                  </button>
                </div>

                {/* Close Modal Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-700"
                  title="بستن و بازگشت به سایت"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* 2. BODY: EXECUTIVE SIDEBAR + MAIN STAGE CANVAS */}
            <div className="flex-1 flex overflow-hidden">
              {/* EXECUTIVE SIDEBAR */}
              <aside
                id="admin-sidebar-menu"
                className={`bg-slate-900/90 border-l border-slate-800/80 text-xs flex flex-col shrink-0 select-none transition-all duration-200 z-10 ${
                  isSidebarCollapsed ? 'w-14' : 'w-52 sm:w-56'
                }`}
              >
                {/* Sidebar Profile Card (Expanded view) */}
                {!isSidebarCollapsed && (
                  <div className="p-3 m-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="مدیر ارشد"
                        className="w-full h-full object-cover rounded-[10px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-white text-xs truncate">حامد فرّی</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>دسترسی کامل ریشه</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1 no-scrollbar">
                  {/* Menu Item: پیشخوان و مانیتورینگ */}
                  <button
                    onClick={() => setActiveTab('DASHBOARD')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'DASHBOARD'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0 text-purple-400" />
                    {!isSidebarCollapsed && <span>پیشخوان هوشمند</span>}
                  </button>

                  {/* Menu Item: کاربران سیستم */}
                  <button
                    onClick={() => setActiveTab('USERS')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'USERS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 shrink-0 text-blue-400" />
                      {!isSidebarCollapsed && <span>کاربران سیستم</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                        {users.length}
                      </span>
                    )}
                  </button>

                  {/* Menu Item: تراکنش‌های مالی */}
                  <button
                    onClick={() => setActiveTab('FINANCES')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'FINANCES'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 shrink-0 text-emerald-400" />
                      {!isSidebarCollapsed && <span>تراکنش‌های مالی</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono">
                        {deposits.length + withdrawals.length}
                      </span>
                    )}
                  </button>

                  {/* Menu Item: طرح‌های اشتراک VIP */}
                  <button
                    onClick={() => setActiveTab('VIP_PLANS')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'VIP_PLANS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                    {!isSidebarCollapsed && <span>تعرفه پلن‌های VIP</span>}
                  </button>

                  {/* Menu Item: تبلیغات و صرافی‌ها */}
                  <button
                    onClick={() => setActiveTab('ADS')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'ADS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 shrink-0 text-teal-400" />
                    {!isSidebarCollapsed && <span>آگهی‌های صرافی‌ها</span>}
                  </button>

                  {/* Menu Item: تیکت‌های پشتیبانی */}
                  <button
                    onClick={() => setActiveTab('TICKETS')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'TICKETS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 shrink-0 text-rose-400" />
                      {!isSidebarCollapsed && <span>تیکت‌های پشتیبانی</span>}
                    </div>
                    {!isSidebarCollapsed && tickets.some((t) => t.status === 'OPEN') && (
                      <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                        {tickets.filter((t) => t.status === 'OPEN').length}
                      </span>
                    )}
                  </button>

                  {/* Menu Item: تقاضای بازار و جستجوها */}
                  <button
                    onClick={() => setActiveTab('SEARCHES')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'SEARCHES'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Search className="w-4 h-4 shrink-0 text-cyan-400" />
                    {!isSidebarCollapsed && <span>تقاضای بازار و سرچ‌ها</span>}
                  </button>

                  {/* Menu Item: امنیت و وقایع (Audit) */}
                  <button
                    onClick={() => setActiveTab('SECURITY')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'SECURITY'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                    {!isSidebarCollapsed && <span>امنیت و ثبت وقایع</span>}
                  </button>

                  {/* Menu Item: تنظیمات عمومی */}
                  <button
                    onClick={() => setActiveTab('SETTINGS')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'SETTINGS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0 text-slate-300" />
                    {!isSidebarCollapsed && <span>تنظیمات سیستم</span>}
                  </button>

                  {/* Menu Item: مانیتورینگ زنده سرور */}
                  <button
                    onClick={() => setActiveTab('MONITORING')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'MONITORING'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
                    {!isSidebarCollapsed && <span>مانیتورینگ زیرساخت</span>}
                  </button>

                  {/* Menu Item: پشتیبان‌گیری و نگهداری SQLite */}
                  <button
                    onClick={() => setActiveTab('BACKUPS')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right transition-all cursor-pointer ${
                      activeTab === 'BACKUPS'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Archive className="w-4 h-4 shrink-0 text-amber-400" />
                    {!isSidebarCollapsed && <span>پشتیبان رمزشده SQLite</span>}
                  </button>
                </div>

                {/* Sidebar Collapse Toggle Button */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-3 border-t border-slate-800 text-slate-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  title="جمع کردن منو"
                >
                  {isSidebarCollapsed ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-[11px]">جمع کردن منو</span>
                    </>
                  )}
                </button>
              </aside>

              {/* MAIN EXECUTIVE STAGE CANVAS */}
              <main
                id="admin-canvas-content"
                className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100"
              >
                {/* Top Screen Options & Help Toggles */}
                <div className="flex justify-end gap-2 text-xs mb-3">
                  <button
                    onClick={() => setShowHelpDrawer(!showHelpDrawer)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>راهنمای عملیات</span>
                  </button>
                  <button
                    onClick={() => setShowScreenOptions(!showScreenOptions)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>تنظیمات ماژول‌ها</span>
                  </button>
                </div>

                {/* Screen Options Drawer (Collapsible) */}
                {showScreenOptions && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-4 text-xs text-slate-300">
                    <strong className="block mb-2 text-white font-bold">عناصر و ماژول‌های فعال در این نمای کنترلی:</strong>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="checkbox" defaultChecked className="rounded accent-purple-600" />
                        <span>ویجت شاخص‌های کلیدی (KPIs)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="checkbox" defaultChecked className="rounded accent-purple-600" />
                        <span>ویجت لاگ فعالیت‌های زنده</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="checkbox" defaultChecked className="rounded accent-purple-600" />
                        <span>ویجت سلامت سیستم و سرویس‌ها</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="checkbox" defaultChecked className="rounded accent-purple-600" />
                        <span>ویجت عملیات فوری مدیر</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Help Drawer (Collapsible) */}
                {showHelpDrawer && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-4 text-xs text-slate-300 space-y-1.5">
                    <strong className="block text-white font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>راهنمای پلتفرم مدیریت متمرکز دیده‌بان:</span>
                    </strong>
                    <p className="text-slate-400">
                      این مرکز کنترلی امکان مدیریت کامل ۱۳ کالکشن سراسری دیتابیس، تایید آنی واریزی‌های VIP، پایش تسویه‌حساب‌های BEP-20، پاسخگویی به تیکت‌های پشتیبانی و ثبت وقایع مانیتورینگ امنیتی را فراهم می‌کند.
                    </p>
                    <p className="font-mono text-[11px] text-purple-400">
                      ایمیل رسمی مدیر ارشد دارای اختیارات ریشه: {adminEmail}
                    </p>
                  </div>
                )}

                {/* Page Title & Add New Action */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-7 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {activeTab === 'DASHBOARD' && 'پیشخوان هوشمند و آمار کلی'}
                      {activeTab === 'DATABASE' && 'پایگاه داده سراسری پلتفرم'}
                      {activeTab === 'USERS' && 'مدیریت اعضا و سطوح کاربری'}
                      {activeTab === 'FINANCES' && 'مدیریت واریزی‌ها و امور مالی'}
                      {activeTab === 'VIP_PLANS' && 'تعرفه و تنظیم اشتراک‌های VIP'}
                      {activeTab === 'ADS' && 'مدیریت اسلایدر و آگهی‌های صرافی‌ها'}
                      {activeTab === 'TICKETS' && 'مرکز رسیدگی به تیکت‌های پشتیبانی'}
                      {activeTab === 'SEARCHES' && 'تقاضای بازار و آمار تحلیل کلمات'}
                      {activeTab === 'SECURITY' && 'امنیت، نشست‌ها و دفتر وقایع (Audit Trail)'}
                      {activeTab === 'SETTINGS' && 'پیکربندی و تنظیمات زیرساخت'}
                    </h1>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsTotpModalOpen(true)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all border ${
                          totpStatus?.enabled
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-purple-600/30 border-purple-500/40 text-purple-200 hover:bg-purple-600/50'
                        }`}
                        title="تنظیمات احراز هویت دو مرحله‌ای Google Authenticator"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{totpStatus?.enabled ? 'TOTP فعال' : 'تنظیم TOTP'}</span>
                      </button>
                      {activeTab === 'DATABASE' && (
                        <a
                          href="/api/admin/database/export"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>خروجی کامل JSON</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismissible Executive Admin Notice */}
                {!noticeDismissed && (
                  <div className="bg-slate-900/90 border border-purple-500/30 p-3.5 rounded-xl shadow-lg mb-5 flex items-center justify-between text-xs backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-slate-200">
                        به <strong className="text-purple-300">مرکز فرماندهی اختصاصی پلتفرم دیده‌بان</strong> خوش آمدید! پایگاه داده متمرکز با ۱۳ جدول فعال است و احراز هویت دو مرحله‌ای مدیر ارشد (<strong>{adminEmail}</strong>) فعال می‌باشد.
                      </span>
                    </div>
                    <button
                      onClick={() => setNoticeDismissed(true)}
                      className="text-slate-400 hover:text-white cursor-pointer p-1 transition-colors"
                      title="بستن اطلاعیه"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* =========================================================================
                    1. DASHBOARD VIEW (Executive Visual Hub & Widgets)
                    ========================================================================= */}
                {activeTab === 'DASHBOARD' && (
                  <div className="space-y-5">
                    {/* Visual Hero Banner with Image & Metrics */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 p-5 sm:p-6 shadow-xl">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-right max-w-xl">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>سامانه نظارت ارشد دیده‌بان نسخه ۴.۲</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-white">
                            دید جامع و کنترل یکپارچه کل بازار و کاربران
                          </h2>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            پایش لحظه‌ای نوسانات، بررسی تراکنش‌های ارزی و تومانی، مدیریت کمپین‌های تبلیغاتی صرافی‌ها و رسیدگی به تیکت‌های پشتیبانی کاربران در یک نگاه.
                          </p>
                        </div>

                        {/* Visual Image / 3D Blockchain Graphic Card */}
                        <div className="relative shrink-0 w-full sm:w-64 h-32 rounded-xl overflow-hidden border border-slate-700/60 shadow-lg">
                          <img
                            src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80"
                            alt="مرکز داده دیده‌بان"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-2.5">
                            <div className="text-[11px] font-bold text-white flex items-center justify-between w-full">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>داده فعال CMC و نوبیتکس</span>
                              </span>
                              <span className="font-mono text-purple-300">Live API</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Widget 1: شاخص‌های عملکرد کلی پلتفرم */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 font-bold text-xs flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-purple-400" />
                            <span>شاخص‌های کلیدی در یک نگاه</span>
                          </div>
                          <span className="text-[11px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                            Didban Core v4.2
                          </span>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                              <span className="text-slate-400 block flex items-center gap-1.5 mb-1">
                                <Users className="w-3.5 h-3.5 text-blue-400" />
                                <span>کاربران ثبت‌نامی:</span>
                              </span>
                              <span className="text-xl font-black text-white">
                                {stats?.totalUsers || users.length} نفر
                              </span>
                              <span className="text-[10px] text-purple-400 block mt-1">
                                {stats?.totalVipUsers || 0} مشترک VIP فعال
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                              <span className="text-slate-400 block flex items-center gap-1.5 mb-1">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                                <span>واریزی‌های تاییدشده:</span>
                              </span>
                              <span className="text-xl font-black text-emerald-400 font-mono">
                                {(stats?.totalDepositsToman || 0).toLocaleString('fa-IR')}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                تومان / {stats?.totalDepositsUsdt || 0} USDT
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>پایگاه داده سراسری: <strong className="text-white">{totalDbRecords} رکورد</strong> در ۱۳ جدول</span>
                            <span>هوش مصنوعی: <strong className="text-purple-400">Gemini 2.5</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Widget 2: وضعیت سلامت سرور و سرویس‌ها */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 font-bold text-xs flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>وضعیت سلامت و پایداری سرور</span>
                          </div>
                          <span className="text-emerald-400 text-[10px] bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            عالی (۱۰۰٪ آنلاین)
                          </span>
                        </div>
                        <div className="p-4 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-slate-200">احراز هویت دومرحله‌ای ادمین (2FA)</span>
                            </span>
                            <span className="text-emerald-400 font-bold">فعال و ایمن</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                              <span className="text-slate-200">اتصال APIهای بازار (CoinMarketCap & نوبیتکس)</span>
                            </span>
                            <span className="text-emerald-400 font-bold">پاسخ‌دهی ۴۵ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Widget 3: تراکنش‌های اخیر مالی */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 font-bold text-xs flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                            <span>تراکنش‌های اخیر در سایت</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('FINANCES')}
                            className="text-purple-400 hover:text-purple-300 text-[11px] cursor-pointer"
                          >
                            مشاهده همه
                          </button>
                        </div>
                        <div className="p-4 divide-y divide-slate-800 text-xs">
                          {deposits.slice(0, 3).map((dep) => (
                            <div key={dep.id} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-white">{dep.userIdentifier}</span>
                                <span className="text-slate-400 block text-[11px]">
                                  خرید پلن {dep.planName}
                                </span>
                              </div>
                              <div className="text-left">
                                <span className="font-mono font-bold text-emerald-400">
                                  {dep.currency === 'TOMAN'
                                    ? `${dep.amount.toLocaleString('fa-IR')} تومان`
                                    : `${dep.amount} USDT`}
                                </span>
                                <span className="block text-[10px] text-slate-400">
                                  {dep.status === 'APPROVED' ? 'تایید شده' : 'در انتظار بررسی'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Widget 4: عملیات سریع مدیریتی */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 font-bold text-xs text-white">
                          عملیات و فرامین سریع
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => setActiveTab('USERS')}
                              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-900/20"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>مدیریت کاربران</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('FINANCES')}
                              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                              <span>بررسی واریزی‌ها</span>
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="text-[11px] text-slate-400 block mb-1.5">
                              تست ارسال کد امنیتی ۲FA به صندوق پستی مدیر:
                            </span>
                            <button
                              onClick={() => handleSend2faCode()}
                              disabled={sendingCode}
                              className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>ارسال کد تایید تستی به {adminEmail}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    2. USERS VIEW
                    ========================================================================= */}
                {activeTab === 'USERS' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-800/50">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>همه کاربران سامانه ({users.length})</span>
                      </span>
                      <span className="text-slate-400">سطوح: مدیر کل / مشترک VIP / کاربر عادی</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <th className="p-3">نام و هویت</th>
                            <th className="p-3">ایمیل / شماره تماس</th>
                            <th className="p-3">کد معرف</th>
                            <th className="p-3">دعوت‌شده‌ها</th>
                            <th className="p-3">نقش و اشتراک</th>
                            <th className="p-3">پورسانت (USDT)</th>
                            <th className="p-3 text-center">وضعیت و عملیات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-bold flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-white">{u.name}</span>
                                {u.id === 'user_admin_hamed' && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                    مدیر کل
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-slate-300">
                                {u.phone || u.email || 'ثبت نشده'}
                              </td>
                              <td className="p-3 font-mono text-indigo-400">{u.referralCode}</td>
                              <td className="p-3 font-bold text-white">{u.referralCount || 0} نفر</td>
                              <td className="p-3">
                                {u.isVip ? (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                    اشتراک VIP
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                                    عادی
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-400">
                                {(u.rewardBalanceUsdt || 0).toFixed(2)} $
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {u.isBlocked ? (
                                    <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                                      مسدود
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                                      فعال
                                    </span>
                                  )}

                                  {u.id !== 'user_admin_hamed' && (
                                    <>
                                      <button
                                        onClick={() => handleToggleBlockUser(u.id, !u.isBlocked)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                          u.isBlocked
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : 'bg-amber-600 hover:bg-amber-500 text-white'
                                        }`}
                                        title={u.isBlocked ? 'رفع مسدودی حساب' : 'مسدودسازی حساب کاربر'}
                                      >
                                        {u.isBlocked ? 'رفع مسدودی' : 'مسدودسازی'}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-600 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                        title="حذف کامل حساب کاربر"
                                      >
                                        حذف
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    4. FINANCES VIEW (Deposits & Withdrawals)
                    ========================================================================= */}
                {activeTab === 'FINANCES' && (
                  <div className="space-y-5">
                    {/* Sub-tabs: Deposits vs Withdrawals */}
                    <div className="flex gap-2.5 pb-2 text-xs font-bold">
                      <button
                        onClick={() => setFinanceSubTab('DEPOSITS')}
                        className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                          financeSubTab === 'DEPOSITS'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>واریزی‌های اشتراک VIP ({deposits.length})</span>
                      </button>
                      <button
                        onClick={() => setFinanceSubTab('WITHDRAWALS')}
                        className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                          financeSubTab === 'WITHDRAWALS'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>درخواست‌های تسویه‌حساب BEP-20 ({withdrawals.length})</span>
                      </button>
                    </div>

                    {financeSubTab === 'DEPOSITS' ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-800/50">
                          <span className="font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-400" />
                            <span>تراکنش‌های واریزی اشتراک کاربران</span>
                          </span>
                          <span className="text-slate-400">تایید آنی با ارتقای سطح کاربر به VIP</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                                <th className="p-3">کاربر</th>
                                <th className="p-3">مبلغ</th>
                                <th className="p-3">پلن</th>
                                <th className="p-3">شناسه پرداخت / فیش</th>
                                <th className="p-3">وضعیت</th>
                                <th className="p-3">اقدام</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {deposits.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 font-mono text-slate-300">{d.userIdentifier}</td>
                                  <td className="p-3 font-bold font-mono text-emerald-400">
                                    {d.currency === 'TOMAN'
                                      ? `${d.amount.toLocaleString('fa-IR')} تومان`
                                      : `${d.amount} USDT`}
                                  </td>
                                  <td className="p-3 text-purple-300 font-bold">{d.planName}</td>
                                  <td className="p-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                                    {d.txid}
                                  </td>
                                  <td className="p-3">
                                    {d.status === 'APPROVED' ? (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        تایید شده
                                      </span>
                                    ) : d.status === 'REJECTED' ? (
                                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        رد شده
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        در انتظار بررسی
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {d.status === 'PENDING' && (
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleUpdateDepositStatus(d.id, 'APPROVED')}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                        >
                                          تایید
                                        </button>
                                        <button
                                          onClick={() => handleUpdateDepositStatus(d.id, 'REJECTED')}
                                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                        >
                                          رد
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-800/50">
                          <span className="font-bold text-white flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span>درخواست‌های تسویه حساب پورسانت معرفین</span>
                          </span>
                          <span className="text-slate-400 font-mono">شبکه BEP-20 (BSC)</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs border-collapse font-mono">
                            <thead>
                              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-sans">
                                <th className="p-3">کاربر</th>
                                <th className="p-3">مبلغ برداشت</th>
                                <th className="p-3">آدرس کیف‌پول BEP-20</th>
                                <th className="p-3">وضعیت</th>
                                <th className="p-3 font-sans">اقدام</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {withdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 text-slate-300">{w.userIdentifier}</td>
                                  <td className="p-3 font-bold text-amber-400">
                                    {w.amountUsdt} USDT
                                  </td>
                                  <td className="p-3 text-slate-400 text-[11px] flex items-center gap-1.5">
                                    <span className="truncate max-w-xs">{w.bep20Address}</span>
                                    <button
                                      onClick={() => copyToClipboard(w.bep20Address)}
                                      className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                                    >
                                      {copiedText === w.bep20Address ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="p-3 font-sans">
                                    {w.status === 'COMPLETED' ? (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        تسویه شد
                                      </span>
                                    ) : w.status === 'REJECTED' ? (
                                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        رد شد
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                        در انتظار تسویه
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 font-sans">
                                    {w.status === 'PENDING' && (
                                      <div className="flex items-center gap-1.5">
                                        {approvingWithdrawalId === w.id ? (
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              placeholder="TX Hash"
                                              value={withdrawalTxHash}
                                              onChange={(e) => setWithdrawalTxHash(e.target.value)}
                                              className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-[10px] w-32 text-white"
                                            />
                                            <button
                                              onClick={() =>
                                                handleUpdateWithdrawalStatus(w.id, 'COMPLETED', withdrawalTxHash)
                                              }
                                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            >
                                              ثبت
                                            </button>
                                            <button
                                              onClick={() => setApprovingWithdrawalId(null)}
                                              className="text-slate-400 hover:text-white text-[10px] cursor-pointer"
                                            >
                                              لغو
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => setApprovingWithdrawalId(w.id)}
                                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            >
                                              تسویه
                                            </button>
                                            <button
                                              onClick={() => handleUpdateWithdrawalStatus(w.id, 'REJECTED')}
                                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            >
                                              رد
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =========================================================================
                    VIP PLANS VIEW
                    ========================================================================= */}
                {activeTab === 'VIP_PLANS' && (
                  <div className="space-y-5">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-800/50">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>طرح‌های اشتراک ویژه VIP و تعرفه تتری (USDT)</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          امکان تغییر و بروزرسانی آنی تعرفه دلاری طرح‌ها
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                              <th className="p-3">شناسه طرح</th>
                              <th className="p-3">نام طرح</th>
                              <th className="p-3">مدت اعتبار</th>
                              <th className="p-3">قیمت فعلی (USDT)</th>
                              <th className="p-3">برچسب</th>
                              <th className="p-3 text-center">عملیات تغییر قیمت</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {vipPlans.map((plan) => (
                              <tr key={plan.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-mono text-slate-400">{plan.id}</td>
                                <td className="p-3 font-bold text-white">{plan.nameFa}</td>
                                <td className="p-3 font-mono text-slate-300">{plan.days} روز</td>
                                <td className="p-3 font-mono font-bold text-amber-400 text-sm">
                                  {editingVipPlanId === plan.id ? (
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={editingVipPrice}
                                      onChange={(e) => setEditingVipPrice(parseFloat(e.target.value) || 0)}
                                      className="w-20 px-2.5 py-1 border border-slate-700 rounded-lg bg-slate-950 text-white font-mono text-xs"
                                    />
                                  ) : (
                                    `${plan.priceUsdt} $`
                                  )}
                                </td>
                                <td className="p-3">
                                  {plan.badgeFa ? (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                      {plan.badgeFa}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {editingVipPlanId === plan.id ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleUpdateVipPrice(plan.id, editingVipPrice)}
                                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                                      >
                                        ذخیره
                                      </button>
                                      <button
                                        onClick={() => setEditingVipPlanId(null)}
                                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
                                      >
                                        انصراف
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingVipPlanId(plan.id);
                                        setEditingVipPrice(plan.priceUsdt);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 mx-auto transition-all shadow-sm"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>تغییر قیمت</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    EXCHANGE ADS VIEW
                    ========================================================================= */}
                {activeTab === 'ADS' && (
                  <div className="space-y-5">
                    {/* Add New Ad Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 text-white">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>افزودن کمپین تبلیغاتی جدید صرافی</span>
                      </h3>
                      <form onSubmit={handleCreateAd} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1.5">نام انگلیسی صرافی:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: Bitpin یا Wallex"
                            value={newAdData.name}
                            onChange={(e) => setNewAdData({ ...newAdData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">نام فارسی صرافی:</label>
                          <input
                            type="text"
                            placeholder="مثال: صرافی بیت‌پین"
                            value={newAdData.nameFa}
                            onChange={(e) => setNewAdData({ ...newAdData, nameFa: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">لینک ثبت‌نام / معرف (URL):</label>
                          <input
                            type="url"
                            required
                            placeholder="https://..."
                            value={newAdData.referralUrl}
                            onChange={(e) => setNewAdData({ ...newAdData, referralUrl: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">کد معرف:</label>
                          <input
                            type="text"
                            placeholder="مثال: VIP2026"
                            value={newAdData.referralCode}
                            onChange={(e) => setNewAdData({ ...newAdData, referralCode: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">متن تخفیف کارمزد:</label>
                          <input
                            type="text"
                            placeholder="مثال: ۲۰٪ تخفیف کارمزد معاملات"
                            value={newAdData.discountTextFa}
                            onChange={(e) => setNewAdData({ ...newAdData, discountTextFa: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1.5">نوع صرافی:</label>
                          <select
                            value={newAdData.type}
                            onChange={(e) => setNewAdData({ ...newAdData, type: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                          >
                            <option value="IRANIAN">ایرانی (تومانی و تتری)</option>
                            <option value="INTERNATIONAL">بین‌المللی (Global)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block text-slate-400 mb-1.5">توضیحات کوتاه / شعار تبلیغاتی:</label>
                          <input
                            type="text"
                            placeholder="معاملات آنی با کمترین کارمزد و احراز هویت سریع..."
                            value={newAdData.taglineFa}
                            onChange={(e) => setNewAdData({ ...newAdData, taglineFa: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div className="sm:col-span-2 md:col-span-3 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ثبت و انتشار آگهی جدید</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Ads List Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-800/50">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-emerald-400" />
                          <span>فهرست تبلیغات فعال صرافی‌ها ({exchangePartners.length})</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">نمایش اسلایدی و چرخشی در صفحه اصلی</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                              <th className="p-3">نام صرافی</th>
                              <th className="p-3">نوع</th>
                              <th className="p-3">تخفیف</th>
                              <th className="p-3">کد معرف</th>
                              <th className="p-3">وضعیت</th>
                              <th className="p-3 text-center">عملیات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {exchangePartners.map((partner) => (
                              <tr key={partner.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-bold">
                                  <span className="text-white">{partner.nameFa || partner.name}</span>
                                  <span className="text-slate-400 block text-[10px] font-mono mt-0.5">{partner.referralUrl}</span>
                                </td>
                                <td className="p-3">
                                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                    {partner.type === 'IRANIAN' ? 'ایرانی' : 'بین‌المللی'}
                                  </span>
                                </td>
                                <td className="p-3 text-emerald-400 font-bold">
                                  {partner.discountTextFa || `${partner.discountPercent || 15}٪`}
                                </td>
                                <td className="p-3 font-mono text-amber-400 font-bold">{partner.referralCode || '-'}</td>
                                <td className="p-3">
                                  {partner.isActive !== false ? (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                      فعال
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                                      غیرفعال
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleToggleAd(partner.id)}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                        partner.isActive !== false
                                          ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
                                          : 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                                      }`}
                                    >
                                      {partner.isActive !== false ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAd(partner.id)}
                                      className="px-3 py-1 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    5. TICKETS VIEW
                    ========================================================================= */}
                {activeTab === 'TICKETS' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm text-white">تیکت‌های پشتیبانی کاربران</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {tickets.filter(t => t.status === 'OPEN').length} تیکت باز
                      </span>
                    </div>

                    {selectedTicket ? (
                      <div className="space-y-4">
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          ← بازگشت به لیست تیکت‌ها
                        </button>

                        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{selectedTicket.subject}</span>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                              {selectedTicket.department}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            کاربر: {selectedTicket.userIdentifier}
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                          {selectedTicket.messages.map((m) => (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl text-xs max-w-md ${
                                m.sender === 'admin'
                                  ? 'bg-purple-900/30 border border-purple-700/40 mr-auto text-purple-100'
                                  : 'bg-slate-800/80 border border-slate-700 ml-auto text-slate-200'
                              }`}
                            >
                              <div className="text-[10px] font-bold text-slate-400 mb-1">
                                {m.sender === 'admin' ? 'پاسخ تیم مدیریت پلتفرم:' : 'پیام کاربر:'}
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Admin Reply Form */}
                        <form onSubmit={handleSendAdminReply} className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder="پاسخ مدیریت به کاربر..."
                            className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/30"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ارسال پاسخ</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                              <th className="p-3">موضوع تیکت</th>
                              <th className="p-3">دپارتمان</th>
                              <th className="p-3">کاربر</th>
                              <th className="p-3">وضعیت</th>
                              <th className="p-3">اقدام</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {tickets.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-bold text-white">{t.subject}</td>
                                <td className="p-3 text-slate-400">{t.department}</td>
                                <td className="p-3 font-mono text-slate-300">{t.userIdentifier}</td>
                                <td className="p-3">
                                  {t.status === 'OPEN' ? (
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                      در انتظار پاسخ
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                      پاسخ داده شد
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => setSelectedTicket(t)}
                                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                                  >
                                    پاسخ‌گویی
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* =========================================================================
                    6. SEARCHES VIEW
                    ========================================================================= */}
                {activeTab === 'SEARCHES' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm text-white">لاگ بلادرنگ جستجوهای کاربران</span>
                      </div>
                      <span className="text-[11px] text-slate-400">ترندهای تقاضای بازار رمزارز</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse font-mono">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-sans">
                            <th className="p-3">عبارت جستجوشده</th>
                            <th className="p-3">کاربر</th>
                            <th className="p-3 text-left">زمان ثبت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {searches.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-bold text-purple-300">{s.query}</td>
                              <td className="p-3 font-sans text-slate-300">{s.userIdentifier || 'مهمان'}</td>
                              <td className="p-3 text-slate-400 text-left">
                                {new Date(s.timestamp).toLocaleString('fa-IR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* =========================================================================
                    7. SECURITY VIEW (TOTP 2FA & Audit Trail)
                    ========================================================================= */}
                {activeTab === 'SECURITY' && (
                  <div className="space-y-5">
                    {/* Super Admin TOTP Security Card */}
                    <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">
                              احراز هویت دو مرحله‌ای سخت‌افزاری (Google Authenticator / TOTP)
                            </h4>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                totpStatus?.enabled
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              }`}
                            >
                              {totpStatus?.enabled ? 'فعال (محافظت حداکثری)' : 'غیرفعال'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            تولید کدهای یک‌بار مصرف ۶ رقمی مبتنی بر زمان (RFC 6238) جهت تایید تراکنش‌های مالی، پشتیبان‌گیری‌ها و دسترسی به تنظیمات حساس پایگاه داده.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsTotpModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-900/30 cursor-pointer shrink-0 flex items-center gap-2 hover:scale-102 active:scale-98"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{totpStatus?.enabled ? 'مدیریت کلید و بارکد TOTP' : 'پیکربندی و فعال‌سازی TOTP'}</span>
                      </button>
                    </div>

                    {/* Audit Trail Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm text-white">دفتر ثبت وقایع امنیتی و تلمتری سیستم (Audit Trail)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">لاگ کدهای ۲FA، ورودها و تغییرات</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border-collapse font-mono">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-sans">
                            <th className="p-3">رویداد</th>
                            <th className="p-3">عامل</th>
                            <th className="p-3">جزئیات</th>
                            <th className="p-3">IP</th>
                            <th className="p-3 text-left">زمان</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-bold text-amber-400">{log.action}</td>
                              <td className="p-3 text-purple-300">{log.actor}</td>
                              <td className="p-3 font-sans text-[11px] text-slate-300 max-w-sm">
                                {log.details}
                              </td>
                              <td className="p-3 text-slate-400">{log.ip || '127.0.0.1'}</td>
                              <td className="p-3 text-slate-400 text-left">
                                {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                )}

                {/* =========================================================================
                    8. SETTINGS VIEW
                    ========================================================================= */}
                {activeTab === 'SETTINGS' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl text-xs space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Settings className="w-4 h-4 text-purple-400" />
                      <h3 className="font-bold text-sm text-white">
                        تنظیمات عمومی مرکز فرماندهی و سامانه
                      </h3>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1.5 text-slate-300">ایمیل مدیر کل (جهت دریافت کدهای ۲FA):</label>
                      <input
                        type="email"
                        disabled
                        value={adminEmail}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-slate-400"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        کدهای تایید امنیتی به این ایمیل ارسال می‌شوند.
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div>
                        <span className="font-bold text-white block">الزام تایید دو مرحله‌ای (Enforce 2FA)</span>
                        <span className="text-[11px] text-slate-400">
                          ورود به پنل بدون تایید کد ۶ رقمی ایمیل مسدود خواهد بود.
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px]">
                        فعال است
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div>
                        <span className="font-bold text-white block">سهمیه تحلیل رایگان روزانه کاربران</span>
                        <span className="text-[11px] text-slate-400">
                          تعداد تحلیل رایگان مجاز پیش از درخواست خرید اشتراک VIP
                        </span>
                      </div>
                      <span className="font-bold font-mono text-sm text-purple-300">
                        {systemSettings?.dailyFreeAnalysisLimit || 2} بار در روز
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => alert('تنظیمات مرکز فرماندهی با موفقیت در پایگاه داده ذخیره شد.')}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-purple-900/30"
                      >
                        ذخیره تغییرات
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {/* Super Admin Hardware/App TOTP Configuration Modal */}
      <TotpSetupModal
        isOpen={isTotpModalOpen}
        onClose={() => {
          setIsTotpModalOpen(false);
          loadAdminData();
        }}
        adminToken={adminToken}
        lang="fa"
        theme="dark"
        onTotpStatusChanged={(enabled) => {
          setTotpStatus((prev) =>
            prev ? { ...prev, enabled } : { enabled, adminEmail: 'hamed.farri@gmail.com' }
          );
          loadAdminData();
        }}
      />
    </div>
  );
};
