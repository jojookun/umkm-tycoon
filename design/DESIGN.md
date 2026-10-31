---
version: alpha
name: Dapur Sari
description: Panduan desain Tahan Banting UMKM Tycoon untuk pen.dev dan implementasi MVP berdasarkan blueprint v2.2.
colors:
  background: "#FBF6EC"
  surface: "#FFFCF6"
  surface-muted: "#F0E7D8"
  foreground: "#30251E"
  foreground-muted: "#6D5C4D"
  primary: "#A3432B"
  primary-hover: "#873521"
  on-primary: "#FFFFFF"
  secondary: "#365E43"
  secondary-soft: "#E6EEDC"
  outline: "#8B7765"
  divider: "#D9CCB9"
  warning: "#805318"
  warning-soft: "#FFF0CB"
  danger: "#A12C32"
  danger-soft: "#FBE7E5"
  focus: "#30251E"
typography:
  title:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.15
  heading:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.25
  subheading:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
  caption:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.45
  money:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.25
rounded:
  control: 12px
  panel: 16px
  sheet: 24px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  section: 32px
components:
  canvas:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  mobile-frame:
    width: 390px
    height: 844px
    padding: "{spacing.lg}"
  compact-frame:
    width: 360px
    height: 800px
  desktop-frame:
    width: 1440px
    height: 900px
    padding: "{spacing.xl}"
  laptop-frame:
    width: 1366px
    height: 768px
  shell:
    width: 1120px
  desktop-sidebar:
    width: 320px
  primary-button:
    height: 48px
    rounded: "{rounded.control}"
    typography: "{typography.label}"
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  primary-button-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  panel:
    padding: "{spacing.lg}"
    rounded: "{rounded.panel}"
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  secondary-panel:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.foreground}"
  selected-choice:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.secondary}"
  field:
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    backgroundColor: "{colors.surface}"
  caption:
    typography: "{typography.caption}"
    textColor: "{colors.foreground-muted}"
  page-title:
    typography: "{typography.title}"
    textColor: "{colors.foreground}"
  event-title:
    typography: "{typography.heading}"
    textColor: "{colors.foreground}"
  group-title:
    typography: "{typography.subheading}"
    textColor: "{colors.foreground}"
  wallet-total:
    typography: "{typography.money}"
    textColor: "{colors.foreground}"
  drawer:
    width: 440px
    rounded: "{rounded.sheet}"
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  warning-banner:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
  error-banner:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
  divider-line:
    height: 1px
    backgroundColor: "{colors.divider}"
  outline-line:
    height: 1px
    backgroundColor: "{colors.outline}"
  focus-ring:
    width: 3px
    backgroundColor: "{colors.focus}"
---

## Overview

Tahan Banting: UMKM Tycoon adalah simulasi keputusan usaha selama dua belas minggu. Pemain mengelola Dapur Sari melalui stok, harga, kanal penjualan, cadangan, dan respons krisis. Sasaran utamanya pelaku UMKM pemula serta calon wirausaha; angka dan konsekuensi harus terbaca tanpa penjelasan developer.

Arah yang disepakati menggabungkan panggung warung dan karakter Good Pizza, Great Pizza, kejelasan progres belajar Duolingo, serta pengelompokan uang Cashew. Buat identitas Indonesia melalui warung makan, makanan, karakter, dan properti yang sesuai blueprint. Gunakan ilustrasi sebagai konteks keputusan, sedangkan teks dan angka berada pada permukaan yang tenang.

Dokumen ini menetapkan desain baru Dapur Sari. Token merupakan keputusan desain untuk proyek ini, bukan ukuran atau warna yang diekstrak dari produk referensi. Blueprint v2.2 beserta types.ts menentukan mekanik dan nama state; desain tidak menambah rumus, hadiah, saldo, atau fitur baru. Detail ukuran kanvas dan motion yang tidak tercakup token standar tersedia pada PENDEV_HANDOFF.md.

Karakter visual: hangat, mudah didekati, dan cukup dewasa untuk dipresentasikan kepada pelaku usaha. Energi seimbang, ritme teratur, gerak rendah. Gunakan tema terang untuk MVP; tidak perlu menambah pengalih tema.

## Colors

Gunakan krem sebagai latar aplikasi dan surface sebagai tempat membaca keputusan atau uang. Terakota menandai tindakan utama; hijau daun menandai pilihan aktif atau kondisi sehat. Jangan mengubah seluruh layar menjadi merah ketika usaha kesulitan.

Primary memakai pasangan on-primary. Body dan angka memakai foreground; caption memakai foreground-muted pada latar terang. Garis divider hanya memisahkan kelompok, sedangkan outline menandai kontrol yang bisa dioperasikan. Field kosong tetap memiliki batas yang terlihat.

Gunakan danger bersama ikon dan label untuk kekurangan kas atau kesalahan. Warning menyatakan risiko sebelum keputusan. Jangan memakai merah untuk setiap arus kas keluar: pembelian bahan dan transfer cadangan adalah aktivitas usaha yang wajar. Gunakan tanda nominal serta label penyebab untuk membedakannya.

Hijau bukan bukti bahwa pilihan selalu benar. Jangan memberi tanda jawaban benar pada opsi strategi sebelum engine menghasilkan konsekuensinya.

## Typography

Gunakan Nunito Sans untuk heading, dialog, kontrol, dan angka; fallback ke Segoe UI lalu sans-serif. Simpan font secara lokal saat implementasi PWA jika tersedia dan berlisensi, agar offline tidak bergantung unduhan font. Jangan menjadikan pemuatan font syarat tampilnya game.

Judul produk memakai title; judul kejadian memakai heading; nama kelompok memakai subheading. Body untuk narasi, label untuk kontrol, caption hanya untuk metadata. Money untuk saldo utama, dengan tabular numerals agar kolom tidak bergeser ketika nominal berubah.

Format nominal memakai lokal Indonesia tanpa pecahan rupiah: Rp1.600.000. Jangan menyingkat saldo utama menjadi 1,6 jt. Jika sempit, pindahkan susunan dompet atau bungkus label; jangan memotong nominal atau mengecilkan angka secara ekstrem.

Rata kiri untuk narasi dan label; rata kanan untuk kolom nominal transaksi. Tebal menekankan angka dan tindakan, bukan seluruh paragraf. Hindari huruf kapital penuh pada dialog dan penjelasan finansial.

## Layout

### Prinsip komposisi

Susun dashboard menurut urutan baca: minggu aktif dan mode, dompet, indikator, panggung kejadian, pilihan respons, keputusan operasional, lalu tombol jalankan minggu. Tampilkan satu aksi utama per tahap. Mode demo memakai label teks yang selalu terlihat.

Gunakan ruang antar-kelompok yang lebih besar daripada ruang label dengan nilainya. Saldo menjadi satu kelompok berisi Kas Usaha yang dominan, Uang Pribadi sebagai pembanding, serta Cadangan Usaha dan Utang sebagai rincian. Hindari membuat setiap angka menjadi kartu terpisah.

### HP

Mulai dari komponen mobile-frame dan compact-frame. Gunakan satu kolom dengan urutan yang sama pada semua minggu. Di layar kecil, empat indikator dibagi dua baris agar nama dan nilainya tidak berdesakan.

Panggung gambar berada di header kartu kejadian. Dialog boleh memanjang mengikuti teks; batas tinggi gambar di handoff tidak membatasi teks. Tombol jalankan berada pada footer lengket dengan safe-area dan ruang bawah konten yang cukup, sehingga tidak menutupi pilihan terakhir.

Utamakan keputusan terlihat tanpa scroll panjang, tetapi izinkan scroll vertikal normal ketika teks membesar, keyboard terbuka, atau kejadian memerlukan penjelasan tambahan. Jangan memaksakan semua isi ke satu viewport dengan font kecil atau teks terpotong.

### Laptop

Gunakan desktop-frame dan laptop-frame, dengan lebar maksimum shell. Di atas breakpoint desktop pada handoff, pisahkan ringkasan usaha di kolom kiri dan area kejadian/keputusan di kolom utama. Pertahankan urutan baca DOM dan urutan keyboard yang masuk akal.

Di bawah breakpoint desktop kembali ke satu kolom. Jangan memperbesar layout HP menjadi kolom sempit di tengah laptop sambil menyisakan sebagian besar layar kosong. Tambahan ruang digunakan untuk memperjelas panggung dan hasil, tanpa menambah kontrol baru.

### Enam layar utama

| Layar | Isi dan hierarki | Aksi utama |
| --- | --- | --- |
| Landing | Nama Tahan Banting, subjudul Dapur Sari, ilustrasi warung, satu kalimat tujuan dan durasi sesi | Mulai 12 Minggu; Mode Demo Juri sebagai pilihan sekunder |
| Pre-test | Satu situasi, pilihan keputusan, alasan, confidence, dan progres soal | Simpan Jawaban; aktif setelah isian wajib lengkap |
| Onboarding | Dimas meminta kebutuhan keluarga; tunjukkan asal uang dan pembagian dompet secara jelas | Pisahkan Kas; tidak menggandakan saldo awal |
| Dashboard | Dompet, empat indikator, kartu kejadian terpadu, respons dan pengaturan operasional | Jalankan Minggu Ini |
| Debrief | Kas awal/akhir, transaksi penyebab, waste sebagai nilai bahan, perubahan kondisi, dan refleksi | Lanjut Minggu; Coba Keputusan Lain sebagai sekunder |
| Rapor dan post-test | Outcome, kas dan kewajiban termasuk cicilan sesudah akhir sesi, Trust, wellbeing, serta perbandingan tes | Kerjakan Post-test; setelah selesai tampilkan ringkasan |

Outcome mengikuti engine. Konservatif yang sehat tidak otomatis dinilai buruk karena hanya memakai tunai. Saat tes dilewati pada demo, tampilkan Belum diukur, bukan skor nol.

## Elevation & Depth

Dashboard memakai bidang datar dengan batas atau perbedaan surface. Simpan shadow untuk drawer dan dialog yang menutupi konteks. Panggung warung dapat memiliki bayangan ilustratif lembut, tetapi jangan membayangi semua komponen UI.

Primary button memiliki batas bawah terakota gelap agar terlihat dapat ditekan. State pressed merapatkan batas bawah tanpa menggeser layout. Bedakan panel pilihan melalui radio/check dan outline, bukan hanya elevasi.

## Shapes

Pakai radius control pada tombol, input, dan pilihan; panel untuk kelompok utama; sheet untuk drawer. Bentuk pill hanya untuk indikator mode atau status singkat yang memang membutuhkan bentuk tersebut. Jangan memakai bentuk koin atau diamond untuk uang usaha.

Ilustrasi memakai kontur cokelat dengan bidang warna sederhana. Sudut properti boleh organik, tetapi teks, angka, tabel, dan alignment tetap presisi. Motif lurik cukup pada celemek atau tepi panggung; jangan menghamparkan pola di belakang angka.

## Components

### Ringkasan dompet dan indikator

Label wajib: Kas Usaha, Uang Pribadi, Cadangan Usaha, Utang. Jangan menjumlahkan keempatnya menjadi satu angka uang bebas pakai. Jika menampilkan Aman Dipakai, nilai harus berasal dari selector engine yang disepakati; hilangkan barisnya bila belum tersedia.

Empat indikator mengikuti data nyata engine: Ketersediaan Stok, Pelanggan Terlayani, Kepercayaan Pelanggan, dan Kondisi Pekerja. Stok = unit siap tersedia terhadap target; Pelanggan Terlayani = penjualan reguler terhadap permintaan reguler, dengan label Tidak ada permintaan bila penyebut nol. Dua indikator terakhir memakai trustScore dan wellbeingScore. Gunakan label dan nilai numerik; bar tidak boleh menjadi sumber informasi satu-satunya.

Saldo nol tetap angka biasa. Kas tidak cukup menampilkan besaran kekurangan dan tindakan yang tersedia, bukan layar gagal otomatis.

### Panggung warung dan kartu kejadian

Gunakan Sari dan karakter yang sedang relevan, bukan menampilkan seluruh pemeran bersamaan. Warung menggunakan meja saji, kaleng kerupuk, buku nota, porsi nasi, dan celengan; standee QRIS hanya tampak ketika state kanal aktif.

Pertahankan sembilan ID karakter blueprint: sari_pertiwi, kang_deden, dimas, haji_bambang, bu_ratna, mbak_nisa, pak_rt_karso, mas_raka, si_cepat_cair. Identitas dan perannya mengikuti blueprint. Raut wajah menjelaskan kondisi; jangan menjadikan karikatur budaya sebagai lelucon.

Susun kartu menjadi nama pembicara, dialog singkat, judul masalah, fakta biaya/risiko, lalu pilihan respons. Biaya servis dan total kewajiban pinjaman harus terlihat sebelum pilihan dijalankan. Untuk pinjaman, tampilkan pokok, biaya, total pembayaran, dan cicilan; jangan menyembunyikan biaya di tooltip.

Gunakan ilustrasi SVG baru untuk produk. Gambar produk referensi hanya berada di papan inspirasi.

### Pilihan dan input operasional

Pilihan A/B/C memakai radio card dengan judul tindakan dan akibat yang diketahui. State meliputi default, hover, focus-visible, selected, disabled, dan validation error. Opsi tidak terpilih tetap terbaca; opsi terpilih memiliki ikon centang dan outline agar tidak bergantung warna.

Stok memakai pilihan target rendah, sedang, tinggi; harga memakai tiga opsi kanonik. Tampilkan satuan porsi dan rupiah pada label. Checkbox QRIS/WA harus membedakan belum diaktifkan, aktif, dan gangguan sementara. Promo mengungkap potongan harga efektif sebelum konfirmasi.

Owner draw dan transfer cadangan adalah kontrol sekunder dalam rincian operasional. Biarkan bisa ditemukan tanpa menutupi aksi utama. Saat adaptasi telur aktif, ganti tampilan harga sesuai kontrak; jangan tetap menampilkan slider ayam seolah berlaku untuk telur.

### HPP drawer

Pemicu bertuliskan Lihat Biaya Sebenarnya dengan nilai HPP menu aktif. Drawer memuat komponen biaya, penjumlahan, dan penjelasan biaya tetap yang terpisah. Jangan mempertahankan angka ayam ketika menu aktif berbeda.

Pada HP buka dari bawah; pada desktop gunakan dialog atau panel dengan lebar drawer pada token. Heading, tombol tutup, scroll isi, Escape, focus trap, dan pengembalian fokus ke pemicu wajib tersedia. Di balik dialog, konten tidak dapat dioperasikan sampai ditutup.

### Debrief dan replay

Gunakan daftar rekonsiliasi Kas Awal → Penerimaan → Pengeluaran → Kas Akhir. Baris waste diberi label Nilai Bahan Terbuang dan dipisah dari uang keluar karena bukan pemotongan kas kedua. Owner draw dan transfer cadangan diberi label Pemindahan Uang.

Replay memuat label Coba Keputusan Lain, baseline dan alternatif, serta selisih kas/utang/waste/indikator. Awali dengan perbandingan kas lalu rincian lain yang relevan. Hasil percobaan tidak menimpa progres utama tanpa tindakan Gunakan Keputusan Ini. Cabang tidak terbiayai menunjukkan sebab dan membiarkan pemain kembali.

Saat penggunaan alternatif membuang hasil minggu berikutnya, dialog menjelaskan mulai minggu mana progres dihitung ulang. Event replay tidak berubah untuk mengejar hasil yang lebih menguntungkan.

### Coach dan penilaian

Mas Raka muncul sesudah hasil deterministik tersedia, pada jadwal blueprint. Jangan menghalangi tombol lanjut sambil menunggu AI. Gunakan status Menyiapkan penjelasan dan fallback yang tetap berguna. Label Penjelasan otomatis cukup; hindari memberi kesan AI menentukan hasil.

Pre/post-test menampilkan keputusan, alasan, confidence, dan waktu aktif tanpa timer kompetitif yang menekan pengguna. Confidence bukan jawaban benar. Pada rapor, tampilkan peningkatan keputusan dan alasan secara terpisah; jangan mengklaim literasi meningkat hanya karena bermain atau cepat menjawab.

### Status yang harus didesain

| State | Perilaku dan teks |
| --- | --- |
| Belum ada save | Tawarkan Mulai Main; jangan tampilkan dashboard kosong tanpa tindakan |
| Turn diproses | Tombol Menjalankan Minggu… dinonaktifkan untuk mencegah klik ganda |
| Modal kerja kurang | Kas kurang Rp… untuk keputusan ini. Ubah Stok atau tindakan lain yang memang tersedia |
| Cadangan nol | Belum ada cadangan; jelaskan jika telah dipakai untuk krisis tanpa menyalahkan pemain |
| Penyimpanan gagal | Banner Progres belum tersimpan; sesi tetap berjalan di memori |
| Save rusak/beda versi | Jelaskan save tidak dapat dimuat; jangan menimpa sebelum memilih Mulai Baru |
| Coach offline/timeout | Gunakan fallback; tidak memunculkan error layar penuh |
| Minggu selesai | Tampilkan hasil dan Lanjut Minggu; minggu hanya maju sekali |
| Demo juri | Label Mode Demo serta checkpoint yang dapat dipilih; save dan tes dipisah |

Jangan menampilkan Ambil Pinjaman sebagai solusi jika minggu/kontrak tidak mengizinkannya.

### Gerak dan aksesibilitas

Gunakan transisi pendek saat pilihan berubah dan feedback muncul. Crisis shock boleh bergerak satu kali sesuai handoff, tanpa getaran berulang. State karakter mengikuti idle_cooking, crisis_shock, worker_burnout, resilient_win.

Saat reduceMotion aktif, hentikan shake, angka melayang, dan gerak ambient; gunakan perubahan ikon atau teks. Audio opsional dan mati pada awal sesi. Jangan menunda hasil keuangan untuk menunggu animasi.

Semua kontrol punya target sentuh minimal pada handoff, nama aksesibel, dan fokus yang terlihat. Pilihan radio mendukung keyboard. Informasi status memakai teks dan ikon, bukan warna saja. Pembesaran teks tidak boleh menghilangkan pilihan atau tombol lanjut.

### Handoff ke pen.dev

Buat halaman kanvas Foundations, Components, Mobile, dan Desktop. Foundations berisi warna, tipografi, spacing, radius, serta tiga kelompok referensi. Gunakan gambar lokal pada folder references sebagai papan inspirasi; simpan sumbernya di SOURCES.md.

Di Components buat variant button, radio choice, dompet, indicator, Shock Card, drawer, banner, dan debrief/replay. Gunakan nama layer yang sama dengan nama komponen dan state agar implementor bisa memetakannya.

Mulai dari dashboard krisis kulkas pada frame mobile. Lanjutkan debrief/replay, drawer HPP, lalu layar lain. Setelah interaksi utama terbaca, buat adaptasi laptop. Jangan memulai dari halaman promosi panjang yang tidak menguji alur game.

Gunakan nilai servis kulkas dari engine dan tiga pilihan yang benar-benar tersedia. Data contoh untuk frame keputusan memakai state demo sebelum minggu diproses; jangan mencampurkan saldo sebelum servis dengan saldo sesudah servis dalam satu frame.

Frame minimum: keenam layar utama pada mobile, HPP drawer, validasi modal kurang, replay alternatif, banner save gagal, serta dashboard dan debrief pada laptop. Tambahkan frame compact untuk mengecek pilihan panjang dan nominal penuh. Pakai Auto Layout dan teks yang dapat membungkus; jangan meratakan ilustrasi, teks, dan kontrol menjadi satu bitmap.

## Do's and Don'ts

**Lakukan:** pertahankan konteks warung, jelaskan angka, tampilkan konsekuensi, dan buktikan tindakan utama dapat ditemukan. Uji desain dengan kejadian berteks panjang, saldo nol, cicilan M13, error penyimpanan, keyboard, serta pembesaran teks.

**Hindari:** mata uang premium, loot box, peta panjang Duolingo, paywall, perluasan cabang, tabel keuangan padat di layar awal, gradients/glow tanpa tujuan, ornamen yang mengalahkan keputusan, dan tombol tanpa perilaku. Tidak ada testimoni, hasil uji peserta, atau klaim dampak yang dibuat-buat.

Saat harus memilih antara panggung lebih besar dan angka lebih terbaca, utamakan angka serta pilihan keputusan. Ilustrasi boleh diringkas; konsekuensi uang tidak boleh disembunyikan.

## Identitas produk yang dipilih

Concept B “Warung Tetap Berdiri” telah dipilih pengguna sebagai logo Tahan Banting. UMKM Tycoon adalah subjudul produk; Dapur Sari tetap nama warung dalam permainan. Gunakan master dan varian lokal pada BRAND_HANDOFF.md. Logo lengkap untuk layar awal, compact atau simbol untuk gameplay; angka kas serta pilihan tetap dominan. Concept A dan C disimpan sebagai arsip eksplorasi.