/* Browser-local media store for the temporary Yeshiva Bonilla workspace.
 * Files are saved as IndexedDB Blobs, never embedded in localStorage.
 * This is NOT private server storage or synchronized across browsers.
 */
(() => {
  'use strict';
  const DB_NAME = 'yeshiva-bonilla-local-media';
  const STORE = 'assets';
  const VERSION = 1;
  let dbPromise;
  function openDB(){return dbPromise ||= new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('This browser does not support local file storage.')); return; }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, {keyPath: 'id'}); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Could not open local media storage'));
    req.onblocked = () => reject(new Error('Close other Yeshiva Bonilla tabs before proceeding'));
  });}
  function operation(mode, makeRequest) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = makeRequest(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request?.result);
      tx.onabort = () => reject(tx.error || request?.error || new Error('Local file operation aborted'));
      tx.onerror = () => reject(tx.error || request?.error || new Error('Local media storage failed'));
    }));
  }
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'video/mp4', 'audio/mpeg']);
  function validateFile(file) {
    if (!file || !allowed.has(file.type)) throw new Error('File type not supported. Use JPG, PNG, WebP, GIF, PDF, TXT, MP4 or MP3.');
    if (file.size > 100 * 1024 * 1024) throw new Error('100 MB maximum per file. Prefer YouTube or Vimeo for long videos.');
  }
  async function put(id, blob, meta = {}) {
    if (!/^local\/[a-z0-9-]{16,120}$/i.test(id)) throw new Error('Invalid local media identifier');
    await operation('readwrite', store => store.put({id, blob, name: meta.name || 'file', type: meta.type || blob.type || 'application/octet-stream'}));
    return id;
  }
  const get = id => operation('readonly', store => store.get(id));
  const remove = id => operation('readwrite', store => store.delete(id));
  const clear = () => operation('readwrite', store => store.clear());
  const all = () => operation('readonly', store => store.getAll());
  window.YeshivaLocalMedia = {validateFile, put, get, remove, clear, all};
})();