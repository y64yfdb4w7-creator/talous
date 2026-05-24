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
      const DB_VERSION = 14; // v14: add sales store
      const r = indexedDB.open(DB_NAME, DB_VERSION);

      r.onblocked = () => {
        alert('Finance OS on auki toisessa välilehdessä. Sulje vanhat välilehdet ja päivitä sivu.');
      };

      r.onupgradeneeded = e => {
        const db = e.target.result;
        const oldVersion = e.oldVersion;
        if (!db.objectStoreNames.contains('snapshots')) {
          db.createObjectStore('snapshots', { keyPath: 'date' });
        }
        // v11: recreate events store without autoIncrement (string keys)
        if (db.objectStoreNames.contains('events') && oldVersion < 11) {
          db.deleteObjectStore('events');
        }
        if (!db.objectStoreNames.contains('events')) {
          const es = db.createObjectStore('events', { keyPath: 'id' });
          es.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('holdings')) {
          db.createObjectStore('holdings', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pins')) {
          const ps = db.createObjectStore('pins', { keyPath: 'id' });
          ps.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }
        // v14: sales store
        if (!db.objectStoreNames.contains('sales')) {
          const ss = db.createObjectStore('sales', { keyPath: 'id' });
          ss.createIndex('date', 'date');
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

  async putSnapshot(snap) {
    return new Promise((res, rej) => {
      const tx  = this.db.transaction('snapshots', 'readwrite');
      const req = tx.objectStore('snapshots').put(snap);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  },

  async deleteSnapshot(date) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('snapshots', 'readwrite');
      tx.objectStore('snapshots').delete(date);
      tx.oncomplete = res;
      tx.onerror    = e => rej(e.target.error);
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

  async putPin(pin) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('pins', 'readwrite');
      const req = tx.objectStore('pins').put(pin);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  },

  async deletePin(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('pins', 'readwrite');
      tx.objectStore('pins').delete(id);
      tx.oncomplete = res;
      tx.onerror    = e => rej(e.target.error);
    });
  },

  async putSale(sale) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('sales', 'readwrite');
      const req = tx.objectStore('sales').put(sale);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  },

  async deleteSale(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('sales', 'readwrite');
      tx.objectStore('sales').delete(id);
      tx.oncomplete = res;
      tx.onerror    = e => rej(e.target.error);
    });
  },

  async putBackup(backup) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('backups', 'readwrite');
      const req = tx.objectStore('backups').put(backup);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  },

  async clearOldBackups(keepIds) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('backups', 'readwrite');
      const store = tx.objectStore('backups');
      const req = store.getAllKeys();
      req.onsuccess = e => {
        const keys = e.target.result;
        keys.forEach(k => { if (!keepIds.includes(k)) store.delete(k); });
        tx.oncomplete = res;
      };
      req.onerror = e => rej(e.target.error);
    });
  },

  async archiveSnapshot(date, archived) {
    const all = await this.getAll('snapshots');
    const snap = all.find(s => s.date === date);
    if (!snap) return;
    snap._archived = archived;
    return new Promise((res, rej) => {
      const tx = this.db.transaction('snapshots', 'readwrite');
      const req = tx.objectStore('snapshots').put(snap);
      req.onsuccess = res; req.onerror = e => rej(e.target.error);
    });
  },

  async deleteSnapshotsAfter(date) {
    const all = await this.getAll('snapshots');
    const toDelete = all.filter(s => s.date > date);
    return new Promise((res, rej) => {
      const tx = this.db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      toDelete.forEach(s => store.delete(s.date));
      tx.oncomplete = res; tx.onerror = e => rej(e.target.error);
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