import { getDatabase } from './database';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export interface ExportData {
  version: string;
  exportDate: string;
  profiles: any[];
  daily_logs: any[];
  cycles: any[];
}

// Export all user data to JSON
export async function exportData(userId: string): Promise<string> {
  const db = await getDatabase();

  // Fetch all data
  const [profiles, logs, cycles] = await Promise.all([
    db.getAllAsync(`SELECT * FROM profiles WHERE user_id = ?`, [userId]),
    db.getAllAsync(`SELECT * FROM daily_logs WHERE user_id = ?`, [userId]),
    db.getAllAsync(`SELECT * FROM cycles WHERE user_id = ?`, [userId]),
  ]);

  // Transform data
  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    profiles: profiles.map((p: any) => ({
      ...p,
      pcos_symptoms: JSON.parse(p.pcos_symptoms || '[]'),
      pcos_treatment: JSON.parse(p.pcos_treatment || '[]'),
      has_pcos: Boolean(p.has_pcos),
      wants_pregnancy: p.wants_pregnancy !== null ? Boolean(p.wants_pregnancy) : null,
    })),
    daily_logs: logs.map((l: any) => ({
      ...l,
      symptoms: JSON.parse(l.symptoms || '[]'),
      synced: Boolean(l.synced),
    })),
    cycles: cycles.map((c: any) => ({
      ...c,
      synced: Boolean(c.synced),
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const fileName = `lunaria-export-${new Date().toISOString().split('T')[0]}.json`;

  // Create file using new File API
  const file = new File(Paths.document, fileName);
  file.write(jsonString);

  // Share file
  // Check if sharing is available (required for web compatibility)
  if (await Sharing.isAvailableAsync()) {
    try {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json', // Android
        UTI: 'public.json', // iOS - Uniform Type Identifier for JSON
        dialogTitle: 'Exportar datos de Lunaria', // Android & Web
      });
    } catch (error) {
      // If sharing fails, still return the file URI so user can access it
      console.warn('Sharing failed:', error);
      // File is still saved and URI is returned below
    }
  } else {
    // Sharing not available (e.g., web without HTTPS)
    console.warn('Sharing API not available. File saved at:', file.uri);
  }

  return file.uri;
}

// Import data from JSON file
export async function importData(userId: string): Promise<{ imported: number; errors: number }> {
  try {
    // Pick file
    // copyToCacheDirectory: true ensures file is accessible by expo-file-system immediately
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    // Check if user canceled
    if (result.canceled || !result.assets || result.assets.length === 0) {
      throw new Error('Importación cancelada');
    }

    // Read file using new File API
    // With copyToCacheDirectory: true, the file is available immediately
    const file = new File(result.assets[0].uri);
    const fileContent = await file.text();
    const importData: ExportData = JSON.parse(fileContent);

    // Validate version
    if (!importData.version || !importData.profiles || !importData.daily_logs || !importData.cycles) {
      throw new Error('Formato de archivo inválido');
    }

    const db = await getDatabase();
    let imported = 0;
    let errors = 0;

    // Import profiles
    for (const profile of importData.profiles) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO profiles 
           (id, user_id, name, birth_date, cycle_type, average_cycle_length,
            cycle_range_min, cycle_range_max, period_length, has_pcos,
            pcos_symptoms, pcos_treatment, contraceptive_method, wants_pregnancy, synced, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            profile.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            profile.name,
            profile.birth_date,
            profile.cycle_type,
            profile.average_cycle_length,
            profile.cycle_range_min,
            profile.cycle_range_max,
            profile.period_length,
            profile.has_pcos ? 1 : 0,
            JSON.stringify(profile.pcos_symptoms || []),
            JSON.stringify(profile.pcos_treatment || []),
            profile.contraceptive_method,
            profile.wants_pregnancy ? 1 : 0,
          ]
        );
        imported++;
      } catch (error) {
        console.error('Failed to import profile:', error);
        errors++;
      }
    }

    // Import daily logs
    for (const log of importData.daily_logs) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO daily_logs 
           (id, user_id, date, symptoms, flow, mood, notes, synced, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            log.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            log.date,
            JSON.stringify(log.symptoms || []),
            log.flow,
            log.mood,
            log.notes,
          ]
        );
        imported++;
      } catch (error) {
        console.error('Failed to import log:', error);
        errors++;
      }
    }

    // Import cycles
    for (const cycle of importData.cycles) {
      try {
        await db.runAsync(
          `INSERT OR REPLACE INTO cycles 
           (id, user_id, start_date, end_date, synced, updated_at)
           VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [
            cycle.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            cycle.start_date,
            cycle.end_date,
          ]
        );
        imported++;
      } catch (error) {
        console.error('Failed to import cycle:', error);
        errors++;
      }
    }

    return { imported, errors };
  } catch (error: any) {
    throw new Error(error.message || 'Error al importar datos');
  }
}

