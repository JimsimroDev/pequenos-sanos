/**
 * Pending consumption queue — localStorage-backed.
 *
 * When a player collects food, the consumption is queued here BEFORE the
 * HTTP call to the backend. On success, the item is removed. On next game
 * start, any leftover items are retried so coins are never silently lost.
 */

const STORAGE_KEY = 'ps-pending-consumos'

export interface PendingConsumo {
  perfilId: number
  alimentoId: number
  addedAt: number
}

export const pendingConsumos = {
  /** Read the full queue. */
  getAll(): PendingConsumo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  /** Append one item to the queue. */
  add(perfilId: number, alimentoId: number) {
    const items = this.getAll()
    // Deduplicate — avoid double-crediting if somehow the same item is re-queued
    const exists = items.some(
      (i) => i.perfilId === perfilId && i.alimentoId === alimentoId
    )
    if (!exists) {
      items.push({ perfilId, alimentoId, addedAt: Date.now() })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  },

  /** Remove a specific item from the queue. */
  remove(perfilId: number, alimentoId: number) {
    const items = this.getAll().filter(
      (i) => !(i.perfilId === perfilId && i.alimentoId === alimentoId)
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },

  /** Remove all items for a given profile (e.g. after a successful flush). */
  clearForProfile(perfilId: number) {
    const items = this.getAll().filter((i) => i.perfilId !== perfilId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },

  /** Clear everything. */
  clearAll() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
