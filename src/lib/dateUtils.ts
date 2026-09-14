import dayjs from 'dayjs'

export function todayISO(): string {
  return dayjs().format('YYYY-MM-DD')
}

export function nowISO(): string {
  return dayjs().toISOString()
}

export function formatDate(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY')
}

export function monthKey(iso: string): string {
  return dayjs(iso).format('YYYY-MM')
}

export function monthLabel(monthKeyValue: string): string {
  return dayjs(monthKeyValue, 'YYYY-MM').format('MMMM YYYY')
}

export function currentMonthKey(): string {
  return dayjs().format('YYYY-MM')
}

/** Son N ay için 'YYYY-MM' anahtarlarını eskiden yeniye sıralı döndürür. */
export function lastNMonthKeys(n: number): string[] {
  const keys: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
  }
  return keys
}
