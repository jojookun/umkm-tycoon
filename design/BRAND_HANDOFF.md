# Tahan Banting — Brand handoff

**Status: Concept B dipilih pengguna dan telah diterapkan.**

Pengguna memilih Concept B. Logo memakai siluet kios rendah dengan atap miring, dua tiang, meja, dan dasar mendatar. Bentuk asli eksplorasi B dipertahankan; atap memakai terakota dan struktur cokelat gelap. Concept A dan C tetap tersedia sebagai arsip eksplorasi, bukan varian runtime.

Board dalam asset.pen:
- Brand / Logo: tiga konsep, status pilihan B, master editable, anatomi, clear space, ukuran minimum, latar, dan contoh penggunaan salah.
- Brand / Applications / Selected B: penerapan desktop, mobile, shortcut/favicon, dan rapor.
- Brand / Usage Overview / Selected B: ringkasan panduan penggunaan.

## Penerapan pada desain aplikasi

Concept B diterapkan pada Foundations dan Components, header dashboard desktop/laptop, debrief, alur demo, onboarding, pre/post-test, rapor, serta konteks desktop pembiayaan, replay, dan HPP. Landing desktop dan mobile memakai lockup lengkap. Header Mobile Tahap 2 memakai simbol 32 px di samping konteks warung/minggu.

Nama Dapur Sari tetap dipakai untuk warung, panggung, dan konteks sesi. Logo tidak ditambahkan sebagai watermark pada panel atau dialog. Angka, aturan ekonomi, pilihan, karakter, dan isi keputusan dipertahankan.

Header laptop 1366×768 memakai logo compact dan konteks minggu berdampingan agar ringkasan serta kontrol tidak melewati batas bawah.

## Hierarki dan komponen

Tahan Banting adalah nama utama produk. UMKM Tycoon adalah subjudul. Dapur Sari adalah nama warung dalam permainan.

Master lettering Nunito Sans tetap dapat diedit. Komponen:
- brand/logo/horizontal
- brand/logo/stacked
- brand/logo/wordmark
- brand/logo/symbol
- brand/logo/mono-dark
- brand/logo/mono-light
- brand/logo/compact-no-subtitle

Latar ikon aplikasi terpisah pada brand/icon/app-background. Simbol aktif terdiri dari path siluet B dan overlay atap; dua path lama C dinonaktifkan untuk menjaga referensi instance. Sumber eksplorasi C tetap terpisah.

## Aset yang tersedia

Semua berkas berada di [exports/brand](exports/brand/).

| SVG | Penggunaan |
| --- | --- |
| tahan-banting-horizontal.svg | Identitas lengkap pada area lebar |
| tahan-banting-stacked.svg | Landing mobile dan area sempit |
| tahan-banting-wordmark.svg | Lettering tanpa simbol |
| tahan-banting-symbol.svg | Favicon/simbol; tidak bergantung font |
| tahan-banting-mono-dark.svg | Satu warna cokelat pada latar terang |
| tahan-banting-mono-light.svg | Satu warna krem pada latar gelap |
| tahan-banting-compact.svg | Header gameplay tanpa subjudul |

Ketujuh lockup juga tersedia sebagai PNG transparan 2×. Ikon aplikasi memiliki ukuran tepat 32, 64, 192, dan 512 px dengan latar krem membulat terpisah. tahan-banting-favicon-32.png adalah simbol transparan 32×32.

Overview: logo-concepts-overview.png, logo-usage-overview.png, logo-master-board.png. Contoh: example-header-desktop.png, example-landing-mobile.png, example-end-game.png. Preview kecil untuk board berada di previews/. manifest.json dan asset-inventory.json mencatat aset aktual.

PNG layar yang terkait serta overview telah diperbarui di exports/stage-2/ dan exports/stage-3/. Preview terpilih untuk overview Tahap 3 berada di exports/stage-3/previews-selected-b/. Master layar tetap berupa layer kanvas editable.

## Warna, ruang aman, dan ukuran

- Cokelat gelap #30251E; terakota #A3432B; krem #FBF6EC.
- u = tebal palang dasar: sekitar 6,14 px pada simbol master 128 px. Sisakan minimal 2u di luar viewBox lockup. Skala u mengikuti ukuran logo.
- Untuk wordmark tanpa simbol, u = 0,35 × ukuran huruf utama; sisakan minimal 1u.
- Minimum yang diperiksa: horizontal 360 px; stacked 256 px; wordmark 256 px; compact 240 px; simbol 32 px.
- Subjudul pada minimum lengkap sekitar 12,5–12,7 px. Gunakan compact/simbol di bawah minimum; jangan mengecilkan subjudul lebih jauh.
- Pertahankan rasio lebar dan tinggi. Jangan memutar keseluruhan logo, meregangkan, atau mengurangi kontras.
- Logo gameplay tetap sekunder terhadap kas dan pilihan keputusan.

## Aksesibilitas dan implementasi

Saat implementasi, gunakan satu komponen logo yang menerima variant dan theme. Ukuran selalu proporsional. Accessible name logo informatif: **Tahan Banting — UMKM Tycoon**. Bila nama produk yang sama sudah ada di sebelah simbol, simbol dapat dekoratif agar pembaca layar tidak mengulang.

Gunakan aset lokal. Lokasi runtime yang disarankan: public/brand/, mengikuti konvensi repository. Tugas ini hanya memperbarui desain dan aset; tidak menambahkan kode komponen atau mengubah stack aplikasi.

## Font, lisensi, dan keterbatasan

Font master: Nunito Sans 900 untuk judul dan 800 untuk subjudul. [SIL Open Font License 1.1](https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt) telah diverifikasi dari sumber Google Fonts. Biner font tidak dibundel; versi/checksum binernya belum diperiksa.

SVG ditulis dari path dan teks native kanvas dengan viewBox yang sesuai, tanpa bitmap yang dibungkus SVG. **Lettering SVG masih berupa teks, belum outline.** SVG bertulisan memerlukan Nunito Sans; PNG mempertahankan tampilan tanpa font terpasang. Simbol SVG berisi dua path aktif dan tidak memerlukan font.

Verifikasi mencakup simbol 32/64 px, monokrom, ukuran minimum, transparansi PNG, nominal penuh, dan layout header laptop. Crop karakter pada panggung Mobile Tahap 2 merupakan komposisi yang sudah ada dan tidak diubah. Interaksi aplikasi, navigasi, aksesibilitas runtime, serta integrasi ikon OS/browser belum diuji.
