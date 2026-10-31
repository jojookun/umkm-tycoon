# Checklist Hacking Day INCEPTION 2026

Guidebook diperiksa ulang dari [tautan resmi yang diberikan tim](https://drive.google.com/file/d/1RhtAFwqnqXbLU9rg4omom7Egb9pFr9Bl/view) pada 31 Oktober 2026. PDF 12 halaman, SHA-256 `8b6ed1a321ec315466e236f08455dd0192efa40dc06151f1515002f10890c5c6`. Halaman 9 mencantumkan artefak akhir sprint: produk yang dapat diuji, repository publik, README beserta deklarasi AI/pihak ketiga, tag rilis, video demo, dan pitch deck.

| Artefak | Lokasi |
| --- | --- |
| Produk web | https://jojookun.github.io/umkm-tycoon/ |
| Source publik | https://github.com/jojookun/umkm-tycoon |
| README dan deklarasi AI/pihak ketiga | https://github.com/jojookun/umkm-tycoon/blob/main/README.md |
| Tag snapshot | https://github.com/jojookun/umkm-tycoon/tree/submission-24h |
| Release | https://github.com/jojookun/umkm-tycoon/releases/tag/submission-24h |
| Video demo maksimal 3 menit | [Demo 2:58 di YouTube](https://www.youtube.com/watch?v=dfCQhcIpuFA) |
| Pitch deck | [Presentasi final 10 slide di Google Drive](https://docs.google.com/presentation/d/1TrEqaCiC_fU58jjOyPGCaSd4XCkAUJCH/edit) |
| Halaman proyek Devpost | https://devpost.com/software/tahan-banting-umkm-tycoon |
| Pengiriman kompetisi | Tim menyatakan seluruh tautan telah dilengkapi; pengiriman dan penerimaan akhir diperiksa melalui dashboard Devpost |

## Pembaruan artefak — 1 November 2026

Video final lokal berdurasi 177,91 detik, Full HD, dengan suara presenter asli dan penanda bagian. URL YouTube di atas terbaca sebagai video yang disematkan pada halaman proyek Devpost. Pitch deck final berisi 10 slide; PDF, PPTX, naskah presentasi, catatan sumber, dan checklist fakta telah tersedia. Tautan presentasi Drive diberikan oleh tim. Hak akses tanpa login pada kedua layanan belum diperiksa ulang dalam sesi pembaruan dokumentasi ini; tim perlu memastikan juri dapat membukanya.

ZIP untuk kolom Upload a File telah disiapkan lokal: `UMKM_Tycoon_INCEPTION2026_Submission.zip`, sekitar 22,96 MB (batas form 35 MB). Isinya source persis dari tag `submission-24h`, dokumentasi terbaru termasuk deklarasi AI, deck final, video, media galeri, serta bahan persiapan historis yang diberi label. Integritas ZIP dan checksum isinya telah diperiksa. ZIP/media kerja tidak dimasukkan ke source repository; tautan publik artefak menjadi rujukan pengumpulan. Keberadaan ZIP lokal tidak membuktikan file telah diunggah ke Devpost.

README menjelaskan keputusan tidak mengaktifkan API AI live: belum ada backend/proxy dan pembatasan permintaan bersama; key rahasia tidak ditanam di frontend. Coach lokal memakai hasil engine deterministik. AI untuk membantu pengembangan tetap diungkapkan pada deklarasi.

Tag `submission-24h` mempertahankan snapshot source awal dan tidak dipindahkan untuk pembaruan dokumentasi. Deployment mengikuti `main`; pembaruan setelah tag sejauh ini hanya dokumentasi/progres. Link workflow/Pages adalah bukti proses deployment, bukan bukti panitia telah menerima submission. Waktu resmi sprint dimulai dari rilis Challenge Brief; jangan mengasumsikan pukul 12.00 WIB sebagai batas resmi tanpa pengumuman panitia.
