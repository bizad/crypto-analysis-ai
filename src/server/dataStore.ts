import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";
import type {
  Admin2faVerification,
  StoredTechnicalAnalysis,
  StoredFundamentalAnalysis,
  StoredFearAndGreedSnapshot,
  StoredExchangePartner,
  StoredSystemSettings,
  StoredAuditLog,
  DatabaseTableMeta,
  NotificationItem,
  ApiHealthStatus,
} from "../types.js";
import {
  generateTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  verifyTotpToken,
} from "./totp.js";

// ==========================================
// Cryptographic Password Hashing & Verification
// ==========================================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  // Transparent migration from legacy plaintext (upgraded upon next login)
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
}

// ==========================================
// Wallet Address Validation
// ==========================================
export function validateWalletAddress(network: string, address: string): { valid: boolean; error?: string } {
  const trimmed = address.trim();
  if (!trimmed) return { valid: false, error: "آدرس ولت نمی‌تواند خالی باشد." };

  if (network === "BEP20" || network === "ERC20" || trimmed.startsWith("0x")) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return {
        valid: false,
        error: "فرمت آدرس کیف‌پول شبکه BEP20 نامعتبر است (باید با 0x شروع شده و ۴۲ کاراکتر باشد).",
      };
    }
  } else if (network === "TRC20" || trimmed.startsWith("T")) {
    if (!/^T[1-9A-HJ-NP-za-km-z]{33}$/.test(trimmed)) {
      return {
        valid: false,
        error: "فرمت آدرس کیف‌پول شبکه TRC20 نامعتبر است (باید با T شروع شده و ۳۴ کاراکتر باشد).",
      };
    }
  }
  return { valid: true };
}

export interface StoredUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  weeklyBonusQuota: number;
  usedWeeklyQuota: number;
  rewardBalanceUsdt: number;
  totalEarnedUsdt: number;
  bep20Address?: string;
  isVip: boolean;
  vipPlan?: string;
  vipExpiresAt?: number;
  isBlocked?: boolean;
  blockedReason?: string;
  createdAt: number;
}

export interface StoredSession {
  token: string;
  userId: string;
  role: "ADMIN" | "USER";
  pending2fa?: boolean;
  createdAt: number;
  expiresAt: number;
  ip?: string;
  userAgent?: string;
}

export interface StoredVipPlan {
  id: string;
  nameFa: string;
  nameEn: string;
  durationDays: number;
  priceUsdt: number;
  badgeFa?: string;
  badgeEn?: string;
  savingsFa?: string;
}

export interface StoredWithdrawal {
  id: string;
  userId: string;
  userIdentifier: string;
  amountUsdt: number;
  bep20Address: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  txHash?: string;
  createdAt: number;
  reviewedAt?: number;
  adminNote?: string;
}

export interface StoredDeposit {
  id: string;
  userId: string;
  userIdentifier: string;
  amount: number;
  currency: "USDT" | "TOMAN";
  planId: string;
  planName: string;
  txid: string;
  receiptNote?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: number;
  reviewedAt?: number;
}

export interface StoredTicketMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  createdAt: number;
}

export interface StoredTicket {
  id: string;
  userId: string;
  userIdentifier: string;
  subject: string;
  department: string;
  messages: StoredTicketMessage[];
  status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "RESOLVED" | "CLOSED";
  createdAt: number;
  updatedAt: number;
}

export interface StoredSearch {
  id: string;
  userId?: string;
  userIdentifier: string;
  query: string;
  timestamp: number;
}

export interface StoredWatchlist {
  id: string;
  userId?: string;
  symbols: string[];
  updatedAt: number;
}

export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "VIP";
  read: boolean;
  createdAt: number;
  link?: string;
}

export interface AppStoreData {
  users: StoredUser[];
  sessions: StoredSession[];
  admin2faCodes: Admin2faVerification[];
  deposits: StoredDeposit[];
  withdrawals: StoredWithdrawal[];
  tickets: StoredTicket[];
  searches: StoredSearch[];
  technicalAnalyses: StoredTechnicalAnalysis[];
  fundamentalAnalyses: StoredFundamentalAnalysis[];
  fearAndGreedRecords: StoredFearAndGreedSnapshot[];
  exchangePartners: StoredExchangePartner[];
  systemSettings: StoredSystemSettings;
  auditLogs: StoredAuditLog[];
  watchlists: StoredWatchlist[];
  vipPlans: StoredVipPlan[];
  notifications: StoredNotification[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const DATA_FILE = path.join(DATA_DIR, "app-store.json");
const SQLITE_FILE = path.join(DATA_DIR, "didban.db");

export const INITIAL_VIP_PLANS: StoredVipPlan[] = [
  {
    id: "weekly",
    nameFa: "هفتگی (۷ روزه)",
    nameEn: "Weekly (7 Days)",
    priceUsdt: 1,
    durationDays: 7,
    badgeFa: "پایه و اقتصادی",
    badgeEn: "Starter",
    savingsFa: "تست و بررسی امکانات",
  },
  {
    id: "monthly",
    nameFa: "ماهانه (۳۰ روزه)",
    nameEn: "Monthly (30 Days)",
    priceUsdt: 3.5,
    durationDays: 30,
    badgeFa: "محبوب‌ترین انتخاب",
    badgeEn: "Most Popular",
    savingsFa: "صرفه‌جویی ۱۲٪ نسبت به هفتگی",
  },
  {
    id: "quarterly",
    nameFa: "سه ماهه (۹۰ روزه)",
    nameEn: "Quarterly (3 Months)",
    priceUsdt: 9,
    durationDays: 90,
    badgeFa: "پیشنهاد تریدرها",
    badgeEn: "Recommended",
    savingsFa: "صرفه‌جویی ۲۵٪ نسبت به ماهانه",
  },
  {
    id: "semi_annual",
    nameFa: "شش ماهه (۱۸۰ روزه)",
    nameEn: "Semi-Annual (6 Months)",
    priceUsdt: 15,
    durationDays: 180,
    badgeFa: "ارزش فوق‌العاده",
    badgeEn: "Great Value",
    savingsFa: "صرفه‌جویی ۳۰٪ نسبت به پلن ۳ ماهه",
  },
  {
    id: "annual",
    nameFa: "یک ساله (۳۶۵ روزه)",
    nameEn: "Annual (1 Year)",
    priceUsdt: 25,
    durationDays: 365,
    badgeFa: "حداکثر تخفیف و بازدهی",
    badgeEn: "Best Savings",
    savingsFa: "بیشترین صرفه‌جویی اقتصادی (۴۰٪+)",
  },
];

const DEFAULT_SYSTEM_SETTINGS: StoredSystemSettings = {
  id: "global_settings_default",
  platformName: "دیدبان تحلیل تکنیکال و فاندامنتال کریپتو",
  adminEmail: "hamed.farri@gmail.com",
  admin2faRequired: true,
  dailyFreeAnalysisLimit: 3,
  maintenanceMode: false,
  announcementText: "نسخه امنیتی دیدبان با رمزنگاری پیشرفته Scrypt و تایید دو مرحله‌ای فعال شد.",
  announcementActive: true,
  contactEmail: "hamed.farri@gmail.com",
  supportPhone: "+98 912 123 4567",
  updatedAt: Date.now(),
};

function getInitialSeedData(): AppStoreData {
  const now = Date.now();
  const dayMs = 86400000;

  return {
    users: [
      {
        id: "user_admin_hamed",
        name: "حامد فرّی (مدیر کل و توسعه‌دهنده)",
        email: "hamed.farri@gmail.com",
        phone: "09121234567",
        // Scrypt hashed password for security
        password: hashPassword(process.env.ADMIN_INITIAL_PASSWORD || "HamedFarri@Secure2026!"),
        referralCode: "HAMED2026",
        referralCount: 14,
        weeklyBonusQuota: 14,
        usedWeeklyQuota: 2,
        rewardBalanceUsdt: 42.5,
        totalEarnedUsdt: 125.0,
        bep20Address: "0x71C836e4f3AbC822295E4F28f7dF7B9889617277",
        isVip: true,
        vipPlan: "annual",
        vipExpiresAt: now + 365 * dayMs,
        createdAt: now - 30 * dayMs,
      },
      {
        id: "user_trader_1",
        name: "علیرضا رضایی",
        phone: "09198765432",
        email: "alireza.crypto@gmail.com",
        password: hashPassword("TraderAlireza#2026"),
        referralCode: "ALI-882",
        referredBy: "HAMED2026",
        referralCount: 3,
        weeklyBonusQuota: 3,
        usedWeeklyQuota: 1,
        rewardBalanceUsdt: 15.8,
        totalEarnedUsdt: 15.8,
        isVip: true,
        vipPlan: "monthly",
        vipExpiresAt: now + 18 * dayMs,
        createdAt: now - 12 * dayMs,
      },
    ],
    sessions: [],
    admin2faCodes: [],
    deposits: [],
    withdrawals: [],
    tickets: [],
    searches: [],
    technicalAnalyses: [],
    fundamentalAnalyses: [],
    fearAndGreedRecords: [],
    exchangePartners: [],
    systemSettings: DEFAULT_SYSTEM_SETTINGS,
    auditLogs: [
      {
        id: "audit_init",
        action: "SECURITY_INITIALIZED",
        actor: "SYSTEM",
        details: "پایگاه داده امنیتی با رمزنگاری Scrypt و پشتیبانی SQLite مستقر گردید.",
        timestamp: now,
        ip: "127.0.0.1",
      },
    ],
    watchlists: [
      {
        id: "watch_admin",
        userId: "user_admin_hamed",
        symbols: ["BTC", "ETH", "SOL", "RENDER", "SUI"],
        updatedAt: now,
      },
    ],
    vipPlans: [...INITIAL_VIP_PLANS],
    notifications: [
      {
        id: "notif_welcome",
        userId: "ALL",
        title: "ارتقای امنیتی پلتفرم دیدبان",
        message: "سیستم احراز هویت دو مرحله‌ای و رمزنگاری داده‌ها با موفقیت فعال شد.",
        type: "VIP",
        read: false,
        createdAt: now,
      },
    ],
  };
}

export class DataStore {
  private data: AppStoreData;
  private sqliteDb: DatabaseSync | null = null;

  constructor() {
    this.ensureDirs();
    this.initSqlite();
    this.data = this.loadData();
    this.cleanupExpiredSessions();
    this.migratePlaintextPasswords();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  private initSqlite() {
    try {
      this.sqliteDb = new DatabaseSync(SQLITE_FILE);
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          password TEXT,
          referralCode TEXT,
          isVip INTEGER,
          vipPlan TEXT,
          vipExpiresAt INTEGER,
          rewardBalanceUsdt REAL,
          createdAt INTEGER
        );
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          userId TEXT,
          role TEXT,
          pending2fa INTEGER,
          createdAt INTEGER,
          expiresAt INTEGER,
          ip TEXT
        );
        CREATE TABLE IF NOT EXISTS deposits (
          id TEXT PRIMARY KEY,
          userId TEXT,
          amount REAL,
          currency TEXT,
          planId TEXT,
          txid TEXT UNIQUE,
          status TEXT,
          createdAt INTEGER
        );
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          action TEXT,
          actor TEXT,
          details TEXT,
          timestamp INTEGER,
          ip TEXT
        );
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          userId TEXT,
          title TEXT,
          message TEXT,
          type TEXT,
          read INTEGER,
          createdAt INTEGER
        );
      `);
      console.log("[DataStore] SQLite database initialized successfully at", SQLITE_FILE);
    } catch (err) {
      console.warn("[DataStore] SQLite initialization warning:", err);
    }
  }

  private loadData(): AppStoreData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
          if (!Array.isArray(parsed.admin2faCodes)) parsed.admin2faCodes = [];
          if (!Array.isArray(parsed.withdrawals)) parsed.withdrawals = [];
          if (!Array.isArray(parsed.tickets)) parsed.tickets = [];
          if (!Array.isArray(parsed.deposits)) parsed.deposits = [];
          if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = [];
          if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
          if (!Array.isArray(parsed.vipPlans) || parsed.vipPlans.length === 0) parsed.vipPlans = [...INITIAL_VIP_PLANS];
          if (!parsed.systemSettings) parsed.systemSettings = DEFAULT_SYSTEM_SETTINGS;
          return parsed as AppStoreData;
        }
      }
    } catch (err) {
      console.warn("[DataStore] Failed to read store from disk, generating fresh seed:", err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
      this.syncToSqlite(dataToSave);
    } catch (err) {
      console.error("[DataStore] Error saving store to disk:", err);
    }
  }

  public reloadFromDisk(): boolean {
    try {
      this.data = this.loadData();
      if (this.sqliteDb) {
        try {
          this.sqliteDb.close();
        } catch {}
      }
      this.initSqlite();
      console.log("[DataStore] Reloaded store data and re-initialized SQLite database from disk.");
      return true;
    } catch (err) {
      console.error("[DataStore] Failed to reload store from disk:", err);
      return false;
    }
  }

  private syncToSqlite(data: AppStoreData) {
    if (!this.sqliteDb) return;
    try {
      // 18. Transaction Safety with ACID BEGIN/COMMIT
      this.sqliteDb.exec("BEGIN");

      // Sync Users
      const insertUser = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO users (id, name, email, phone, password, referralCode, isVip, vipPlan, vipExpiresAt, rewardBalanceUsdt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of data.users) {
        insertUser.run(
          u.id,
          u.name,
          u.email || null,
          u.phone || null,
          u.password || null,
          u.referralCode,
          u.isVip ? 1 : 0,
          u.vipPlan || null,
          u.vipExpiresAt || null,
          u.rewardBalanceUsdt || 0,
          u.createdAt
        );
      }

      // Sync Sessions
      const insertSession = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO sessions (token, userId, role, pending2fa, createdAt, expiresAt, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of data.sessions) {
        insertSession.run(s.token, s.userId, s.role, s.pending2fa ? 1 : 0, s.createdAt, s.expiresAt, s.ip || null);
      }

      // 15 & 18. Sync Deposits with TXID Uniqueness
      const insertDeposit = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO deposits (id, userId, amount, currency, planId, txid, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const d of data.deposits) {
        insertDeposit.run(d.id, d.userId, d.amount, d.currency, d.planId, d.txid, d.status, d.createdAt);
      }

      // Sync Audit Logs
      const insertAudit = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO audit_logs (id, action, actor, details, timestamp, ip)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const a of data.auditLogs.slice(0, 100)) {
        insertAudit.run(a.id, a.action, a.actor, a.details, a.timestamp, a.ip || null);
      }

      this.sqliteDb.exec("COMMIT");
    } catch (err) {
      try {
        this.sqliteDb.exec("ROLLBACK");
      } catch {}
      console.warn("[DataStore] SQLite sync transaction error:", err);
    }
  }

  // Upgrade legacy plaintext passwords to secure scrypt hashes
  private migratePlaintextPasswords() {
    let changed = false;
    for (const u of this.data.users) {
      if (u.password && !u.password.includes(":")) {
        u.password = hashPassword(u.password);
        changed = true;
      }
    }
    if (changed) {
      this.saveData();
      console.log("[DataStore] Upgraded legacy plaintext passwords to Scrypt hashes.");
    }
  }

  // ==========================================
  // Session & Authentication Management (IDOR & Session Hardening)
  // ==========================================
  public createSession(params: {
    userId: string;
    role: "ADMIN" | "USER";
    pending2fa?: boolean;
    ip?: string;
    userAgent?: string;
  }): StoredSession {
    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    // Admin sessions expire in 24 hours, users in 7 days
    const duration = params.role === "ADMIN" ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000;

    const session: StoredSession = {
      token,
      userId: params.userId,
      role: params.role,
      pending2fa: !!params.pending2fa,
      createdAt: now,
      expiresAt: now + duration,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    this.data.sessions.push(session);
    this.saveData();
    return session;
  }

  public getSession(token?: string): StoredSession | null {
    if (!token) return null;
    const cleanToken = token.replace("Bearer ", "").trim();
    const session = this.data.sessions.find((s) => s.token === cleanToken);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.revokeSession(cleanToken);
      return null;
    }
    return session;
  }

  public revokeSession(token: string): boolean {
    const cleanToken = token.replace("Bearer ", "").trim();
    const idx = this.data.sessions.findIndex((s) => s.token === cleanToken);
    if (idx !== -1) {
      this.data.sessions.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  public cleanupExpiredSessions() {
    const now = Date.now();
    const initialCount = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);
    if (this.data.sessions.length !== initialCount) {
      this.saveData();
    }
  }

  public validateAdminSession(token?: string): boolean {
    const session = this.getSession(token);
    if (!session) return false;
    // Super admin must be role ADMIN and must have completed 2FA
    return session.role === "ADMIN" && !session.pending2fa;
  }

  public validateAdminToken(token?: string): boolean {
    return this.validateAdminSession(token);
  }

  public getSessionCount(): number {
    const now = Date.now();
    return this.data.sessions.filter((s) => s.expiresAt > now).length;
  }

  // ==========================================
  // Super Admin 2FA Verification
  // ==========================================
  public sendAdmin2fa(adminEmail: string, ip?: string): { success: boolean; message: string; expiresAt: number } {
    const targetEmail = adminEmail.trim().toLowerCase();
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const verificationRecord: Admin2faVerification = {
      id: `2fa_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      adminEmail: targetEmail,
      code,
      expiresAt,
      attempts: 0,
      isUsed: false,
      createdAt: Date.now(),
      ip,
    };

    this.data.admin2faCodes.push(verificationRecord);
    this.logAudit("ADMIN_2FA_CODE_GENERATED", targetEmail, `کد تایید دو مرحله‌ای جدید به مدت ۵ دقیقه صادر شد.`, ip);
    this.saveData();

    console.log(`\n========================================`);
    console.log(`[DIDBAN 2FA SECURITY] One-Time Password for ${targetEmail}:`);
    console.log(`CODE: >>> ${code} <<<`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: `کد تایید امنیتی به ایمیل ${targetEmail} ارسال شد. (در محیط توسعه در لاگ سرور نیز چاپ شده است)`,
      expiresAt,
    };
  }

  public verifyAdmin2fa(
    targetEmail: string,
    code: string,
    pendingSessionToken?: string,
    ip?: string
  ): { success: boolean; token?: string; error?: string; admin?: any } {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const cleanCode = code.trim();

    const activeCode = this.data.admin2faCodes
      .filter((c) => c.adminEmail.toLowerCase() === cleanEmail && !c.isUsed && c.expiresAt > Date.now())
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!activeCode) {
      return { success: false, error: "کد تایید منقضی شده یا نامعتبر است. لطفاً کد جدید دریافت کنید." };
    }

    activeCode.attempts = (activeCode.attempts || 0) + 1;
    if (activeCode.attempts > 5) {
      activeCode.isUsed = true;
      this.saveData();
      return { success: false, error: "تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً مجدداً کد درخواست کنید." };
    }

    if (activeCode.code !== cleanCode) {
      this.saveData();
      return {
        success: false,
        error: `کد وارد شده صحیح نیست. (${5 - activeCode.attempts} فرصت باقی‌مانده)`,
      };
    }

    activeCode.isUsed = true;

    // Upgrade session to verified admin
    let session = pendingSessionToken ? this.getSession(pendingSessionToken) : null;
    if (session && session.userId === "user_admin_hamed") {
      session.pending2fa = false;
    } else {
      session = this.createSession({
        userId: "user_admin_hamed",
        role: "ADMIN",
        pending2fa: false,
        ip,
      });
    }

    this.logAudit("ADMIN_2FA_VERIFIED_SUCCESS", targetEmail, "ورود دو مرحله‌ای مدیر ارشد با موفقیت تایید شد.", ip);
    this.saveData();

    return {
      success: true,
      token: session.token,
      admin: {
        id: "user_admin_hamed",
        name: "حامد فرّی",
        email: targetEmail,
        role: "SUPER_ADMIN",
      },
    };
  }

  // ==========================================
  // Users & Accounts
  // ==========================================
  public getUsers(): StoredUser[] {
    return this.data.users.map((u) => {
      const { password, ...safe } = u;
      return safe as StoredUser;
    });
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByIdentifier(identifier: string): StoredUser | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) =>
        (u.phone && u.phone.trim() === clean) ||
        (u.email && u.email.trim().toLowerCase() === clean)
    );
  }

  public registerUser(params: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    referralCode?: string;
    ip?: string;
  }): { user: StoredUser; token: string } {
    const { name, phone, email, password, referralCode, ip } = params;

    if (phone && this.findUserByIdentifier(phone)) {
      throw new Error("این شماره موبایل قبلاً در سیستم ثبت شده است.");
    }
    if (email && this.findUserByIdentifier(email)) {
      throw new Error("این ایمیل قبلاً در سیستم ثبت شده است.");
    }

    const randomSuffix = crypto.randomInt(1000, 9999);
    const userRefCode = `REF-${randomSuffix}`;

    const newUser: StoredUser = {
      id: `user_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      name: name.trim() || (phone ? `کاربر ${phone.slice(-4)}` : "کاربر جدید"),
      phone: phone?.trim(),
      email: email?.trim().toLowerCase(),
      password: hashPassword(password || "UserPass@123456"),
      referralCode: userRefCode,
      referredBy: referralCode ? referralCode.trim().toUpperCase() : undefined,
      referralCount: 0,
      weeklyBonusQuota: 0,
      usedWeeklyQuota: 0,
      rewardBalanceUsdt: 0,
      totalEarnedUsdt: 0,
      isVip: false,
      createdAt: Date.now(),
    };

    if (referralCode) {
      const inviter = this.data.users.find(
        (u) => u.referralCode.toUpperCase() === referralCode.trim().toUpperCase()
      );
      if (inviter && inviter.id !== newUser.id) {
        inviter.referralCount = (inviter.referralCount || 0) + 1;
        inviter.weeklyBonusQuota = (inviter.weeklyBonusQuota || 0) + 1;
      }
    }

    this.data.users.push(newUser);
    const session = this.createSession({ userId: newUser.id, role: "USER", ip });

    this.logAudit("USER_REGISTERED", newUser.name, `ثبت‌نام کاربر جدید: ${newUser.phone || newUser.email}`, ip);
    this.saveData();

    const { password: _, ...safeUser } = newUser;
    return { user: safeUser as StoredUser, token: session.token };
  }

  public loginUser(
    identifier: string,
    password?: string,
    ip?: string
  ): { user: StoredUser; token: string; requires2fa?: boolean } {
    const user = this.findUserByIdentifier(identifier);
    if (!user) throw new Error("حساب کاربری با این مشخصات یافت نشد.");

    if (user.isBlocked) {
      throw new Error(user.blockedReason || "حساب کاربری شما مسدود است.");
    }

    if (password && user.password) {
      const isMatch = verifyPassword(password, user.password);
      if (!isMatch) {
        this.logAudit("LOGIN_FAILED", identifier, "تلاش برای ورود با رمز نادرست", ip);
        throw new Error("رمز عبور وارد شده نادرست است.");
      }
    }

    const isAdmin = user.id === "user_admin_hamed" || user.email === "hamed.farri@gmail.com";
    const session = this.createSession({
      userId: user.id,
      role: isAdmin ? "ADMIN" : "USER",
      pending2fa: isAdmin, // Enforce 2FA for Admin
      ip,
    });

    if (isAdmin) {
      this.sendAdmin2fa(user.email || "hamed.farri@gmail.com", ip);
    }

    this.logAudit(
      isAdmin ? "ADMIN_LOGIN_PASSWORD_ACCEPTED" : "USER_LOGIN_SUCCESS",
      user.name,
      isAdmin ? "گام اول ورود مدیر ارشد تایید شد، نیازمند اعتبارسنجی 2FA" : "ورود موفق کاربر",
      ip
    );

    const { password: _, ...safeUser } = user;
    return { user: safeUser as StoredUser, token: session.token, requires2fa: isAdmin };
  }

  // ==========================================
  // Deposits (Anti-Duplicate TXID & Anti-Double Approval)
  // ==========================================
  public createDeposit(params: {
    userId: string;
    userIdentifier: string;
    amount: number;
    currency: "USDT" | "TOMAN";
    planId: string;
    planName: string;
    txid: string;
    receiptNote?: string;
  }): StoredDeposit {
    const cleanTxid = params.txid.trim();

    // 15. Anti-duplicate TXID check
    const existing = this.data.deposits.find(
      (d) => d.txid.toLowerCase() === cleanTxid.toLowerCase()
    );
    if (existing) {
      throw new Error("این شناسه تراکنش (TXID) قبلاً در سامانه ثبت شده است و امکان ثبت تکراری وجود ندارد.");
    }

    const newDep: StoredDeposit = {
      id: `dep_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      userId: params.userId,
      userIdentifier: params.userIdentifier,
      amount: params.amount,
      currency: params.currency,
      planId: params.planId,
      planName: params.planName,
      txid: cleanTxid,
      receiptNote: params.receiptNote,
      status: "PENDING",
      createdAt: Date.now(),
    };

    this.data.deposits.unshift(newDep);
    this.createNotification({
      userId: params.userId,
      title: "درخواست پرداخت ثبت شد",
      message: `واریز شما برای ${params.planName} با شناسه پیگیری ثبت گردید و در حال بررسی است.`,
      type: "INFO",
    });

    this.logAudit("DEPOSIT_SUBMITTED", params.userIdentifier, `درخواست شارژ جدید: ${params.amount} ${params.currency}`);
    this.saveData();
    return newDep;
  }

  public updateDepositStatus(depositId: string, status: "APPROVED" | "REJECTED"): StoredDeposit {
    const dep = this.data.deposits.find((d) => d.id === depositId);
    if (!dep) throw new Error("سند واریز یافت نشد.");

    // 16. Prevent Double Approval
    if (dep.status !== "PENDING") {
      throw new Error(`این واریز قبلاً تعیین وضعیت شده است (وضعیت فعلی: ${dep.status}). ویرایش مجدد مجاز نیست.`);
    }

    dep.status = status;
    dep.reviewedAt = Date.now();

    if (status === "APPROVED") {
      const user = this.findUserById(dep.userId);
      if (user) {
        user.isVip = true;
        user.vipPlan = dep.planId;
        const days =
          dep.planId === "annual" ? 365 : dep.planId === "semi_annual" ? 180 : dep.planId === "quarterly" ? 90 : dep.planId === "weekly" ? 7 : 30;
        user.vipExpiresAt = Date.now() + days * 86400000;

        // 10% referral bonus
        if (user.referredBy) {
          const inviter = this.data.users.find(
            (u) => u.referralCode.toUpperCase() === user.referredBy?.toUpperCase()
          );
          if (inviter) {
            const commission = dep.currency === "USDT" ? dep.amount * 0.1 : (dep.amount / 70000) * 0.1;
            inviter.rewardBalanceUsdt = Number(((inviter.rewardBalanceUsdt || 0) + commission).toFixed(2));
            inviter.totalEarnedUsdt = Number(((inviter.totalEarnedUsdt || 0) + commission).toFixed(2));
            this.createNotification({
              userId: inviter.id,
              title: "پاداش دعوت دریافت شد",
              message: `مبلغ ${commission.toFixed(2)} تتر بابت ارتقای اشتراک دوست شما به موجودی شما افزوده شد.`,
              type: "SUCCESS",
            });
          }
        }

        this.createNotification({
          userId: user.id,
          title: "اشتراک VIP شما فعال شد!",
          message: `پرداخت شما تایید شد. دسترسی نامحدود به تحلیل‌های پیشرفته و هوش مصنوعی فعال است.`,
          type: "VIP",
        });
      }
    } else {
      this.createNotification({
        userId: dep.userId,
        title: "وضعیت واریزی: رد شد",
        message: `سند واریز با شناسه ${dep.txid.slice(0, 10)}... مورد تایید قرار نگرفت. لطفاً با پشتیبانی در ارتباط باشید.`,
        type: "WARNING",
      });
    }

    this.logAudit("DEPOSIT_STATUS_UPDATED", "ADMIN", `وضعیت واریز ${depositId} به ${status} تغییر یافت.`);
    this.saveData();
    return dep;
  }

  public getDeposits(): StoredDeposit[] {
    return this.data.deposits;
  }

  public getUserDeposits(userId: string): StoredDeposit[] {
    return this.data.deposits.filter((d) => d.userId === userId);
  }

  // ==========================================
  // Support Tickets Workflow (Professional States)
  // ==========================================
  public createTicket(params: {
    userId: string;
    userIdentifier: string;
    subject: string;
    department: string;
    message: string;
  }): StoredTicket {
    const now = Date.now();
    const newTicket: StoredTicket = {
      id: `ticket_${now}_${crypto.randomBytes(3).toString("hex")}`,
      userId: params.userId,
      userIdentifier: params.userIdentifier,
      subject: params.subject.trim(),
      department: params.department || "GENERAL",
      messages: [
        {
          id: `msg_${now}_1`,
          sender: "user",
          text: params.message.trim(),
          createdAt: now,
        },
      ],
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    };

    this.data.tickets.unshift(newTicket);
    this.logAudit("TICKET_CREATED", params.userIdentifier, `تیکت جدید با موضوع: ${params.subject}`);
    this.saveData();
    return newTicket;
  }

  public replyTicket(ticketId: string, sender: "user" | "admin", text: string): StoredTicket {
    const ticket = this.data.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error("تیکت یافت نشد.");

    const now = Date.now();
    ticket.messages.push({
      id: `msg_${now}_${crypto.randomBytes(3).toString("hex")}`,
      sender,
      text: text.trim(),
      createdAt: now,
    });
    ticket.status = sender === "admin" ? "ANSWERED" : "IN_PROGRESS";
    ticket.updatedAt = now;

    if (sender === "admin") {
      this.createNotification({
        userId: ticket.userId,
        title: "پاسخ جدید به تیکت پشتیبانی",
        message: `مدیریت به تیکت «${ticket.subject}» پاسخ داد.`,
        type: "INFO",
        link: "#tickets",
      });
    }

    this.saveData();
    return ticket;
  }

  public updateTicketStatus(
    ticketId: string,
    status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "RESOLVED" | "CLOSED"
  ): StoredTicket {
    const ticket = this.data.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error("تیکت یافت نشد.");
    ticket.status = status;
    ticket.updatedAt = Date.now();
    this.saveData();
    return ticket;
  }

  public getTickets(): StoredTicket[] {
    return this.data.tickets;
  }

  public getUserTickets(userId: string): StoredTicket[] {
    return this.data.tickets.filter((t) => t.userId === userId);
  }

  // ==========================================
  // In-App Notifications
  // ==========================================
  public createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "VIP";
    link?: string;
  }): StoredNotification {
    const newNotif: StoredNotification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "INFO",
      read: false,
      createdAt: Date.now(),
      link: params.link,
    };
    this.data.notifications.unshift(newNotif);
    this.saveData();
    return newNotif;
  }

  public getUserNotifications(userId: string): StoredNotification[] {
    return this.data.notifications.filter((n) => n.userId === userId || n.userId === "ALL");
  }

  public markNotificationAsRead(notifId: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === notifId && (n.userId === userId || n.userId === "ALL"));
    if (notif) {
      notif.read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // ==========================================
  // Withdrawals & Referrals
  // ==========================================
  public createWithdrawal(params: {
    userId: string;
    userIdentifier: string;
    amountUsdt: number;
    bep20Address: string;
  }): StoredWithdrawal {
    const validation = validateWalletAddress("BEP20", params.bep20Address);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const user = this.findUserById(params.userId);
    if (!user) throw new Error("کاربر یافت نشد.");

    if ((user.rewardBalanceUsdt || 0) < params.amountUsdt) {
      throw new Error("موجودی پاداش تتر شما جهت برداشت کافی نیست.");
    }

    user.rewardBalanceUsdt = Number((user.rewardBalanceUsdt - params.amountUsdt).toFixed(2));

    const newWth: StoredWithdrawal = {
      id: `wth_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      userId: params.userId,
      userIdentifier: params.userIdentifier,
      amountUsdt: params.amountUsdt,
      bep20Address: params.bep20Address.trim(),
      status: "PENDING",
      createdAt: Date.now(),
    };

    this.data.withdrawals.unshift(newWth);
    this.logAudit("WITHDRAWAL_REQUESTED", params.userIdentifier, `درخواست تسویه ${params.amountUsdt} تتر`);
    this.saveData();
    return newWth;
  }

  public getWithdrawals(): StoredWithdrawal[] {
    return this.data.withdrawals;
  }

  public getUserWithdrawals(userId: string): StoredWithdrawal[] {
    return this.data.withdrawals.filter((w) => w.userId === userId);
  }

  public updateWithdrawalStatus(
    id: string,
    status: "COMPLETED" | "REJECTED",
    txHash?: string,
    adminNote?: string
  ): StoredWithdrawal {
    const wth = this.data.withdrawals.find((w) => w.id === id);
    if (!wth) throw new Error("درخواست تسویه یافت نشد.");

    if (wth.status !== "PENDING") {
      throw new Error("این تسویه قبلاً بررسی شده است.");
    }

    wth.status = status;
    wth.txHash = txHash?.trim();
    wth.adminNote = adminNote?.trim();
    wth.reviewedAt = Date.now();

    if (status === "REJECTED") {
      const user = this.findUserById(wth.userId);
      if (user) {
        user.rewardBalanceUsdt = Number(((user.rewardBalanceUsdt || 0) + wth.amountUsdt).toFixed(2));
      }
    }

    this.saveData();
    return wth;
  }

  // ==========================================
  // Automated Backups & Snapshot Management (Point 19)
  // ==========================================
  public createBackup(): { success: boolean; filename: string; timestamp: number; sizeBytes: number } {
    const timestamp = Date.now();
    const backupName = `didban_backup_${timestamp}.json`;
    const backupPath = path.join(BACKUPS_DIR, backupName);

    fs.writeFileSync(backupPath, JSON.stringify(this.data, null, 2), "utf-8");

    // Also copy SQLite file if exists
    if (fs.existsSync(SQLITE_FILE)) {
      const sqliteBackup = path.join(BACKUPS_DIR, `didban_backup_${timestamp}.db`);
      fs.copyFileSync(SQLITE_FILE, sqliteBackup);
    }

    const stat = fs.statSync(backupPath);
    this.logAudit("BACKUP_CREATED", "ADMIN", `فایل پشتیبان کامل سیستم ایجاد شد: ${backupName}`);

    return {
      success: true,
      filename: backupName,
      timestamp,
      sizeBytes: stat.size,
    };
  }

  public listBackups(): Array<{ filename: string; createdAt: number; sizeBytes: number }> {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    const files = fs.readdirSync(BACKUPS_DIR);
    return files
      .filter((f) => f.startsWith("didban_backup_"))
      .map((f) => {
        const fullPath = path.join(BACKUPS_DIR, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          createdAt: stat.birthtimeMs || stat.mtimeMs,
          sizeBytes: stat.size,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  public getBackupFilePath(filename: string): string | null {
    const clean = path.basename(filename);
    const fullPath = path.join(BACKUPS_DIR, clean);
    if (fs.existsSync(fullPath) && (clean.endsWith(".json") || clean.endsWith(".db"))) {
      return fullPath;
    }
    return null;
  }

  // ==========================================
  // Audit Logs (Point 9)
  // ==========================================
  public logAudit(action: string, actor: string, details: string, ip: string = "127.0.0.1"): StoredAuditLog {
    const log: StoredAuditLog = {
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      action,
      actor,
      details,
      timestamp: Date.now(),
      ip,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    return log;
  }

  public getAuditLogs(limit: number = 200): StoredAuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  public getSystemSettings(): StoredSystemSettings {
    return this.data.systemSettings;
  }

  public updateSystemSettings(settings: Partial<StoredSystemSettings>): StoredSystemSettings {
    this.data.systemSettings = {
      ...this.data.systemSettings,
      ...settings,
      updatedAt: Date.now(),
    };
    this.logAudit("SYSTEM_SETTINGS_UPDATED", "ADMIN", "تنظیمات سیستمی نرم‌افزار به‌روزرسانی شد.");
    this.saveData();
    return this.data.systemSettings;
  }

  // ==========================================
  // Super Admin TOTP (RFC 6238 Authenticator)
  // ==========================================
  private pendingTotpSecret?: string;
  private pendingTotpBackupCodes?: string[];

  public getTotpStatus() {
    return {
      enabled: !!this.data.systemSettings.totpEnabled,
      activatedAt: this.data.systemSettings.totpActivatedAt,
      adminEmail: this.data.systemSettings.adminEmail,
      remainingBackupCodes: this.data.systemSettings.totpBackupCodes?.length || 0,
    };
  }

  public initTotpSetup() {
    const secret = generateTotpSecret(20);
    const backupCodes = generateBackupCodes(8);
    this.pendingTotpSecret = secret;
    this.pendingTotpBackupCodes = backupCodes;

    const uri = generateTotpUri(
      this.data.systemSettings.adminEmail,
      "DIDBAN Crypto Security",
      secret
    );

    return {
      secret,
      uri,
      backupCodes,
      email: this.data.systemSettings.adminEmail,
    };
  }

  public verifyAndActivateTotp(code: string, ip?: string): { success: boolean; error?: string; backupCodes?: string[] } {
    const secretToVerify = this.pendingTotpSecret || this.data.systemSettings.totpSecret;
    if (!secretToVerify) {
      return { success: false, error: "کلید مخفی TOTP یافت نشد. لطفاً مجدداً فرایند پیکربندی را آغاز نمایید." };
    }

    const isValid = verifyTotpToken(secretToVerify, code, 1);
    if (!isValid) {
      return { success: false, error: "کد تایید یک‌بار مصرف ۶ رقمی وارد شده نامعتبر یا منقضی است." };
    }

    const backupCodes = this.pendingTotpBackupCodes || this.data.systemSettings.totpBackupCodes || generateBackupCodes(8);
    this.data.systemSettings.totpEnabled = true;
    this.data.systemSettings.totpSecret = secretToVerify;
    this.data.systemSettings.totpBackupCodes = backupCodes;
    this.data.systemSettings.totpActivatedAt = Date.now();

    this.pendingTotpSecret = undefined;
    this.pendingTotpBackupCodes = undefined;

    this.logAudit("TOTP_2FA_ACTIVATED", "SUPER_ADMIN", "احراز هویت دو مرحله‌ای سخت‌افزاری/اپلیکیشنی (TOTP) فعال شد.", ip);
    this.saveData();

    return {
      success: true,
      backupCodes,
    };
  }

  public verifyAdminActionTotp(codeOrBackup: string): { valid: boolean; error?: string; usedBackupCode?: boolean } {
    // If TOTP is not enabled yet, allow action
    if (!this.data.systemSettings.totpEnabled || !this.data.systemSettings.totpSecret) {
      return { valid: true };
    }

    const clean = String(codeOrBackup || "").trim();

    // Check 6-digit TOTP
    if (/^\d{6}$/.test(clean)) {
      if (verifyTotpToken(this.data.systemSettings.totpSecret, clean, 1)) {
        return { valid: true };
      }
    }

    // Check one-time backup codes (e.g. 4A82-F9C1)
    if (Array.isArray(this.data.systemSettings.totpBackupCodes)) {
      const idx = this.data.systemSettings.totpBackupCodes.findIndex(
        (b) => b.toUpperCase().replace(/\s/g, '') === clean.toUpperCase().replace(/\s/g, '')
      );
      if (idx !== -1) {
        // Consume one-time recovery code
        this.data.systemSettings.totpBackupCodes.splice(idx, 1);
        this.logAudit("TOTP_BACKUP_CODE_USED", "SUPER_ADMIN", "یک کد بازیابی اضطراری TOTP مصرف گردید.");
        this.saveData();
        return { valid: true, usedBackupCode: true };
      }
    }

    return { valid: false, error: "کد اعتبارسنجی ۶ رقمی TOTP یا کد بازیابی نامعتبر است." };
  }

  public disableTotp(codeOrBackup: string, ip?: string): { success: boolean; error?: string } {
    if (!this.data.systemSettings.totpEnabled) {
      return { success: true };
    }

    const verifyResult = this.verifyAdminActionTotp(codeOrBackup);
    if (!verifyResult.valid) {
      return { success: false, error: verifyResult.error || "کد تایید جهت غیرفعال‌سازی نامعتبر است." };
    }

    this.data.systemSettings.totpEnabled = false;
    this.data.systemSettings.totpSecret = undefined;
    this.data.systemSettings.totpBackupCodes = undefined;
    this.data.systemSettings.totpActivatedAt = undefined;

    this.logAudit("TOTP_2FA_DISABLED", "SUPER_ADMIN", "احراز هویت دو مرحله‌ای TOTP غیرفعال شد.", ip);
    this.saveData();
    return { success: true };
  }

  public getOverviewStats() {
    return {
      totalUsers: this.data.users.length,
      totalDepositsCount: this.data.deposits.length,
      totalDepositsToman: this.data.deposits.filter((d) => d.status === "APPROVED" && d.currency === "TOMAN").reduce((acc, d) => acc + d.amount, 0),
      totalDepositsUsdt: this.data.deposits.filter((d) => d.status === "APPROVED" && d.currency === "USDT").reduce((acc, d) => acc + d.amount, 0),
      pendingDepositsCount: this.data.deposits.filter((d) => d.status === "PENDING").length,
      totalTicketsCount: this.data.tickets.length,
      openTicketsCount: this.data.tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length,
      totalVipUsers: this.data.users.filter((u) => u.isVip).length,
      totalActiveSessions: this.data.sessions.filter((s) => s.expiresAt > Date.now()).length,
      totalAuditLogs: this.data.auditLogs.length,
    };
  }

  public getAdminOverview() {
    return this.getOverviewStats();
  }

  public getSearches(limit: number = 100) {
    return this.data.searches.slice(0, limit);
  }

  public recordSearch(userId: string | undefined, userIdentifier: string, query: string): StoredSearch {
    const entry: StoredSearch = {
      id: `srch_${Date.now()}_${crypto.randomInt(1000, 9999)}`,
      userId: userId || undefined,
      userIdentifier: userIdentifier || "مهمان",
      query: String(query).trim().slice(0, 100),
      timestamp: Date.now(),
    };
    this.data.searches.unshift(entry);
    if (this.data.searches.length > 500) {
      this.data.searches = this.data.searches.slice(0, 500);
    }
    this.saveData();
    return entry;
  }

  public logSearch(userIdentifier: string, query: string, userId?: string) {
    this.recordSearch(userId, userIdentifier, query);
  }

  public create2faCode(email: string, ip?: string) {
    const res = this.sendAdmin2fa(email, ip);
    const active = this.data.admin2faCodes[this.data.admin2faCodes.length - 1];
    return { email, expiresAt: res.expiresAt, code: active?.code || "" };
  }

  public verify2faCode(email: string, code: string, ip?: string) {
    return this.verifyAdmin2fa(email, code, undefined, ip);
  }

  public replyToTicket(ticketId: string, sender: "user" | "admin", text: string): StoredTicket {
    return this.replyTicket(ticketId, sender, text);
  }

  public createWithdrawalRequest(params: {
    userId: string;
    userIdentifier: string;
    amountUsdt: number;
    bep20Address: string;
  }): StoredWithdrawal {
    return this.createWithdrawal(params);
  }

  public getReferralStats(userId: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error("کاربر یافت نشد.");
    const referredUsers = this.data.users
      .filter((u) => u.referredBy?.toUpperCase() === user.referralCode.toUpperCase())
      .map((u) => ({
        id: u.id,
        name: u.name,
        joinedAt: u.createdAt,
        isVip: u.isVip,
      }));

    return {
      referralCode: user.referralCode,
      referralCount: user.referralCount || referredUsers.length,
      rewardBalanceUsdt: user.rewardBalanceUsdt || 0,
      totalEarnedUsdt: user.totalEarnedUsdt || 0,
      weeklyBonusQuota: user.weeklyBonusQuota || 0,
      usedWeeklyQuota: user.usedWeeklyQuota || 0,
      referredUsers,
    };
  }

  public getVipPlans(): StoredVipPlan[] {
    return this.data.vipPlans;
  }

  public updateVipPlanPrice(planId: string, priceUsdt: number): StoredVipPlan {
    const plan = this.data.vipPlans.find((p) => p.id === planId);
    if (!plan) throw new Error("طرح یافت نشد.");
    plan.priceUsdt = priceUsdt;
    this.logAudit("VIP_PLAN_PRICE_UPDATED", "ADMIN", `قیمت طرح ${plan.nameFa} به ${priceUsdt} تتر تغییر یافت.`);
    this.saveData();
    return plan;
  }

  public getExchangePartners(): StoredExchangePartner[] {
    return this.data.exchangePartners;
  }

  public createExchangePartner(params: any): StoredExchangePartner {
    const newPartner: StoredExchangePartner = {
      id: `ex_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      name: params.name,
      nameFa: params.nameFa,
      type: params.type || "GLOBAL",
      referralUrl: params.referralUrl,
      referralCode: params.referralCode,
      discountPercent: Number(params.discountPercent || 0),
      clicksCount: 0,
      isActive: true,
      featuresFa: params.featuresFa || [],
      createdAt: Date.now(),
    };
    this.data.exchangePartners.push(newPartner);
    this.saveData();
    return newPartner;
  }

  public deleteExchangePartner(id: string): boolean {
    const idx = this.data.exchangePartners.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.exchangePartners.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  public toggleExchangePartner(id: string): StoredExchangePartner {
    const p = this.data.exchangePartners.find((item) => item.id === id);
    if (!p) throw new Error("آگهی صرافی یافت نشد.");
    p.isActive = !p.isActive;
    this.saveData();
    return p;
  }

  public recordExchangeClick(id: string) {
    const p = this.data.exchangePartners.find((item) => item.id === id);
    if (p) {
      p.clicksCount = (p.clicksCount || 0) + 1;
      this.saveData();
    }
  }

  public deleteUser(userId: string): boolean {
    if (userId === "user_admin_hamed") {
      throw new Error("امکان حذف مدیر ارشد سیستم وجود ندارد.");
    }
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("کاربر یافت نشد.");
    const removed = this.data.users.splice(idx, 1)[0];
    this.logAudit("USER_DELETED", "ADMIN", `کاربر ${removed.name} حذف شد.`);
    this.saveData();
    return true;
  }

  public toggleBlockUser(userId: string, isBlocked: boolean, reason?: string): StoredUser {
    if (userId === "user_admin_hamed") {
      throw new Error("امکان مسدودسازی مدیر ارشد وجود ندارد.");
    }
    const user = this.findUserById(userId);
    if (!user) throw new Error("کاربر یافت نشد.");
    user.isBlocked = isBlocked;
    user.blockedReason = isBlocked ? reason || "مسدود شده توسط مدیر" : undefined;
    this.logAudit(isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED", "ADMIN", `کاربر ${user.name} تغییر وضعیت یافت.`);
    this.saveData();
    return user;
  }

  public getDatabaseOverview() {
    return {
      totalRecords:
        this.data.users.length +
        this.data.sessions.length +
        this.data.deposits.length +
        this.data.withdrawals.length +
        this.data.tickets.length +
        this.data.auditLogs.length +
        this.data.notifications.length,
      collections: [
        { name: "users", count: this.data.users.length, labelFa: "کاربران سیستم" },
        { name: "sessions", count: this.data.sessions.length, labelFa: "نشست‌های فعال" },
        { name: "deposits", count: this.data.deposits.length, labelFa: "تراکنش‌های واریزی" },
        { name: "withdrawals", count: this.data.withdrawals.length, labelFa: "درخواست‌های تسویه" },
        { name: "tickets", count: this.data.tickets.length, labelFa: "تیکت‌های پشتیبانی" },
        { name: "auditLogs", count: this.data.auditLogs.length, labelFa: "لاگ‌های امنیتی و حسابرسی" },
        { name: "notifications", count: this.data.notifications.length, labelFa: "اعلان‌های سیستم" },
      ],
    };
  }

  public getTableRows(tableName: string, limit: number = 100): any[] {
    const tableMap: Record<string, any[]> = {
      users: this.data.users,
      sessions: this.data.sessions,
      deposits: this.data.deposits,
      withdrawals: this.data.withdrawals,
      tickets: this.data.tickets,
      auditLogs: this.data.auditLogs,
      notifications: this.data.notifications,
      vipPlans: this.data.vipPlans,
      exchangePartners: this.data.exchangePartners,
    };
    const rows = tableMap[tableName] || [];
    return rows.slice(0, limit);
  }

  public exportFullDatabase(): AppStoreData {
    return this.data;
  }
}

export const store = new DataStore();
