/** Ask the browser not to evict IndexedDB data */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (!navigator.storage?.persist) return;
    if (await navigator.storage.persisted()) return;
    await navigator.storage.persist();
  } catch {
    // unsupported or denied: data is still saved, just evictable under pressure
  }
}
