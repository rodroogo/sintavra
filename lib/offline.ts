const name = "sintavra-drafts-v1";
async function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(name, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("snapshots");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function localSnapshot(userId: string, value?: unknown) {
  const d = await db();
  return new Promise<unknown>((resolve, reject) => {
    const tx = d.transaction(
      "snapshots",
      value === undefined ? "readonly" : "readwrite",
    );
    const r =
      value === undefined
        ? tx.objectStore("snapshots").get(userId)
        : tx.objectStore("snapshots").put(value, userId);
    tx.oncomplete = () => {
      d.close();
      resolve(r.result);
    };
    tx.onerror = () => {
      d.close();
      reject(tx.error);
    };
  });
}
export async function clearSnapshot(userId: string) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction("snapshots", "readwrite");
    tx.objectStore("snapshots").delete(userId);
    tx.oncomplete = () => {
      d.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
