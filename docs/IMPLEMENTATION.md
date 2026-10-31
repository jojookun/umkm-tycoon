# Catatan implementasi — 31 Oktober 2026

> Catatan historis pada tahap ini. Hasil audit independen berikutnya tersedia di [ARGON_REVIEW.md](ARGON_REVIEW.md); status publikasi mengikuti README dan workflow GitHub.

## Yang dibangun

React + Vite + TypeScript + Tailwind CSS menerapkan identitas logo B, warna, Nunito Sans, panggung asli pen.dev, dashboard responsif, HPP, pembiayaan, debrief, replay, assessment, dan rapor. Layout diterjemahkan menjadi komponen interaktif, bukan screenshot halaman yang dijadikan UI.

Engine menjalankan transaksi pada salinan state: event, DP/pinjaman, servis dan pembelian bahan, alokasi produksi, penjualan, pembayaran kewajiban, FIFO/waste, transfer dompet, indikator, dan snapshot. Keputusan yang gagal tidak mengubah state utama. Perubahan nilai persediaan tidak dipotong lagi dari kas.

## Hasil pemeriksaan

- ESLint dan TypeScript: lulus.
- Vitest: 21 pengujian dalam tiga berkas lulus. Cakupan meliputi baseline 12 minggu, katering, pinjaman M13, pembayaran parsial, FIFO, kanal, overload, menu telur, replay, data rusak, konflik revisi, penyimpanan ditolak, dan skor tes terpisah. Kas juga direkonsiliasi pada variasi kebijakan di dalam tes.
- Build produksi: lulus, menghasilkan `dist`.
- Audit dependensi setelah pembaruan minimatch: nol advisory pada saat diperiksa. Override minimatch 11.0.1 menutup [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249); lint, build, dan tes diulang setelah override.
- Browser: sesi penuh dijalankan M1–12 hingga rapor, termasuk lima jawaban pre-test dan lima jawaban post-test dengan input pengujian buatan. Kas akhir jalur seimbang Rp1.741.100; cadangan nol setelah servis; kepercayaan/kondisi pekerja 80. Ini bukti teknis alur, bukan hasil riset pengguna.
- Browser: M8 baseline Rp1.690.400; alternatif Si Cepat Cair Rp1.840.400, cadangan Rp300.000, kewajiban Rp600.000. Preview tidak mengganti baseline; tombol konfirmasi menerapkan cabang. Reload memulihkan sesi.
- Compact: viewport CSS 360 px diperiksa; tidak ada overflow horizontal pada dashboard. Nominal harga memakai pemisahan awalan Rp dan angka utuh bila ruang sempit. Drawer HPP diperiksa dan ditutup melalui tombolnya.

## Keputusan integrasi

`src/engine/types.ts` menambah `WeekDecision.loanType?` agar pilihan Formal/Si Cepat Cair bertahan dalam snapshot dan replay, serta `INVALID_STATE` untuk state rusak. Sumber arsip tidak ditimpa. Konten, validator, UI, dan engine memakai kontrak runtime yang sama.

Cadangan dapat dipakai lewat respons servis M8, lalu sisa kebutuhan dibayar kas. Setoran pribadi ke usaha tidak disediakan karena belum ada aksi kanonik. Sistem tidak memindahkan uang pribadi secara otomatis.

UI menghitung HPP bahan baru sesuai menu, inflasi, dan diskon stok. Pembelian aktual memperhitungkan lot lama. Selisih pembulatan waste dihitung dari perubahan nilai lot agar tidak menghitung nilai bahan dua kali.

## Batas yang masih perlu ditangani

- Belum ada audit independen Argon 4, user testing, pengujian pembaca layar, atau pengujian lintas browser/perangkat fisik.
- Belum ada deployment publik, commit/push, tag `submission-24h`, video, atau pitch deck dari pekerjaan implementasi ini.
- Belum ada PWA/service worker. Coach lokal aktif; API AI live sengaja belum diaktifkan. Tidak ada key yang perlu dimasukkan ke frontend.
- Pool tujuh event ada di engine tetapi tidak diaktifkan pada UI. Mitigasi event pengganti memakai aksi servis/bantuan yang sama dalam engine; acceptance utama tetap pool mati.
- Jika modal minimum tidak lagi terbiayai sebelum M12, UI memberi validasi dan opsi revisi/replay yang tersedia; belum ada tombol terminasi dini khusus. Label hasil akhir multidimensi dihitung pada M12.
- Lettering logo SVG arsip belum outline; runtime memakai PNG terpilih dan simbol SVG yang tidak memerlukan font.
- Tidak ada impor sesi JSON. Ekspor adalah arsip; pemulihan runtime berasal dari simpanan browser yang lolos validasi.

## Langkah tim berikutnya

Jona meninjau perubahan dan menjalankan alur selain baseline; Nafi melatih demo empat checkpoint; Othniel menyiapkan hosting statis dari `dist`. Sebelum push, buat catatan terbaru di `PROGRESS.md` pada repository yang benar sesuai aturan tim. Catatan ini tidak membuktikan push atau deployment telah dilakukan.
