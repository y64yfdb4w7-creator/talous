// Safari-yhteensopiva timeout helper
function abortSignalWithTimeout(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}
'use strict';

// ═══════════════════════════════════════════════
// DB
// ═══════════════════════════════════════════════
const DB = {
  db: null,

  async init() {
    return new Promise((res, rej) => {
      const DB_NAME    = 'FinanceOS_3'; // renamed — avoids stale iOS cache
      const DB_VERSION = 10; // jump high — avoids legacy version conflicts
      const r = indexedDB.open(DB_NAME, DB_VERSION);

      r.onblocked = () => {
        alert('Finance OS on auki toisessa välilehdessä. Sulje vanhat välilehdet ja päivitä sivu.');
      };

      r.onupgradeneeded = e => {
        const db = e.target.result;
        // Additive only — never delete existing stores
        if (!db.objectStoreNames.contains('snapshots')) {
          db.createObjectStore('snapshots', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('events')) {
          const es = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          es.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('holdings')) {
          db.createObjectStore('holdings', { keyPath: 'id', autoIncrement: true });
        }
      };
      r.onsuccess = e => {
        this.db = e.target.result;
        this.db.onversionchange = () => {
          this.db.close();
          alert('Sovellus on päivitetty. Päivitä sivu jatkaaksesi.');
        };
        res();
      };
      r.onerror = e => rej(e.target.error);
    });
  },

  async bulkPutSnapshots(snaps) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('snapshots', 'readwrite');
      const st = tx.objectStore('snapshots');
      snaps.forEach(s => st.put(s));
      tx.oncomplete = () => res(snaps.length);
      tx.onerror = e => rej(e.target.error);
    });
  },

  async bulkAddEvents(evs) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('events', 'readwrite');
      const st = tx.objectStore('events');
      evs.forEach(e => st.add(e));
      tx.oncomplete = () => res(evs.length);
      tx.onerror = e => rej(e.target.error);
    });
  },

  async getAll(store) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(store, 'readonly');
      const r = tx.objectStore(store).getAll();
      r.onsuccess = e => res(e.target.result);
      r.onerror = e => rej(e.target.error);
    });
  },

  async count(store) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(store, 'readonly');
      const r = tx.objectStore(store).count();
      r.onsuccess = e => res(e.target.result);
      r.onerror = e => rej(e.target.error);
    });
  },

  async putHolding(h) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('holdings', 'readwrite');
      const req = h.id ? tx.objectStore('holdings').put(h) : tx.objectStore('holdings').add(h);
      req.onsuccess = e => res(e.target.result);
      req.onerror = e => rej(e.target.error);
    });
  },

  async deleteHolding(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('holdings', 'readwrite');
      tx.objectStore('holdings').delete(id);
      tx.oncomplete = res;
      tx.onerror = e => rej(e.target.error);
    });
  },

  async putEvent(ev) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('events', 'readwrite');
      const req = tx.objectStore('events').put(ev);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  },

  async deleteEvent(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('events', 'readwrite');
      tx.objectStore('events').delete(id);
      tx.oncomplete = res;
      tx.onerror    = e => rej(e.target.error);
    });
  },

  async clear() {
    return new Promise((res, rej) => {
      const stores = ['snapshots','events','holdings'].filter(
        s => this.db.objectStoreNames.contains(s)
      );
      const tx = this.db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
      tx.oncomplete = res;
      tx.onerror = e => rej(e.target.error);
    });
  }
};

// ═══════════════════════════════════════════════
// CSV PARSER  (auto-detects , vs ;)
// ═══════════════════════════════════════════════