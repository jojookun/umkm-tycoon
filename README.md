# Tahan Banting: UMKM Tycoon

[![Verify and deploy](https://github.com/jojookun/umkm-tycoon/actions/workflows/pages.yml/badge.svg)](https://github.com/jojookun/umkm-tycoon/actions/workflows/pages.yml)

**[Mainkan aplikasi](https://jojookun.github.io/umkm-tycoon/)** · **[Release submission-24h](https://github.com/jojookun/umkm-tycoon/releases/tag/submission-24h)** · [Source publik](https://github.com/jojookun/umkm-tycoon)

Tahan Banting adalah simulasi mengelola Dapur Sari selama 12 minggu: menentukan stok dan harga, memisahkan uang usaha, menghadapi kejadian, dan mencoba keputusan alternatif. Implementasi lokal menggunakan React, Vite, TypeScript, Tailwind CSS, dan Zod.

## Menjalankan aplikasi

Gunakan Node.js 22.12 atau lebih baru; workflow deployment memakai Node.js 24. Clone repository, lalu jalankan:

```sh
git clone https://github.com/jojookun/umkm-tycoon.git
cd umkm-tycoon
npm ci
npm run dev
```

Buka alamat yang ditampilkan terminal, biasanya http://127.0.0.1:5173. Untuk memeriksa hasil produksi:

```sh
npm run build
npm run preview
```

Hosting statis memakai build command `npm run build` dan output directory `dist`. Workflow GitHub Actions memeriksa kode sebelum deployment GitHub Pages. Build Pages menggunakan `PUBLIC_BASE_PATH=/umkm-tycoon/`; build lokal tetap memakai root `/`. Logo, karakter, panggung, font, dan favicon mengikuti base path deployment.

Tag `submission-24h` menunjuk snapshot source yang dikumpulkan. Deployment menggunakan commit yang sama; hasil workflow dapat diperiksa melalui badge di atas. Untuk hosting lain, lihat [panduan deployment](docs/DEPLOYMENT.md).

## Alur yang tersedia

- Sesi penuh: pre-test → onboarding → keputusan dan debrief Minggu 1–12 → rapor → post-test.
- Demo juri: checkpoint M1 → M4 → M8 → M12, dihitung engine yang sama. Minggu di antara checkpoint dijalankan dengan keputusan seimbang.
- HPP, pembiayaan formal/mahal, stok FIFO, waste, pembayaran parsial, dompet, kepercayaan, dan kondisi pekerja.
- Replay satu atau beberapa minggu dengan konfirmasi sebelum mengganti histori. Hasil sesudah rentang replay dibuang jika cabang diterapkan. Baseline dapat diekspor.
- Simpanan full/demo terpisah, validasi saat memuat, konflik revisi antartab, ekspor sesi, serta fallback di memori jika penyimpanan ditolak.

Logo B dan ilustrasi warung berasal dari kanvas pen.dev tim; runtime memakai aset lokal dalam `public`. PNG dipakai untuk lettering logo agar tidak bergantung pada font SVG yang belum di-outline. Font aplikasi Nunito Sans dibundel lokal.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm test
npm run balance
npm run build
npm audit
```

`npm run balance` menulis hasil engine ke [docs/balance-engine.csv](docs/balance-engine.csv). Berkas audit Python lama tetap menjadi pembanding, bukan implementasi runtime. Catatan hasil dan batas pengujian ada di [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).

Hasil pengujian UI mode demo dan sesi normal lengkap, termasuk pilihan alternatif, konflik antartab, replay tidak terbiayai, dan ekspor sesi: [docs/PLAYGROUND_TEST.md](docs/PLAYGROUND_TEST.md). Jawaban tes pada artefak QA adalah input pengujian buatan.

## Kontrak dan batas versi ini

Kontrak runtime berada di [src/engine/types.ts](src/engine/types.ts), mengacu blueprint v2.2. Dua penambahan implementasi: `WeekDecision.loanType?` menyimpan pilihan produk pembiayaan untuk replay; kode error `INVALID_STATE` membedakan state rusak dari keputusan tidak valid. Schema tetap 2.2.0 dan content version `2026.10.31.2`. Simpanan konten lama tidak dihitung ulang secara diam-diam: ekspor simpanan lama lalu mulai sesi baru melalui konfirmasi aplikasi.

Patch audit Argon memperbaiki replay kanal lintas minggu, pemulihan demo yang kekurangan modal, tampilan stok ayam/telur, aturan telur harga tetap tanpa promo/grosir ayam, tombol kembali ke rapor, serta validasi state awal dan rentang replay. Rincian patch ada di [docs/ARGON_FIXES.md](docs/ARGON_FIXES.md), dan hasil audit ulang di [docs/ARGON_REVIEW.md](docs/ARGON_REVIEW.md).

Setoran pribadi ke usaha belum menjadi aksi kontrak, sehingga UI tidak menawarkan transfer tersebut. Penarikan usaha ke pribadi dan penyisihan cadangan tersedia. Pool opsional tersedia di engine dan konten, tetapi dimatikan di UI/demo. Tahu/tempe dan wedang adalah strategi/ilustrasi, bukan SKU yang dijual terpisah; angka konfigurasi transaksi kedua menu tersebut bernilai nol dan tidak dipakai engine. Menu ayam serta adaptasi telur M11 memiliki transaksi nyata dalam simulasi.

Coach saat ini berupa penjelasan lokal yang deterministik. **Tidak membutuhkan API Google atau API key.** Belum ada endpoint AI live, rate limiter server, service worker/PWA offline, sinkronisasi cloud, atau impor sesi. Ekspor JSON tersedia untuk arsip. Membuka aplikasi pertama kali tetap membutuhkan server/jaringan; jangan mengklaim dukungan offline penuh.

Soal pre/post merupakan konten latihan buatan tim, belum instrumen tervalidasi. Skor keputusan dan alasan dilaporkan terpisah. Tes yang belum lengkap ditandai belum diukur; hasil pengujian otomatis bukan data peserta atau bukti dampak edukasi.

## AI Use and Third-Party Declaration

AI digunakan dalam proses pengembangan berikut:

| Alat/model | Penggunaan |
| --- | --- |
| ChatGPT/Codex | Penyusunan spesifikasi, konten latihan, engine, UI, pengujian, dan perbaikan kode |
| Gemini/Antigravity dan agent pen.dev | Bantuan pengerjaan desain, logo, ilustrasi, serta ekspor aset kanvas |
| Argon 4 | Dua putaran audit kode; enam temuan awal diperbaiki, lalu diperiksa ulang melalui analisis kode, CLI, dan browser berdasarkan laporan yang diserahkan tim |

Logo B dipilih tim; desain serta hasil bantuan AI ditinjau dalam proses pengembangan. Audit ulang melaporkan seluruh temuan awal FIXED dan tidak menemukan blocker dalam cakupannya. Ini tidak berarti aplikasi bebas bug. [Ringkasan audit](docs/ARGON_REVIEW.md).

Seluruh perhitungan permainan dijalankan fungsi TypeScript deterministik; tidak diserahkan kepada model AI. Versi runtime ini tidak mengirim data permainan ke layanan AI pihak ketiga.

Dependensi pihak ketiga tercatat di `package.json` dan `package-lock.json`. Nunito Sans menggunakan SIL Open Font License 1.1; salinan lisensi berada di `public/licenses/nunito-sans-OFL.txt`. Screenshot Good Pizza Great Pizza, Duolingo, dan Cashew hanya menjadi referensi desain dalam folder persiapan; tidak dibundel sebagai ilustrasi runtime. Sumber referensi tercatat di `design/references/SOURCES.md`.

Tim tetap bertanggung jawab meninjau kode, izin penggunaan aset, konten, dan deklarasi final. Blueprint serta panduan desain adalah bahan persiapan yang dibuat sebelum implementasi; tanggal kerja tidak boleh disamarkan sebagai bagian sprint resmi tanpa memeriksa Challenge Brief.

## Struktur source

| Lokasi | Isi |
| --- | --- |
| src/engine/ | Kontrak, validator runtime, ekonomi, replay, transisi demo, dan tes |
| src/data/ | Dua belas skenario, tujuh pool opsional, lima pasang soal, dan kamus |
| src/components/ | Komponen UI mengikuti desain pen.dev |
| src/services/ | Penyimpanan, skor tes, refleksi lokal, dan resolver aset |
| public/ | Logo, ilustrasi, serta lisensi font yang dibutuhkan runtime |
| docs/ | Catatan audit, pengujian, deployment, dan submission |
| design/ | Panduan desain dan sumber referensi; kanvas serta ekspor kerja disimpan lokal |

Dokumen riset awal, blueprint DOCX, PDF guidebook, kanvas `.pen`, dan paket kerja lama tetap tersimpan lokal tim. Dokumen tersebut bukan dependensi untuk menjalankan source publik. Bahan persiapan dibedakan dari implementasi sprint; waktu resmi dan batas pengumpulan mengikuti Challenge Brief panitia.

## Submission INCEPTION 2026

Checklist dan tautan artefak: [docs/SUBMISSION.md](docs/SUBMISSION.md). Video demo maksimal tiga menit, pitch deck, dan pengisian Devpost masih menjadi pekerjaan tim; keberadaan repository atau tag tidak membuktikan submission sudah dikirim.

## Tim

| Nama | Tanggung jawab |
| --- | --- |
| **Jonathan Christian Herutomo (Jona)** — [jojookun](https://github.com/jojookun) | Keseluruhan implementasi kode dan integrasi |
| **Muhammad Hanafi (Nafi)** | Persiapan dan pengujian demo produk/web |
| **Othniel Meishallom** | Hosting dan deployment |
