# Karakter Dapur Sari

Brief karakter untuk desain Tahan Banting: UMKM Tycoon. Gunakan bersama DESIGN.md dan PENDEV_HANDOFF.md. Ini arahan ilustrasi baru, bukan izin menyalin karakter produk referensi.

## Gaya bersama

- Vector 2D sederhana, kontur cokelat gelap, warna datar krem/terakota/hijau daun, ekspresi mudah dibaca pada ukuran kecil.
- Bentuk wajah dan proporsi konsisten antarpemeran; tampak dewasa dan ramah, tidak chibi berlebihan atau fotorealistis.
- Untuk avatar/panggung gunakan pose setengah badan menghadap pemain atau sedikit tiga perempat. Pisahkan karakter dari latar warung.
- Hindari tekstur rumit, detail motif terlalu rapat, logo pihak ketiga, dan teks yang digambar menyatu dengan ilustrasi.
- Buat layer kepala, rambut/penutup kepala, alis, mata, mulut, badan, pakaian, lengan, serta properti terpisah jika bentuk memungkinkan. Gunakan group/component sesuai kemampuan kanvas; tidak perlu membuat animation rig.
- Pertahankan ciri wajah, warna pakaian, dan skala saat membuat ekspresi baru. Perubahan ekspresi tidak boleh mengganti identitas karakter.
- Screenshot referensi membantu komposisi panggung dan ketebalan kontur secara umum; jangan menjiplak wajah, dekorasi, atau logo.

## Prioritas pertama

### sari_pertiwi — Sari Pertiwi

Pemilik Dapur Sari. Perempuan dewasa muda, ekspresi hangat dan tegas, jepit bunga kamboja kecil, kemeja lengan digulung, celemek lurik terakota. Buku nota dan HP adalah properti opsional yang bisa disembunyikan pada varian. Dalam panggung, Sari mengambil keputusan usaha; jangan selalu menggambarkannya panik.

Varian: neutral, concerned, thinking, relieved. Gunakan wajah yang sama, bukan empat desain tokoh berbeda.

### kang_deden — Kang Deden

Juru masak Dapur Sari. Pria dewasa muda, kaos kerja bersih, ikat kepala batik sederhana, handuk kecil di bahu, sutil sebagai properti. Pakaian dan pose harus membedakannya dari Sari tanpa mengandalkan warna saja.

Varian: neutral, shocked, tired, relieved. Pose tired memakai bahu turun serta mata lelah; jangan mempermalukan pekerja atau menyatakan ia malas.

## Pemeran pendukung

| ID | Tokoh dan peran | Ciri visual | Properti / konteks |
| --- | --- | --- | --- |
| dimas | Dimas, adik mahasiswa | Kemeja flanel, tas selempang, tampak lebih muda dari Sari | Buku kuliah atau helm; memicu kebutuhan keluarga |
| haji_bambang | Pak Haji Bambang, pemasok | Pria lebih tua, kumis, peci rajut putih, rompi saku | Keranjang cabai atau bahan; menjelaskan perubahan harga |
| bu_ratna | Bu Ratna, mitra UMKM | Ibu dewasa, kebaya harian dengan motif sederhana, kerudung rapi | Keranjang belanja; kerja sama katering dan pembelian |
| mbak_nisa | Mbak Nisa, pelanggan pekerja | Pakaian kerja, lanyard sederhana tanpa logo perusahaan | HP; permintaan QRIS/WA |
| pak_rt_karso | Pak RT Karso, pemesan katering | Pria lebih tua, kemeja batik sederhana | Map acara warga; pesanan besar |
| mas_raka | Mas Raka, coach | Kacamata bulat, kemeja tenun ikat biru nila yang tidak mendominasi palet UI | Tablet; pose mendengar dan menjelaskan |
| si_cepat_cair | Si Cepat Cair, tawaran pembiayaan berbiaya tinggi fiktif | Objek notifikasi HP dengan tanda peringatan | Bukan sosok manusia, logo pinjaman nyata, atau karikatur kelompok tertentu |

Untuk tahap pendukung cukup satu pose neutral per tokoh. Jangan membuat semua variasi sebelum dashboard utama dan debrief terbaca.

## State engine versus ekspresi

| State panggung | Penggunaan visual |
| --- | --- |
| idle_cooking | Sari neutral/thinking, Deden neutral; alat dan meja rapi |
| crisis_shock | Sari concerned, Deden shocked; properti krisis misalnya kulkas |
| worker_burnout | Deden tired; Sari concerned/thinking |
| resilient_win | Sari dan Deden relieved; postur positif tanpa hujan koin |

State ini adalah petunjuk visual untuk implementor. Pen.dev tidak otomatis menghubungkan ekspresi ke state engine atau membuat animasi runtime. Ekspor ilustrasi statis tidak dianggap animasi selesai.

## Penamaan dan kriteria selesai

Gunakan nama group seperti character/sari_pertiwi/neutral dan character/kang_deden/tired. Pertahankan baseline kaki/badan, ukuran kepala, dan posisi mata pada varian tokoh yang sama agar pergantian ekspresi tidak melompat.

Uji avatar pada 64 × 64 px, panggung setengah badan sekitar 120–160 px tinggi pada HP, dan frame laptop. Buat master sekitar 240 × 280 px per pose dengan ruang kosong yang konsisten; ukuran master bukan batas tinggi teks dialog.

Selesai jika delapan pose tokoh utama dapat dibandingkan berdampingan, bentuknya dapat diedit di kanvas, tidak terpotong, serta ekspresinya tetap terbaca pada ukuran panggung. PNG preview berlatar transparan boleh dibuat bila workflow mendukung. SVG hanya diminta jika fasilitas ekspor/alat yang dipakai benar-benar mendukungnya; jangan mengklaim file SVG sudah ada tanpa berkas aktual.
