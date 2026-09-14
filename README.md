# Finans Rehberim

Kişisel gelir/gider, borç ve portföy (fon/hisse) takibi için, tamamen kendi kullanımın için hazırlanmış bir PWA (Progressive Web App). Verilerin **sadece kendi telefonunda/tarayıcında** saklanır — hiçbir sunucuya gönderilmez.

## Özellikler (Faz 1)

- **Özet** — bu ayki gelir/gider/net, açık borç/alacak toplamı, portföy değeri ve grafikler
- **Gelir/Gider** — kategori bazlı işlem takibi
- **Borçlar** — aldığın/verdiğin borçlar, ödeme geçmişi
- **Portföy** — TEFAS fonları ve BIST hisseleri için alım/satım kaydı, elle fiyat güncelleme, otomatik kâr/zarar hesabı
- **Ayarlar** — kategori yönetimi, JSON yedekle/geri yükle

> Otomatik fiyat çekme (TEFAS/BIST) ve Claude tabanlı analiz/öneri özellikleri bu fazda **yok** — sonraki bir fazda eklenecek.

## Geliştirme

```bash
npm install
npm run dev       # http://localhost:5173/finans_rehberim/
npm run build     # dist/ içine üretim derlemesi
npm run preview   # üretim derlemesini yerelde önizle
```

## Telefona kurma (GitHub Pages ile)

Bu proje statik bir dosya seti olarak derlenir ve GitHub Pages üzerinden ücretsiz yayınlanabilir. Adımlar:

1. **GitHub'da yeni bir repo oluştur** (github.com → New repository). Adını `finans_rehberim` yap (bu, `vite.config.ts`'teki `base` yolu ile birebir eşleşmeli — repo adını değiştirirsen ikisini birlikte güncelle). README/gitignore eklemeden **boş** oluştur, **Public** seç (ücretsiz Pages için repo herkese açık olmalı — ama gerçek finansal veriler hiç commit edilmez, sadece cihazında IndexedDB'de kalır).
2. Repo URL'sini kopyala, sonra bu klasörde:
   ```bash
   git remote add origin <REPO_URL>
   git push -u origin main
   ```
3. GitHub'da repo sayfasında **Settings → Pages → Source** kısmını **"GitHub Actions"** olarak ayarla (tek seferlik).
4. **Actions** sekmesinde "Deploy to GitHub Pages" workflow'unun yeşil (başarılı) olduğunu doğrula.
5. iPhone'da **Safari**'yi aç, `https://<kullanıcı-adın>.github.io/finans_rehberim/` adresine git.
6. Paylaş (Share) düğmesi → **Ana Ekrana Ekle** (Add to Home Screen).
7. Ana ekrandaki ikona dokunarak uygulamayı aç — artık Safari çubuğu olmadan, gerçek bir uygulama gibi çalışır.

Her kod değişikliğinden sonra `main` dalına push ettiğinde, GitHub Actions otomatik olarak yeniden derleyip yayınlar.

## Yedekleme — ÖNEMLİ

Veriler sadece bu cihazda (tarayıcının IndexedDB'sinde) saklanır. Telefon değişirse, uygulama verisi silinirse veya Safari site verileri temizlenirse **veriler geri gelmez**. Bu yüzden:

- Düzenli olarak **Ayarlar → Yedek İndir** ile bir JSON yedek al.
- Bu dosyayı iCloud, e-posta veya Dosyalar uygulamasında güvenli bir yerde sakla.
- Gerektiğinde **Ayarlar → Yedekten Geri Yükle** ile geri yükleyebilirsin (bu, mevcut tüm veriyi yedekteki ile değiştirir).

## Proje Yapısı

Bkz. `src/` altındaki `db/` (Dexie/IndexedDB veri katmanı), `features/` (her modülün sayfa ve bileşenleri), `lib/` (saf hesaplama/yardımcı fonksiyonlar) ve `types/models.ts` (tüm veri modeli).
