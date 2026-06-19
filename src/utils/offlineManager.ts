import { set, get, keys, del } from 'idb-keyval';
import { supabase } from '../lib/supabase';

export interface OfflineQueueItem {
  id: string; // project ID
  data: any;
  timestamp: number;
  synced: boolean;
  action: 'update' | 'create' | 'delete';
}

export const saveProjectLocally = async (projectId: string, data: any, action: 'update' | 'create' | 'delete' = 'update') => {
  try {
    const offlineItem: OfflineQueueItem = {
      id: projectId,
      data,
      timestamp: Date.now(),
      synced: false,
      action
    };
    await set(`project_${projectId}`, offlineItem);
    
    // Maintain a queue for sync
    let syncQueue = (await get('quantum_sync_queue') as string[]) || [];
    if (!syncQueue.includes(`project_${projectId}`)) {
       syncQueue.push(`project_${projectId}`);
       await set('quantum_sync_queue', syncQueue);
    }
    return true;
  } catch (error) {
    console.error('Failed to save to IndexedDB', error);
    return false;
  }
};

export const loadProjectLocally = async (projectId: string) => {
  try {
    const item = await get(`project_${projectId}`) as OfflineQueueItem;
    return item ? item.data : null;
  } catch (error) {
    console.error('Failed to load from IndexedDB', error);
    return null;
  }
};

export const loadAllLocalProjects = async () => {
  try {
     const allKeys = await keys();
     const projectKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('project_'));
     const projects = [];
     for(const k of projectKeys) {
        const item = await get(k) as OfflineQueueItem;
        if (item && item.action !== 'delete') {
            projects.push({ id: item.id, data: item.data, updated_at: new Date(item.timestamp).toISOString() });
        }
     }
     return projects;
  } catch (err) {
     return [];
  }
}

export const syncOfflineData = async () => {
  if (!navigator.onLine || !supabase) return;
  try {
    let syncQueue = (await get('quantum_sync_queue') as string[]) || [];
    const newQueue: string[] = [];

    for (const key of syncQueue) {
      const item = await get(key) as OfflineQueueItem;
      if (!item || item.synced) {
        continue;
      }

      try {
        if (item.action === 'update') {
           const { error } = await supabase
            .from('projects')
            .update({ data: item.data, updated_at: new Date(item.timestamp).toISOString() })
            .eq('id', item.id);
           if (error) throw error;
        } else if (item.action === 'create') {
           const { error } = await supabase
            .from('projects')
            .insert([item.data]); // Assume item.data is the full project row
           if (error && error.code !== '23505') throw error; // Ignore duplicate
        } else if (item.action === 'delete') {
            const { error } = await supabase
             .from('projects')
             .update({ is_deleted: true })
             .eq('id', item.id);
            if (error) throw error;
        }

        // Mark synced and don't re-add to queue
        item.synced = true;
        await set(key, item);
      } catch (err) {
        console.error(`Failed to sync ${key}`, err);
        newQueue.push(key); // keep in queue
      }
    }

    await set('quantum_sync_queue', newQueue);
    console.log('Syncing complete. Remaining in queue:', newQueue.length);
  } catch (err) {
    console.error('Offline sync failed', err);
  }
};
