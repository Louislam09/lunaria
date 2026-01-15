import * as SQLite from 'expo-sqlite';
import { createStore, type Store } from 'tinybase';
import { createExpoSqlitePersister, type ExpoSqlitePersister } from 'tinybase/persisters/persister-expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let store: Store | null = null;
let persister: ExpoSqlitePersister | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db && store && persister) {
    return db;
  }

  // Initialize SQLite database
  db = await SQLite.openDatabaseAsync('lunaria.db');

  // Create tables (required for TinyBase tabular mode)
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
      delay INTEGER DEFAULT 0,
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

  // Migrations
  try {
    // Remove delay from daily_logs if it exists (cleanup from previous version)
    await db.execAsync(`ALTER TABLE daily_logs DROP COLUMN delay`);
  } catch (error: any) {
    // Column doesn't exist, ignore error
    if (!error.message?.includes('no such column')) {
      console.warn('Migration warning:', error);
    }
  }

  try {
    // Add delay column to cycles if it doesn't exist
    await db.execAsync(`ALTER TABLE cycles ADD COLUMN delay INTEGER DEFAULT 0`);
  } catch (error: any) {
    // Column already exists, ignore error
    if (!error.message?.includes('duplicate column')) {
      console.warn('Migration warning:', error);
    }
  }

  // Initialize sync settings with default value (daily)
  await db.runAsync(
    `INSERT OR IGNORE INTO sync_settings (key, value) VALUES ('sync_frequency', 'daily')`
  );

  // Create TinyBase store
  store = createStore();

  // Create persister with tabular mapping
  persister = createExpoSqlitePersister(store, db, {
    mode: 'tabular',
    tables: {
      load: {
        profiles: { tableId: 'profiles', rowIdColumnName: 'id' },
        daily_logs: { tableId: 'daily_logs', rowIdColumnName: 'id' },
        cycles: { tableId: 'cycles', rowIdColumnName: 'id' },
        sync_queue: { tableId: 'sync_queue', rowIdColumnName: 'id' },
        sync_settings: { tableId: 'sync_settings', rowIdColumnName: 'key' },
      },
      save: {
        profiles: { tableName: 'profiles', rowIdColumnName: 'id' },
        daily_logs: { tableName: 'daily_logs', rowIdColumnName: 'id' },
        cycles: { tableName: 'cycles', rowIdColumnName: 'id' },
        sync_queue: { tableName: 'sync_queue', rowIdColumnName: 'id' },
        sync_settings: { tableName: 'sync_settings', rowIdColumnName: 'key' },
      },
    },
  });

  // Load existing data from SQLite into TinyBase store
  await persister.load();

  // Start auto-save to persist changes automatically
  persister.startAutoSave();

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export function getStore(): Store {
  if (!store) {
    throw new Error('Store not initialized. Call initDatabase() first.');
  }
  return store;
}

export function getPersister(): ExpoSqlitePersister {
  if (!persister) {
    throw new Error('Persister not initialized. Call initDatabase() first.');
  }
  return persister;
}
