# Pengujian playground — 31 Oktober 2026

Pengujian dilakukan melalui UI aplikasi hasil build, bukan dengan mengubah localStorage atau mengetik saldo preset. Sesi penuh terpisah memakai origin localhost:5173 agar tidak menimpa simpanan 127.0.0.1:5173. Seluruh jawaban assessment adalah input pengujian buatan, bukan data peserta.

## Jalur demo dan keputusan ceroboh

| Pemeriksaan | Hasil aktual |
| --- | --- |
| M8: stok 145, harga Rp12.000, tunda servis | Terjual 120; kas Rp1.498.900; waste 22,5 porsi/Rp155.250; persediaan dibawa 2,5 porsi. Tidak ada overload karena produksi dibatasi kapasitas aman. |
| Replay M8: stok 110, harga Rp14.000, pinjaman mahal | Preview kas Rp1.840.400, cadangan Rp300.000, kewajiban Rp600.000. Kas utama tetap Rp1.498.900 sebelum konfirmasi. |
| Terapkan cabang lalu lanjut sampai M12 | Empat cicilan Rp150.000 lunas; kas akhir Rp1.291.100, cadangan Rp300.000, utang nol. |
| Jalur ceroboh M1–M3, stok145/harga12rb/draw100rb | Kas M3 Rp661.000. M4 ditolak dengan kekurangan Rp218.750; saldo tetap Rp661.000. |
| Replay M1–M3 dengan tambahan transfer cadangan Rp100.000 di M1 | Gagal di M3 dengan kekurangan Rp46.000; save utama tetap sama. |
| Turunkan stok M4 ke 80 setelah validasi gagal | Minggu berhasil dijalankan; kas akhir Rp657.000. Reload memulihkan debrief M4 dan saldo yang sama. |

## Jalur normal lengkap dengan variasi keputusan

Pre-test lima soal diselesaikan, kemudian onboarding dan setiap minggu dijalankan secara berurutan tanpa lompatan demo.

| Minggu | Keputusan yang diuji | Kas akhir usaha |
| --- | --- | --- |
| 1 | Pisah kas; sisihkan Rp50.000 | Rp1.524.500 |
| 2 | Drawer HPP; draw Rp50.000 dan cadangan Rp50.000 | Rp1.453.000 |
| 3 | Stok145, harga Rp16.000, cadangan Rp50.000 | Rp1.169.450 |
| 4 | Aktifkan QRIS; cadangan Rp50.000 | Rp1.502.850 |
| 5 | Aktifkan WA; cadangan Rp50.000 | Rp1.587.850 |
| 6 | Strategi wedang saat hujan; cadangan Rp50.000 | Rp1.608.650 |
| 7 | Kerja sama Bu Ratna; 40 katering + 70 reguler | Rp1.783.750 |
| 8 | Servis dengan pinjaman Si Cepat Cair | Rp1.918.750 |
| 9 | Pinjaman kedua ditolak; lalu pilih verifikasi pembayaran | Rp1.903.750 |
| 10 | Stok145/harga12rb/promo/lembur tanpa bantuan | Rp1.474.750; trust70, wellbeing60 |
| 10 replay | Bantuan pekerja Rp100.000, kapasitas aman160 | Rp1.374.750; trust80, wellbeing80; diterapkan setelah konfirmasi |
| 11 | Menu telur; harga ayam tersembunyi, HPP Rp7.500 | Rp1.359.750 |
| 12 | Kembali ayam, shock akhir, cicilan terakhir | Rp998.450 |

Rapor akhir: Stabil & Dipercaya, kas Rp998.450, cadangan Rp300.000, pribadi Rp450.000, kewajiban dan tunggakan nol, trust/wellbeing80. Saldo ini berasal dari jalur variasi di atas, bukan baseline seimbang.

Replay lintas M8–M12 mengganti pinjaman mahal menjadi formal: kas alternatif Rp1.130.450, selisih +Rp132.000. Cabang hanya dipreview lalu ditutup; hasil utama tidak diganti.

## Penyimpanan dan alur pendukung

- Tab kedua dibuka di M2, kemudian tab pertama menjalankan minggu. Tab kedua menampilkan konflik revisi dan memblokir tombol jalankan. Muat simpanan terbaru memulihkan saldo Rp1.453.000 tanpa menimpa tab pertama.
- Tombol simpan jawaban tidak aktif sebelum jawaban dan alasan dipilih.
- Post-test dilewati terlebih dahulu: rapor menampilkan belum diukur, bukan nilai nol. Tes kemudian dibuka kembali dan kelima soal diselesaikan.
- Kamus warung terbuka; Escape menutup dialog.
- Main Lagi membuka konfirmasi; Batal mempertahankan rapor.
- Ekspor sesi berhasil diunduh. Salinan pengujian ada di `qa/normal-full-session.json` dan diperiksa dengan validator runtime: full, 12 snapshot, currentWeek13, masing-masing lima jawaban pre/post.

## Perbaikan dari temuan pengujian

- Tambah akses Riwayat & Replay saat memilih keputusan dan pada pesan validasi modal agar pemain dapat memperbaiki minggu sebelumnya sebelum akhir sesi.
- Samakan label HPP dengan diskon grosir saat target145; label dan drawer kini sesuai.
- Ubah label persediaan pada debrief menjadi Persediaan dibawa, bukan Persediaan awal.
- Setelah perubahan: lint, 21 tes, typecheck melalui build, dan build produksi lulus. Pengujian UI di atas memakai build yang diperbarui.

## Batas bukti

Ini pemeriksaan alur dan beberapa kombinasi keputusan, bukan pengujian seluruh kombinasi matematis 12 minggu, semua browser, atau semua perangkat. Penyimpanan ditolak/rusak diuji pada unit test; tidak dimanipulasi melalui browser pada putaran ini. Tidak ada audit independen Argon, deployment, push, atau penelitian dampak edukasi yang dilakukan oleh pengujian ini.
