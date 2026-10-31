# Deployment UMKM Tycoon

## GitHub Pages

URL aplikasi: https://jojookun.github.io/umkm-tycoon/

Workflow `.github/workflows/pages.yml` berjalan pada push ke `main` atau melalui workflow_dispatch. Build menjalankan lint, typecheck, tes, dry-run ekonomi, dan build produksi sebelum deployment. Node.js 24 digunakan bersama `npm ci` dan lockfile.

Base path Pages adalah `/umkm-tycoon/`. `PUBLIC_BASE_PATH` hanya konfigurasi build; tidak berisi secret. Resolver `assetUrl` dan favicon HTML mengikuti base path tersebut. Branch deployment tidak memerlukan salinan source atau folder dist yang dikomit; Pages menerima artifact dari workflow.

Izin workflow dibatasi: build membaca source dan metadata Pages; job deployment memiliki pages:write dan id-token:write untuk menerbitkan artifact ke environment github-pages. Actions pihak pertama dipin ke commit SHA.

## Hosting root domain

Gunakan `npm ci`, `npm run build`, lalu sajikan folder `dist` sebagai situs statis. Tanpa `PUBLIC_BASE_PATH`, base adalah `/`. Tidak ada backend atau API key yang harus dikonfigurasi. Simpanan browser berbeda untuk setiap origin; data localhost tidak otomatis berpindah ke domain publik.

## Verifikasi setelah deployment

Periksa logo, panggung, karakter, dan font; mulai permainan penuh; jalankan demo M8 sampai debrief; buka drawer HPP dan preview replay; reload untuk memeriksa simpanan. Cocokkan commit workflow dengan commit tag `submission-24h`.

Tag rilis tidak dipindahkan otomatis oleh workflow. Jika tim mengubah kode setelah snapshot submission, gunakan commit/changelog yang jelas dan ikuti aturan panitia, bukan menimpa histori rilis.
