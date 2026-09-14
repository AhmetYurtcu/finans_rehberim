// Uygulamanın koyu yüzeyine (slate-900, #0f172a) göre doğrulanmış grafik renkleri.
// Değerler dataviz skill'inin referans paletinden alınıp bu yüzeye karşı
// validate_palette.js ile doğrulandı (tüm kontroller PASS).
export const chartColors = {
  surface: '#0f172a',
  grid: '#1e293b', // slate-800 — hairline, resesif
  axis: '#334155', // slate-700
  mutedText: '#94a3b8', // slate-400 — eksen/etiket metni
  secondaryText: '#cbd5e1', // slate-300

  // Tek seri / büyüklük (sequential mavi, tek ton)
  sequential: '#3987e5',

  // Gelir/gider gibi kutupsal (diverging) çiftler için: mavi <-> kırmızı
  divergingPositive: '#3987e5',
  divergingNegative: '#e66767',

  // Durum (kâr/zarar) — rezerve edilmiş, sadece ikon/etiketle birlikte kullanılır
  statusGood: '#0ca30c',
  statusCritical: '#d03b3b',
} as const
