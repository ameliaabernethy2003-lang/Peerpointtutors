import { supabaseAdmin } from './supabase';

/**
 * Read JSON data from Supabase (or fall back to local file system).
 * Keys map to the old JSON filenames: 'tutor-submissions', 'accepted-tutors', etc.
 */
export async function readJsonData(key: string): Promise<any> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('json_store')
        .select('data')
        .eq('key', key)
        .single();

      if (error) {
        // Row doesn't exist yet — return empty array
        if (error.code === 'PGRST116') {
          return [];
        }
        console.error(`Supabase read error for "${key}":`, error);
        // Fall through to file system
      } else {
        return data.data;
      }
    } catch (e) {
      console.error(`Supabase read exception for "${key}":`, e);
      // Fall through to file system
    }
  }

  // Fallback: local file system
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'submissions', `${key}.json`);
    const content = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Write JSON data to Supabase (or fall back to local file system).
 */
export async function writeJsonData(key: string, jsonData: any): Promise<void> {
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('json_store')
        .upsert(
          {
            key,
            data: jsonData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) {
        console.error(`Supabase write error for "${key}":`, error);
        // Fall through to file system
      } else {
        return; // Success — don't also write to file
      }
    } catch (e) {
      console.error(`Supabase write exception for "${key}":`, e);
      // Fall through to file system
    }
  }

  // Fallback: local file system
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');
  const dir = join(process.cwd(), 'submissions');
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${key}.json`);
  await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
}
