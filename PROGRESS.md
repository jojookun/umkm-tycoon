# Progres tim

## 1 November 2026, 05.43 WIB — main

- Memperbarui README dan docs/SUBMISSION.md dengan tautan video YouTube, pitch deck Google Drive, dan halaman proyek Devpost. Video 2:58, deck 10 slide, dan paket ZIP lokal sekitar 22,96 MB telah disiapkan; status penerimaan kompetisi tetap diperiksa melalui dashboard Devpost.
- Menambahkan alasan API AI live tidak diaktifkan: proxy backend dan pembatasan permintaan bersama belum tersedia, key rahasia tidak ditanam di frontend, serta coach lokal memakai hasil engine deterministik. Deklarasi bantuan AI selama pengembangan tetap dicantumkan.
- Verifikasi: tautan video dibaca dari embed halaman Devpost; tautan deck diberikan langsung oleh tim; diff dokumentasi dan whitespace diperiksa. Source coach dicocokkan dengan penjelasan README. Tes/lint/build lokal tidak dijalankan ulang karena perubahan hanya dokumentasi. Pemeriksaan ZIP, checksum source tag, PDF 10 halaman, dan durasi video telah dilakukan saat pengemasan sebelumnya.
- Keterbatasan: akses video/deck tanpa login belum diverifikasi ulang; keberadaan halaman proyek tidak membuktikan submission kompetisi diterima. Tag submission-24h dipertahankan. Berikutnya push dokumentasi, periksa file remote dan workflow, lalu tim memastikan status final Devpost.

## 31 Oktober 2026, 20.35 WIB — main

- Menambahkan tautan GitHub Muhammad Hanafi (Nafi): Yuuichi-Kun, dan Othniel Meishallom: Nako-chen di akhir README, sesuai screenshot pengguna.
- Memperjelas bahwa deployment mengikuti main dan tag submission-24h tetap menyimpan snapshot awal.
- Verifikasi: kedua profil GitHub berhasil dibaca dan cocok dengan nama pada screenshot; diff dokumentasi diperiksa. Tes aplikasi tidak dijalankan ulang karena tidak ada perubahan kode.
- Publikasi sebelumnya berhasil: workflow build/deploy lulus, smoke test publik lulus, serta tag/release submission-24h telah diterbitkan. Berikutnya push pembaruan dokumentasi ini dan periksa README remote.
- Sisa pekerjaan tim: video demo, pitch deck, dan pengiriman Devpost.

## 31 Oktober 2026, 20.32 WIB — main

- Menyiapkan publikasi pertama source Tahan Banting: UMKM Tycoon, termasuk perbaikan enam temuan Argon dan desain Concept B.
- Melengkapi README, deklarasi AI/pihak ketiga, ringkasan audit, panduan deployment, dan checklist submission. Identitas tim di akhir README: Jonathan Christian Herutomo, Muhammad Hanafi, dan Othniel Meishallom beserta pembagian tugas yang disepakati.
- Menambahkan workflow verifikasi/deployment GitHub Pages serta base path aset untuk `/umkm-tycoon/`. Bahan riset lokal, kanvas, gambar referensi pihak ketiga, dan rahasia tidak disertakan dalam source distribusi.
- Verifikasi lokal: lint dan typecheck lulus; 32 tes pada enam berkas lulus; dry-run tiga profil tidak berubah; build root dan sub-path lulus; audit dependensi produksi melaporkan nol kerentanan. Pemeriksaan pola kredensial pada berkas publik tidak menemukan kecocokan. Bukti uji browser dan audit sebelumnya diringkas dalam docs.
- Status sebelum push ini: GitHub Pages telah diaktifkan; deployment publik belum diuji. Berikutnya push source, tunggu workflow, lakukan smoke test publik, kemudian terbitkan tag/release `submission-24h` pada commit yang sama bila lulus.
- Sisa pekerjaan tim: video demo maksimal tiga menit, pitch deck, konfirmasi waktu Challenge Brief, dan pengiriman Devpost. Belum diklaim terkirim.
