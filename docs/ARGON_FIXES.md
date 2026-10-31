# Perbaikan audit Argon — 31 Oktober 2026

> Catatan historis pada tahap ini. Hasil audit independen berikutnya tersedia di [ARGON_REVIEW.md](ARGON_REVIEW.md); status publikasi mengikuti README dan workflow GitHub.

Enam temuan diperbaiki pada runtime. Ini hasil perbaikan dan pemeriksaan ulang oleh implementor, bukan klaim bahwa Argon telah menyetujui patch.

| Temuan | Perbaikan | Hasil rerun |
| --- | --- | --- |
| P1 replay tanpa QRIS/WA | Keputusan lanjutan disalin, lalu kanal yang tidak tersedia dimatikan. Aksi unlock pada minggu lanjutan tetap dihormati. Snapshot baseline tidak diubah. | Playground: replay M4 tanpa QRIS sampai M8 berhasil, kas Rp1.583.900. Replay M5 tanpa WA sampai M8 berhasil, kas Rp1.640.700. Tes otomatis juga menghitung sampai M12 dan memeriksa save hasil penerapan. |
| P1 demo kekurangan modal saat melompat | Transisi dipusatkan di advanceAfterDebrief. Jika minggu perantara gagal, hanya minggu sebelumnya yang berhasil dikomit; pemain berhenti pada fase decision minggu gagal. | Kasus Argon direproduksi persis: kas M4 Rp708.250; kekurangan M5 Rp83.750. Kembali ke keputusan membuka kontrol M5. Stok80 berhasil dengan kas akhir Rp738.250. |
| P2 stok/menu M11–M12 | Sidebar keputusan mengikuti menu yang dipilih; debrief menjumlahkan stok semua menu. Bahan menu lain diberi label terpisah. continueToDecision mengembalikan menu ayam. Storage mengikuti transisi yang sama. | Playground dan tes: 17,5 porsi ayam tersisa sebelum telur; setelah M11 terbawa8,75. Sidebar debrief dan keputusan M12 menampilkan8,75; reload memulihkannya. |
| P2 promo/diskon telur | Sesuai blueprint: bahan telur Rp4.200, HPP Rp7.500, harga tetap Rp11.000. Grosir ayam tidak diterapkan. Memilih telur mematikan promo dan menonaktifkan kontrolnya; engine menolak promo telur. | Target145 menampilkan Rp7.500 pada label dan drawer. Promo tidak dapat dipilih. Tes engine memastikan tidak ada kenaikan demand gratis dan state gagal tidak termutasi. |
| P2 tombol rapor | Tombol Kembali ke rapor menutup details, memfokuskan judul rapor, dan menggulir ke atas. | Playground: detailsClosed=true, focus=report-title, scrollY=0. |
| P2 validasi simpanan | State awal dibandingkan dengan initialState kanonik; rentang/decision/result/after cabang diperiksa. | Tes menolak saldo awal Rp500juta, unlock awal palsu, histori yang dihitung dari awal palsu, dan metadata cabang yang tidak konsisten. Preset serta replay sah tetap lolos. |

## Versi dan kompatibilitas

Content version naik menjadi `2026.10.31.2` pada scenarios, config, assessment, dan glossary. Schema tetap2.2.0. Simpanan konten sebelumnya ditandai tidak kompatibel dan tetap tersedia untuk ekspor sebelum reset terkonfirmasi. Tidak ada migrasi saldo atau penimpaan otomatis.

Aturan telur dikunci sesuai blueprint8.6. Harga dan HPP tetap bukan berarti promo boleh menaikkan demand tanpa biaya: promo tidak berlaku untuk adaptasi ini.

## Verifikasi

- Lint, typecheck, 30 pengujian pada lima berkas, dan build produksi lulus. Audit dependensi melaporkan nol advisory pada saat rerun.
- Dry-run tiga profil dijalankan ulang. Baseline seimbang tetap berakhir Rp1.741.100, konservatif Rp2.298.100, dan kebijakan ceroboh tetap terhambat modal M4; patch tidak mengubah baseline tersebut.
- Tes mencakup fungsi transisi demo yang dipakai App, kanal replay sampai M12, pembayaran/ekonomi lama, simpanan, dan render sidebar persediaan.
- Playground menggunakan sesi terpisah di `http://127.0.0.1:5174/`, sehingga data pengujian lama pada5173 tetap terpisah.
- Setelah reload M12, stok ayam8,75 porsi tetap muncul dan tidak ada error/warning browser pada sesi uji tersebut.
- Belum ada audit ulang independen Argon, deployment, push GitHub, atau tag submission dari patch ini.

Saran audit ulang: fokus pada enam lokasi perubahan dan kasus regresi ini. Dukungan deployment sub-path, perangkat fisik, dan pembaca layar tetap di luar bukti rerun ini.
