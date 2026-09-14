// Tarayıcıların hepsinde (Safari dahil) mevcut olan yerleşik UUID üretici.
export function createId(): string {
  return crypto.randomUUID()
}
