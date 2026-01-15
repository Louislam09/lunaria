import { getStore } from './database';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { parseJsonArray, intToBool, boolToInt } from '@/utils/dbHelpers';

export interface ExportData {
  version: string;
  exportDate: string;
  profiles: any[];
  daily_logs: any[];
  cycles: any[];
}

// Export all user data to JSON
export async function exportData(userId: string): Promise<string> {
  const store = getStore();

  // Fetch all data from TinyBase
  const profilesTable = store.getTable('profiles');
  const logsTable = store.getTable('daily_logs');
  const cyclesTable = store.getTable('cycles');

  // Filter by user_id and transform data
  const profiles = Object.entries(profilesTable)
    .filter(([_, row]) => row.user_id === userId)
    .map(([id, row]) => ({
      id,
      user_id: row.user_id,
      name: row.name,
      birth_date: row.birth_date,
      cycle_type: row.cycle_type,
      average_cycle_length: row.average_cycle_length,
      cycle_range_min: row.cycle_range_min,
      cycle_range_max: row.cycle_range_max,
      period_length: row.period_length,
      has_pcos: intToBool(row.has_pcos as number),
      pcos_symptoms: parseJsonArray<string>(row.pcos_symptoms as string),
      pcos_treatment: parseJsonArray<string>(row.pcos_treatment as string),
      contraceptive_method: row.contraceptive_method,
      wants_pregnancy: row.wants_pregnancy !== null ? intToBool(row.wants_pregnancy as number) : null,
    }));

  const daily_logs = Object.entries(logsTable)
    .filter(([_, row]) => row.user_id === userId)
    .map(([id, row]) => ({
      id,
      user_id: row.user_id,
      date: row.date,
      symptoms: parseJsonArray<string>(row.symptoms as string),
      flow: row.flow,
      mood: row.mood,
      notes: row.notes,
      synced: intToBool(row.synced as number),
    }));

  const cycles = Object.entries(cyclesTable)
    .filter(([_, row]) => row.user_id === userId)
    .map(([id, row]) => ({
      id,
      user_id: row.user_id,
      start_date: row.start_date,
      end_date: row.end_date,
      delay: row.delay || 0,
      synced: intToBool(row.synced as number),
    }));

  // Transform data
  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    profiles,
    daily_logs,
    cycles,
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

    const store = getStore();
    let imported = 0;
    let errors = 0;

    // Import profiles
    for (const profile of importData.profiles) {
      try {
        const id = profile.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        store.setRow('profiles', id, {
          user_id: userId,
          name: profile.name || null,
          birth_date: profile.birth_date || null,
          cycle_type: profile.cycle_type || null,
          average_cycle_length: profile.average_cycle_length || null,
          cycle_range_min: profile.cycle_range_min || null,
          cycle_range_max: profile.cycle_range_max || null,
          period_length: profile.period_length || null,
          has_pcos: boolToInt(profile.has_pcos),
          pcos_symptoms: JSON.stringify(profile.pcos_symptoms || []),
          pcos_treatment: JSON.stringify(profile.pcos_treatment || []),
          contraceptive_method: profile.contraceptive_method || null,
          wants_pregnancy: profile.wants_pregnancy !== undefined ? boolToInt(profile.wants_pregnancy) : null,
          synced: 0,
          updated_at: new Date().toISOString(),
        });
        imported++;
      } catch (error) {
        console.error('Failed to import profile:', error);
        errors++;
      }
    }

    // Import daily logs
    for (const log of importData.daily_logs) {
      try {
        const id = log.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        store.setRow('daily_logs', id, {
          user_id: userId,
          date: log.date,
          symptoms: JSON.stringify(log.symptoms || []),
          flow: log.flow || null,
          mood: log.mood || null,
          notes: log.notes || null,
          synced: 0,
          updated_at: new Date().toISOString(),
        });
        imported++;
      } catch (error) {
        console.error('Failed to import log:', error);
        errors++;
      }
    }

    // Import cycles
    for (const cycle of importData.cycles) {
      try {
        const id = cycle.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        store.setRow('cycles', id, {
          user_id: userId,
          start_date: cycle.start_date,
          end_date: cycle.end_date || null,
          delay: cycle.delay || 0,
          synced: 0,
          updated_at: new Date().toISOString(),
        });
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
