import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('lunaria.db');

    // Create tables
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT,
      birth_date TEXT,
      cycle_type TEXT,
      average_cycle_length INTEGER,
      cycle_range_min INTEGER,
      cycle_range_max INTEGER,
      period_length INTEGER,
      has_pcos INTEGER DEFAULT 0,
      pcos_symptoms TEXT,
      pcos_treatment TEXT,
      contraceptive_method TEXT,
      wants_pregnancy INTEGER,
      synced INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      symptoms TEXT,
      flow TEXT,
      mood TEXT,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    );
    
    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      synced INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS sync_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_sync_queue ON sync_queue(table_name, record_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_cycles_user ON cycles(user_id);
  `);

    // Initialize sync settings with default value (daily)
    await db.runAsync(
        `INSERT OR IGNORE INTO sync_settings (key, value) VALUES ('sync_frequency', 'daily')`
    );

    return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!db) {
        return await initDatabase();
    }
    return db;
}

