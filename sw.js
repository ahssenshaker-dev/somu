// =============================================
// Service Worker - Offline + Background Sync
// =============================================

const CACHE_NAME = 'crm-v1';
const ASSETS = ['/', '/index.html'];

// ---- Install: cache the app shell ----
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---- Fetch: network first, fallback to cache ----
self.addEventListener('fetch', e => {
  // Only handle GET navigation requests with cache fallback
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return; // let supabase calls go directly

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ---- Background Sync: send queued records when online ----
self.addEventListener('sync', e => {
  if (e.tag === 'sync-records') {
    e.waitUntil(syncPendingRecords());
  }
});

async function syncPendingRecords() {
  // Open IndexedDB
  const db = await openDB();
  const pending = await getAllPending(db);

  if (pending.length === 0) return;

  // Get config from DB
  const config = await getConfig(db);
  if (!config?.supabaseUrl || !config?.supabaseKey) return;

  for (const item of pending) {
    try {
      let res;
      if (item.action === 'delete') {
        res = await fetch(`${config.supabaseUrl}/rest/v1/records?id=eq.${item.record.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': config.supabaseKey,
            'Authorization': `Bearer ${config.supabaseKey}`
          }
        });
      } else if (item.action === 'update') {
        res = await fetch(`${config.supabaseUrl}/rest/v1/records?id=eq.${item.record.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': config.supabaseKey,
            'Authorization': `Bearer ${config.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(toSupabaseRecord(item.record))
        });
      } else {
        // insert
        res = await fetch(`${config.supabaseUrl}/rest/v1/records`, {
          method: 'POST',
          headers: {
            'apikey': config.supabaseKey,
            'Authorization': `Bearer ${config.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(toSupabaseRecord(item.record))
        });
      }

      if (res.ok || res.status === 204) {
        await deletePending(db, item.queueId);
      }
    } catch (err) {
      console.warn('[SW] Sync failed for item', item.queueId, err);
    }
  }

  // Notify all open tabs
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE' }));
}

function toSupabaseRecord(r) {
  return {
    id: r.id,
    day: r.day || null,
    employee: r.employee || '',
    name: r.name || '',
    phone: r.phone || '',
    city: r.city || 'الرياض',
    type: (r.type || '').replace(/[\u200f\s]/g, '').trim(),
    source: r.source || '',
    contact: (r.contact || '').replace(/[\u200f\s]/g, '').trim(),
    request: r.request || '',
    details: r.details || '',
    full_date: r.fullDate || null
  };
}

// ---- IndexedDB helpers (duplicated here for SW context) ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('crm_db', 2);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('records')) {
        db.createObjectStore('records', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        const qs = db.createObjectStore('sync_queue', { keyPath: 'queueId', autoIncrement: true });
        qs.createIndex('action', 'action');
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const req = tx.objectStore('sync_queue').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deletePending(db, queueId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const req = tx.objectStore('sync_queue').delete(queueId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function getConfig(db) {
  return new Promise((resolve) => {
    const tx = db.transaction('config', 'readonly');
    const req = tx.objectStore('config').get('supabase');
    req.onsuccess = () => resolve(req.result?.value || null);
    req.onerror = () => resolve(null);
  });
}
