import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { seedDatabaseIfEmpty } from './db-seed.js';

const require = createRequire(import.meta.url);

// Dual-engine relational database adapter:
// 1. PostgreSQL (production via DATABASE_URL / POSTGRES_URL)
// 2. Local persistent SQLite file (data/arogyasetu.db via node:sqlite)

let pgPool = null;
let sqliteDb = null;
let isInitialized = false;

const isPostgres = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

function getSqliteInstance() {
  if (sqliteDb) return sqliteDb;
  const { DatabaseSync } = require('node:sqlite');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'arogyasetu.db');
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  return sqliteDb;
}

function getPgPool() {
  if (pgPool) return pgPool;
  const { Pool } = require('pg');
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  pgPool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  return pgPool;
}

/**
 * Raw query execution helper (bypasses ensureInitialized recursion).
 */
async function rawQuery(sql, params = []) {
  if (isPostgres) {
    const pool = getPgPool();
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await pool.query(pgSql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
    };
  } else {
    const db = getSqliteInstance();
    const cleanSql = sql.trim();
    const isSelect = cleanSql.toUpperCase().startsWith('SELECT') || cleanSql.toUpperCase().startsWith('PRAGMA');
    
    if (isSelect) {
      const stmt = db.prepare(cleanSql);
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    } else {
      const stmt = db.prepare(cleanSql);
      const result = stmt.run(...params);
      return {
        rows: [],
        rowCount: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    }
  }
}

async function rawQueryOne(sql, params = []) {
  const result = await rawQuery(sql, params);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Executes a parameterized SQL query across PostgreSQL or SQLite.
 * Translates ? placeholders to $1, $2 for Postgres automatically.
 */
export async function query(sql, params = []) {
  await ensureInitialized();
  return rawQuery(sql, params);
}

export async function queryOne(sql, params = []) {
  await ensureInitialized();
  return rawQueryOne(sql, params);
}

export async function execute(sql, params = []) {
  return query(sql, params);
}

/**
 * Initializes tables and initial schema.
 */
export async function ensureInitialized() {
  if (isInitialized) return;

  if (isPostgres) {
    const pool = getPgPool();
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email_or_username VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(32),
          password_hash VARCHAR(255),
          role VARCHAR(64) NOT NULL,
          status VARCHAR(32) DEFAULT 'active',
          phc VARCHAR(255),
          area VARCHAR(255),
          patient_id VARCHAR(64),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS patients (
          id VARCHAR(64) PRIMARY KEY,
          patient_id VARCHAR(64) UNIQUE NOT NULL,
          health_ticket_id VARCHAR(64),
          name VARCHAR(255) NOT NULL,
          date_of_birth VARCHAR(32),
          age INT NOT NULL,
          gender VARCHAR(32) NOT NULL,
          phone VARCHAR(32) NOT NULL,
          address TEXT,
          village VARCHAR(255) NOT NULL,
          locality VARCHAR(255),
          district VARCHAR(255) DEFAULT 'District HQ',
          state VARCHAR(255) DEFAULT 'State',
          emergency_contact VARCHAR(255),
          blood_group VARCHAR(16),
          is_pregnant BOOLEAN DEFAULT FALSE,
          pregnancy_week INT,
          edd VARCHAR(64),
          conditions TEXT,
          allergies TEXT,
          abha_id VARCHAR(64),
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS asha_workers (
          id VARCHAR(64) PRIMARY KEY,
          worker_id VARCHAR(64) UNIQUE NOT NULL,
          user_id VARCHAR(64),
          name VARCHAR(255) NOT NULL,
          village VARCHAR(255),
          locality VARCHAR(255),
          phc VARCHAR(255),
          block VARCHAR(255),
          district VARCHAR(255),
          contact VARCHAR(32),
          status VARCHAR(32) DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS patient_vitals (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64) NOT NULL,
          recorded_by VARCHAR(255),
          blood_pressure VARCHAR(32),
          pulse INT,
          temperature DECIMAL(4,1),
          weight DECIMAL(5,1),
          spo2 INT,
          blood_sugar INT,
          hemoglobin DECIMAL(4,1),
          recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS patient_problems (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64) NOT NULL,
          description TEXT NOT NULL,
          structured_info TEXT,
          source VARCHAR(64) DEFAULT 'asha_intake',
          recorded_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS medications (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64) NOT NULL,
          medicine_name VARCHAR(255) NOT NULL,
          dose VARCHAR(128),
          frequency VARCHAR(128),
          duration VARCHAR(128),
          start_date VARCHAR(64),
          end_date VARCHAR(64),
          prescribing_doctor VARCHAR(255),
          status VARCHAR(32) DEFAULT 'CURRENT',
          source VARCHAR(64) DEFAULT 'doctor_prescription',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
          id VARCHAR(64) PRIMARY KEY,
          prescription_id VARCHAR(64) UNIQUE NOT NULL,
          patient_id VARCHAR(64) NOT NULL,
          doctor_id VARCHAR(64),
          doctor_name VARCHAR(255),
          prescription_date VARCHAR(64),
          prescription_status VARCHAR(32) DEFAULT 'authorized',
          notes TEXT,
          telugu_instructions TEXT,
          hindi_instructions TEXT,
          english_instructions TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS prescription_items (
          id SERIAL PRIMARY KEY,
          prescription_id VARCHAR(64) NOT NULL,
          medicine_name VARCHAR(255) NOT NULL,
          dose VARCHAR(128),
          frequency VARCHAR(128),
          duration VARCHAR(128)
        );

        CREATE TABLE IF NOT EXISTS hospital_visits (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64) NOT NULL,
          facility_id VARCHAR(64),
          facility_name VARCHAR(255),
          visit_date VARCHAR(64) NOT NULL,
          visit_type VARCHAR(64) DEFAULT 'Regular',
          reason TEXT,
          doctor VARCHAR(255),
          assessment TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS referrals (
          id VARCHAR(64) PRIMARY KEY,
          referral_id VARCHAR(64) UNIQUE NOT NULL,
          patient_id VARCHAR(64) NOT NULL,
          patient_name VARCHAR(255) NOT NULL,
          health_ticket_id VARCHAR(64),
          referred_by VARCHAR(255),
          referred_to VARCHAR(255),
          reason TEXT NOT NULL,
          priority VARCHAR(32) DEFAULT 'medium',
          status VARCHAR(32) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS followups (
          id VARCHAR(64) PRIMARY KEY,
          followup_id VARCHAR(64) UNIQUE NOT NULL,
          patient_id VARCHAR(64) NOT NULL,
          patient_name VARCHAR(255) NOT NULL,
          referral_id VARCHAR(64),
          assigned_to VARCHAR(255),
          reason TEXT NOT NULL,
          followup_date VARCHAR(64) NOT NULL,
          followup_type VARCHAR(64) DEFAULT 'Follow-up',
          status VARCHAR(32) DEFAULT 'upcoming',
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS health_tickets (
          id VARCHAR(64) PRIMARY KEY,
          ticket_number VARCHAR(64) UNIQUE NOT NULL,
          patient_id VARCHAR(64) NOT NULL,
          patient_name VARCHAR(255) NOT NULL,
          concern TEXT NOT NULL,
          symptoms TEXT,
          vitals_json TEXT,
          timeline_json TEXT,
          transcript TEXT,
          translated_transcript TEXT,
          detected_language VARCHAR(32),
          priority VARCHAR(32) DEFAULT 'medium',
          status VARCHAR(64) DEFAULT 'registered',
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS voice_records (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64),
          health_ticket_id VARCHAR(64),
          audio_reference VARCHAR(255),
          detected_language VARCHAR(32),
          transcript TEXT NOT NULL,
          translated_text TEXT,
          ai_summary TEXT,
          urgency VARCHAR(32) DEFAULT 'routine',
          created_by VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS alerts (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(64),
          type VARCHAR(64),
          priority VARCHAR(32),
          reason TEXT,
          status VARCHAR(32) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(64),
          user_role VARCHAR(64),
          action VARCHAR(128) NOT NULL,
          entity VARCHAR(128) NOT NULL,
          entity_id VARCHAR(128),
          details TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
        CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(village);
        CREATE INDEX IF NOT EXISTS idx_vitals_patient ON patient_vitals(patient_id);
        CREATE INDEX IF NOT EXISTS idx_meds_patient ON medications(patient_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_patient ON health_tickets(patient_id);
        CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
        CREATE INDEX IF NOT EXISTS idx_followups_patient ON followups(patient_id);
      `);
    } finally {
      client.release();
    }
  } else {
    const db = getSqliteInstance();
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email_or_username TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        phc TEXT,
        area TEXT,
        patient_id TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        patient_id TEXT UNIQUE NOT NULL,
        health_ticket_id TEXT,
        name TEXT NOT NULL,
        date_of_birth TEXT,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        village TEXT NOT NULL,
        locality TEXT,
        district TEXT DEFAULT 'District HQ',
        state TEXT DEFAULT 'State',
        emergency_contact TEXT,
        blood_group TEXT,
        is_pregnant INTEGER DEFAULT 0,
        pregnancy_week INTEGER,
        edd TEXT,
        conditions TEXT,
        allergies TEXT,
        abha_id TEXT,
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS asha_workers (
        id TEXT PRIMARY KEY,
        worker_id TEXT UNIQUE NOT NULL,
        user_id TEXT,
        name TEXT NOT NULL,
        village TEXT,
        locality TEXT,
        phc TEXT,
        block TEXT,
        district TEXT,
        contact TEXT,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS patient_vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        recorded_by TEXT,
        blood_pressure TEXT,
        pulse INTEGER,
        temperature REAL,
        weight REAL,
        spo2 INTEGER,
        blood_sugar INTEGER,
        hemoglobin REAL,
        recorded_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS patient_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        description TEXT NOT NULL,
        structured_info TEXT,
        source TEXT DEFAULT 'asha_intake',
        recorded_by TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dose TEXT,
        frequency TEXT,
        duration TEXT,
        start_date TEXT,
        end_date TEXT,
        prescribing_doctor TEXT,
        status TEXT DEFAULT 'CURRENT',
        source TEXT DEFAULT 'doctor_prescription',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        prescription_id TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_id TEXT,
        doctor_name TEXT,
        prescription_date TEXT,
        prescription_status TEXT DEFAULT 'authorized',
        notes TEXT,
        telugu_instructions TEXT,
        hindi_instructions TEXT,
        english_instructions TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS prescription_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prescription_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dose TEXT,
        frequency TEXT,
        duration TEXT
      );

      CREATE TABLE IF NOT EXISTS hospital_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        facility_id TEXT,
        facility_name TEXT,
        visit_date TEXT NOT NULL,
        visit_type TEXT DEFAULT 'Regular',
        reason TEXT,
        doctor TEXT,
        assessment TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        referral_id TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        health_ticket_id TEXT,
        referred_by TEXT,
        referred_to TEXT,
        reason TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS followups (
        id TEXT PRIMARY KEY,
        followup_id TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        referral_id TEXT,
        assigned_to TEXT,
        reason TEXT NOT NULL,
        followup_date TEXT NOT NULL,
        followup_type TEXT DEFAULT 'Follow-up',
        status TEXT DEFAULT 'upcoming',
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS health_tickets (
        id TEXT PRIMARY KEY,
        ticket_number TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        concern TEXT NOT NULL,
        symptoms TEXT,
        vitals_json TEXT,
        timeline_json TEXT,
        transcript TEXT,
        translated_transcript TEXT,
        detected_language TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'registered',
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS voice_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT,
        health_ticket_id TEXT,
        audio_reference TEXT,
        detected_language TEXT,
        transcript TEXT NOT NULL,
        translated_text TEXT,
        ai_summary TEXT,
        urgency TEXT DEFAULT 'routine',
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT,
        type TEXT,
        priority TEXT,
        reason TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        user_role TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
      CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(village);
      CREATE INDEX IF NOT EXISTS idx_vitals_patient ON patient_vitals(patient_id);
      CREATE INDEX IF NOT EXISTS idx_meds_patient ON medications(patient_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_patient ON health_tickets(patient_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
      CREATE INDEX IF NOT EXISTS idx_followups_patient ON followups(patient_id);
    `);
  }

  isInitialized = true;
  await seedDatabaseIfEmpty(rawQuery, rawQueryOne);
}
