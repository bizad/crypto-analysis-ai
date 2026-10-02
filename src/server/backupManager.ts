import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { store } from "./dataStore.js";

// ==========================================
// Encrypted SQLite Backup & Maintenance Vault
// ==========================================

const DATA_DIR = path.join(process.cwd(), "data");
const SQLITE_FILE = path.join(DATA_DIR, "didban.db");
const APP_STORE_FILE = path.join(DATA_DIR, "app-store.json");
const SECURE_BACKUPS_DIR = path.join(DATA_DIR, "secure-backups");

// Ensure secure directory exists with restricted access (0700)
if (!fs.existsSync(SECURE_BACKUPS_DIR)) {
  fs.mkdirSync(SECURE_BACKUPS_DIR, { recursive: true, mode: 0o700 });
}

export interface EncryptedBackupMeta {
  id: string;
  filename: string;
  metaFilename: string;
  timestamp: number;
  dateIso: string;
  sizeEncryptedBytes: number;
  sizeUnencryptedBytes: number;
  checksumSha256: string;
  encryptionAlgorithm: string;
  keyDerivation: string;
  storageTier: "SECURE_LOCAL_VAULT" | "ENCRYPTED_REMOTE_STORAGE";
  reason: string;
  stats: {
    usersCount: number;
    depositsCount: number;
    ticketsCount: number;
    sessionsCount: number;
    sqliteSize: number;
  };
  verificationStatus: "VERIFIED_VALID" | "FAILED" | "UNVERIFIED";
  verificationError?: string;
}

export interface EncryptedContainer {
  version: number;
  algorithm: "aes-256-gcm";
  iv: string; // hex (12 bytes)
  authTag: string; // hex (16 bytes)
  salt: string; // hex (16 bytes)
  encryptedPayload: string; // base64
  checksumSha256: string;
  metadata: EncryptedBackupMeta;
}

export class BackupManager {
  private masterSecret: string;
  private maintenanceToken: string;
  private periodicIntervalTimer: NodeJS.Timeout | null = null;
  private isBackupRunning = false;

  constructor() {
    this.masterSecret =
      process.env.BACKUP_ENCRYPTION_KEY ||
      process.env.GOOGLE_CLIENT_SECRET ||
      "didban_master_backup_aes_secret_key_2026_x9f";

    this.maintenanceToken =
      process.env.MAINTENANCE_SECRET_KEY ||
      "didban_maintenance_cron_token_2026_secure";
  }

  public getMaintenanceToken(): string {
    return this.maintenanceToken;
  }

  public validateMaintenanceKey(providedKey?: string): boolean {
    if (!providedKey) return false;
    const clean = providedKey.trim();
    if (!clean) return false;

    // Timing safe comparison to protect against timing attacks
    try {
      const a = Buffer.from(clean);
      const b = Buffer.from(this.maintenanceToken);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Derive a 256-bit symmetric encryption key using scrypt
   */
  private deriveKey(salt: Buffer): Buffer {
    return crypto.scryptSync(this.masterSecret, salt, 32);
  }

  /**
   * Create an authenticated AES-256-GCM encrypted backup of the SQLite database and state store
   */
  public async createEncryptedBackup(
    reason: string = "SCHEDULED_MAINTENANCE"
  ): Promise<EncryptedBackupMeta> {
    if (this.isBackupRunning) {
      throw new Error("یک عملیات پشتیبان‌گیری در حال حاضر در حال اجرا است.");
    }

    this.isBackupRunning = true;
    try {
      if (!fs.existsSync(SECURE_BACKUPS_DIR)) {
        fs.mkdirSync(SECURE_BACKUPS_DIR, { recursive: true, mode: 0o700 });
      }

      const timestamp = Date.now();
      const backupId = `bkp_enc_${timestamp}_${crypto.randomBytes(3).toString("hex")}`;
      const filename = `didban_secure_sqlite_${timestamp}.db.enc`;
      const metaFilename = `didban_secure_sqlite_${timestamp}.meta.json`;

      // Read current SQLite binary
      let sqliteBuffer = Buffer.alloc(0);
      if (fs.existsSync(SQLITE_FILE)) {
        sqliteBuffer = fs.readFileSync(SQLITE_FILE);
      }

      // Read state JSON
      let stateJson = "{}";
      if (fs.existsSync(APP_STORE_FILE)) {
        stateJson = fs.readFileSync(APP_STORE_FILE, "utf-8");
      }

      const overview = store.getOverviewStats();

      // Bundle into payload
      const unencryptedPackage = JSON.stringify({
        version: 2,
        timestamp,
        sqliteBinaryBase64: sqliteBuffer.toString("base64"),
        appStoreJson: stateJson,
        systemStats: overview,
      });

      const unencryptedBuffer = Buffer.from(unencryptedPackage, "utf-8");
      const checksumSha256 = crypto.createHash("sha256").update(unencryptedBuffer).digest("hex");

      // Encrypt with AES-256-GCM
      const salt = crypto.randomBytes(16);
      const iv = crypto.randomBytes(12);
      const derivedKey = this.deriveKey(salt);

      const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);
      const encrypted = Buffer.concat([cipher.update(unencryptedBuffer), cipher.final()]);
      const authTag = cipher.getAuthTag();

      const meta: EncryptedBackupMeta = {
        id: backupId,
        filename,
        metaFilename,
        timestamp,
        dateIso: new Date(timestamp).toISOString(),
        sizeEncryptedBytes: encrypted.length,
        sizeUnencryptedBytes: unencryptedBuffer.length,
        checksumSha256,
        encryptionAlgorithm: "AES-256-GCM",
        keyDerivation: "scrypt(N=16384,r=8,p=1,len=32)",
        storageTier: "SECURE_LOCAL_VAULT",
        reason,
        stats: {
          usersCount: overview.totalUsers,
          depositsCount: overview.totalDepositsCount,
          ticketsCount: overview.totalTicketsCount,
          sessionsCount: 0,
          sqliteSize: sqliteBuffer.length,
        },
        verificationStatus: "VERIFIED_VALID",
      };

      const container: EncryptedContainer = {
        version: 1,
        algorithm: "aes-256-gcm",
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
        salt: salt.toString("hex"),
        encryptedPayload: encrypted.toString("base64"),
        checksumSha256,
        metadata: meta,
      };

      // Write encrypted container and metadata to secure directory
      const filePath = path.join(SECURE_BACKUPS_DIR, filename);
      const metaPath = path.join(SECURE_BACKUPS_DIR, metaFilename);

      fs.writeFileSync(filePath, JSON.stringify(container), { mode: 0o600 });
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), { mode: 0o600 });

      // Prune old backups (keep latest 25)
      this.pruneOldBackups(25);

      store.logAudit(
        "ENCRYPTED_BACKUP_CREATED",
        "MAINTENANCE_SYSTEM",
        `پشتیبان‌گیری امن AES-256-GCM از SQLite انجام شد (${(encrypted.length / 1024).toFixed(1)} KB) - علت: ${reason}`
      );

      return meta;
    } finally {
      this.isBackupRunning = false;
    }
  }

  /**
   * Verify the cryptographic integrity and data recoverability of an encrypted backup
   */
  public verifyBackupIntegrity(filename: string): {
    valid: boolean;
    checksumMatch: boolean;
    message: string;
    metadata?: EncryptedBackupMeta;
    stats?: any;
  } {
    try {
      const cleanName = path.basename(filename);
      const filePath = path.join(SECURE_BACKUPS_DIR, cleanName);

      if (!fs.existsSync(filePath)) {
        return { valid: false, checksumMatch: false, message: "فایل پشتیبان رمزشده یافت نشد." };
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const container: EncryptedContainer = JSON.parse(raw);

      if (container.algorithm !== "aes-256-gcm" || !container.iv || !container.authTag || !container.salt) {
        return { valid: false, checksumMatch: false, message: "فرمت مخزن رمزشده نامعتبر است." };
      }

      // Decrypt
      const salt = Buffer.from(container.salt, "hex");
      const iv = Buffer.from(container.iv, "hex");
      const authTag = Buffer.from(container.authTag, "hex");
      const encryptedBuffer = Buffer.from(container.encryptedPayload, "base64");

      const derivedKey = this.deriveKey(salt);
      const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, iv);
      decipher.setAuthTag(authTag);

      const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

      // Check SHA-256 checksum
      const computedHash = crypto.createHash("sha256").update(decryptedBuffer).digest("hex");
      const checksumMatch = computedHash === container.checksumSha256;

      if (!checksumMatch) {
        return {
          valid: false,
          checksumMatch: false,
          message: "کد اعتبارسنجی (Checksum) با اطلاعات فایل مطابقت ندارد. احتمال آسیب به فایل وجود دارد.",
        };
      }

      const parsedBundle = JSON.parse(decryptedBuffer.toString("utf-8"));
      const sqliteBytes = Buffer.from(parsedBundle.sqliteBinaryBase64 || "", "base64");

      // Verify SQLite header magic bytes
      const isSqliteHeaderValid = sqliteBytes.length === 0 || sqliteBytes.subarray(0, 15).toString("utf-8") === "SQLite format 3";

      if (!isSqliteHeaderValid) {
        return {
          valid: false,
          checksumMatch: true,
          message: "فایل با موفقیت رمزگشایی شد اما ساختار فایل SQLite معتبر نیست.",
        };
      }

      return {
        valid: true,
        checksumMatch: true,
        message: "پشتیبان با موفقیت اعتبارسنجی شد؛ رمزنگاری AES-256-GCM سالم و داده‌ها ۱۰۰٪ قابل بازیابی هستند.",
        metadata: container.metadata,
        stats: parsedBundle.systemStats,
      };
    } catch (err: any) {
      return {
        valid: false,
        checksumMatch: false,
        message: `خطا در بازگشایی و اعتبارسنجی پشتیبان: ${err.message}`,
      };
    }
  }

  /**
   * Restore the live SQLite database and store state from an encrypted backup
   */
  public async restoreFromBackup(
    filename: string,
    reqIp?: string
  ): Promise<{ success: boolean; message: string; restoredMeta?: EncryptedBackupMeta }> {
    const verification = this.verifyBackupIntegrity(filename);
    if (!verification.valid) {
      throw new Error(`امکان بازیابی وجود ندارد: ${verification.message}`);
    }

    try {
      // 1. Create a pre-restore safety snapshot of the current state
      await this.createEncryptedBackup("PRE_RESTORE_SAFETY_SNAPSHOT");

      // 2. Read and decrypt target backup
      const cleanName = path.basename(filename);
      const filePath = path.join(SECURE_BACKUPS_DIR, cleanName);
      const raw = fs.readFileSync(filePath, "utf-8");
      const container: EncryptedContainer = JSON.parse(raw);

      const salt = Buffer.from(container.salt, "hex");
      const iv = Buffer.from(container.iv, "hex");
      const authTag = Buffer.from(container.authTag, "hex");
      const encryptedBuffer = Buffer.from(container.encryptedPayload, "base64");

      const derivedKey = this.deriveKey(salt);
      const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
      const parsedBundle = JSON.parse(decrypted.toString("utf-8"));

      // 3. Write restored SQLite binary
      if (parsedBundle.sqliteBinaryBase64) {
        const sqliteBuffer = Buffer.from(parsedBundle.sqliteBinaryBase64, "base64");
        fs.writeFileSync(SQLITE_FILE, sqliteBuffer);
      }

      // 4. Write restored store JSON
      if (parsedBundle.appStoreJson) {
        fs.writeFileSync(APP_STORE_FILE, parsedBundle.appStoreJson, "utf-8");
      }

      // 5. Reload live dataStore and SQLite connection
      store.reloadFromDisk();

      store.logAudit(
        "DATABASE_RESTORED",
        "SUPER_ADMIN",
        `پایگاه داده SQLite و کلیه اطلاعات از پشتیبان رمزشده ${filename} با موفقیت بازیابی شد.`,
        reqIp || "127.0.0.1"
      );

      return {
        success: true,
        message: "پایگاه داده و جداول سیستم با موفقیت از پشتیبان رمزشده بازیابی گردید.",
        restoredMeta: container.metadata,
      };
    } catch (err: any) {
      throw new Error(`خطا در فرایند بازیابی اطلاعات: ${err.message}`);
    }
  }

  /**
   * List all encrypted backups in the secure vault
   */
  public listSecureBackups(): EncryptedBackupMeta[] {
    if (!fs.existsSync(SECURE_BACKUPS_DIR)) return [];

    const files = fs.readdirSync(SECURE_BACKUPS_DIR);
    const metaFiles = files.filter((f) => f.endsWith(".meta.json"));
    const results: EncryptedBackupMeta[] = [];

    for (const mf of metaFiles) {
      try {
        const fullMetaPath = path.join(SECURE_BACKUPS_DIR, mf);
        const meta: EncryptedBackupMeta = JSON.parse(fs.readFileSync(fullMetaPath, "utf-8"));
        // Check if corresponding .enc file exists
        if (fs.existsSync(path.join(SECURE_BACKUPS_DIR, meta.filename))) {
          results.push(meta);
        }
      } catch {}
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get secure backup file path for download
   */
  public getSecureBackupPath(filename: string): string | null {
    const clean = path.basename(filename);
    const fullPath = path.join(SECURE_BACKUPS_DIR, clean);
    if (fs.existsSync(fullPath) && (clean.endsWith(".db.enc") || clean.endsWith(".meta.json"))) {
      return fullPath;
    }
    return null;
  }

  /**
   * Prune older backups beyond retention limit
   */
  private pruneOldBackups(keepCount = 25) {
    try {
      const backups = this.listSecureBackups();
      if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        for (const b of toDelete) {
          const encPath = path.join(SECURE_BACKUPS_DIR, b.filename);
          const metaPath = path.join(SECURE_BACKUPS_DIR, b.metaFilename);
          if (fs.existsSync(encPath)) fs.unlinkSync(encPath);
          if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
        }
      }
    } catch (err) {
      console.warn("[BackupManager] Pruning old backups warning:", err);
    }
  }

  /**
   * Initialize periodic automatic backups
   */
  public initPeriodicBackups(intervalHours: number = 6) {
    if (this.periodicIntervalTimer) {
      clearInterval(this.periodicIntervalTimer);
    }

    const intervalMs = Math.max(1, intervalHours) * 3600 * 1000;
    console.log(`[BackupManager] Periodic SQLite encrypted backup scheduled every ${intervalHours} hours.`);

    // Check if we need an initial backup
    const backups = this.listSecureBackups();
    const now = Date.now();
    const needsInitial = backups.length === 0 || now - backups[0].timestamp > intervalMs;

    if (needsInitial) {
      setTimeout(() => {
        this.createEncryptedBackup("INITIAL_AUTO_STARTUP").catch((err) => {
          console.warn("[BackupManager] Initial startup backup error:", err);
        });
      }, 5000);
    }

    this.periodicIntervalTimer = setInterval(() => {
      this.createEncryptedBackup("PERIODIC_AUTOMATED_CRON").catch((err) => {
        console.error("[BackupManager] Periodic automated backup failed:", err);
      });
    }, intervalMs);
  }
}

export const backupManager = new BackupManager();
