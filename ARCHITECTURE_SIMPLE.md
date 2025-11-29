# Arsitektur Sistem IniKanMyDompet - Versi Sederhana

## Apa Itu Aplikasi Ini?

IniKanMyDompet adalah aplikasi **Budget & Expense Tracker** yang berjalan 100% di browser user. Tidak ada server atau database eksternal. Semua data disimpan di browser menggunakan LocalStorage, sehingga aplikasi bisa bekerja offline dan data tetap tersimpan meskipun user menutup browser.

## Bagaimana Aplikasi Bekerja?

### Saat User Pertama Kali Membuka Website

Ketika user membuka website untuk pertama kali, aplikasi akan otomatis membuat 6 kategori default (Makanan, Transportasi, Belanja, Hiburan, Tagihan, Lainnya) dan menyimpannya di LocalStorage. Modal "Daily Tips" akan muncul otomatis untuk memberikan tips menabung. Dashboard akan menampilkan statistik kosong karena belum ada transaksi.

### Saat User Menambah Transaksi

Ketika user mengklik tombol tambah transaksi dan mengisi form (nama, jumlah, kategori, tanggal, dll), aplikasi akan memvalidasi data terlebih dahulu. Jika data valid, transaksi akan disimpan ke LocalStorage dengan ID unik. Setelah itu, semua komponen yang menggunakan data transaksi (dashboard, charts, list transaksi) akan otomatis update untuk menampilkan data terbaru. Jika user menambah pengeluaran yang menyebabkan saldo kurang dari target menabung, akan muncul peringatan di modal dan notifikasi toast.

### Saat User Melihat Dashboard

Dashboard akan membaca semua transaksi dari LocalStorage, kemudian menghitung statistik secara otomatis: total pemasukan (dari semua transaksi income), total pengeluaran (dari semua transaksi expense), dan sisa anggaran (pemasukan dikurangi pengeluaran). Data ini juga digunakan untuk membuat grafik: pie chart pengeluaran per kategori, line chart pengeluaran harian 7 hari terakhir, dan bar chart perbandingan pemasukan vs pengeluaran per bulan. Jika user sudah set target menabung, dashboard akan menampilkan target dan alert jika saldo kurang dari target.

### Saat User Filter atau Search

Ketika user menggunakan fitur filter atau search, aplikasi akan membaca semua transaksi dari state, kemudian memfilter berdasarkan kriteria yang dipilih (kata kunci, tipe transaksi, kategori, rentang tanggal). Hasil filter kemudian di-sort berdasarkan tanggal atau jumlah, dan ditampilkan di UI. Proses ini terjadi secara real-time tanpa perlu reload halaman.

### Saat User Set Target Menabung

User bisa mengatur persentase target menabung di halaman Profile (misalnya 25%). Aplikasi akan menyimpan persentase ini ke LocalStorage. Ketika user kembali ke Dashboard, aplikasi akan menghitung target berdasarkan pemasukan bulan ini. Misalnya jika pemasukan bulan ini Rp 1.000.000 dan target 25%, maka target menabung adalah Rp 250.000. Jika saldo saat ini kurang dari target, akan muncul alert di dashboard. Saat user menambah pengeluaran yang menyebabkan saldo kurang dari target, akan muncul warning di modal transaksi.

### Saat User Refresh Browser

Karena semua data disimpan di LocalStorage browser, ketika user refresh atau menutup lalu membuka kembali website, semua data (transaksi, kategori, target menabung) akan tetap ada dan dimuat otomatis. User tidak akan kehilangan data kecuali mereka menghapus data browser secara manual.

## Struktur Data di LocalStorage

Aplikasi menyimpan 3 jenis data utama di LocalStorage:

1. **Transaksi** (key: `dompetku_transactions`): Array berisi semua transaksi yang pernah dibuat, dengan informasi seperti ID, nama, jumlah, tipe (income/expense), kategori, tanggal, dan catatan.

2. **Kategori** (key: `dompetku_categories`): Array berisi semua kategori transaksi, dengan informasi ID, nama, dan warna. Kategori default dibuat otomatis saat pertama kali aplikasi dibuka.

3. **Target Menabung** (key: `dompetku_savingsTarget`): Object berisi persentase target menabung yang di-set user di halaman Profile.

## Alur Data dalam Aplikasi

Aplikasi menggunakan 4 layer utama yang bekerja secara berurutan:

**Layer 1 - UI Components**: Ini adalah halaman dan komponen yang user lihat dan gunakan. Ketika user melakukan aksi (klik tombol, isi form), layer ini akan memanggil fungsi dari layer berikutnya.

**Layer 2 - Custom Hooks**: Ini adalah React hooks yang mengelola state aplikasi. Hooks ini bertanggung jawab untuk menyinkronkan data antara React state (untuk re-render UI) dengan LocalStorage (untuk persistensi data). Setiap kali data berubah, hooks akan update state dan trigger re-render UI.

**Layer 3 - Business Logic**: Ini adalah fungsi-fungsi murni yang menangani logika bisnis aplikasi, seperti validasi data, perhitungan statistik, filter dan sorting. Layer ini tidak bergantung pada React, sehingga bisa digunakan di mana saja dan mudah di-test.

**Layer 4 - Storage**: Ini adalah wrapper untuk LocalStorage yang menangani penyimpanan dan pembacaan data dengan error handling yang aman. Layer ini memastikan data tersimpan dengan benar dan menangani error jika LocalStorage penuh atau diblokir.

## Contoh Alur Lengkap: Menambah Transaksi

1. User mengklik tombol tambah transaksi di dashboard
2. Modal transaksi terbuka dengan form kosong
3. User mengisi form: nama "Makan Siang", jumlah 35000, kategori "Makanan", tipe "expense"
4. User klik "Simpan"
5. UI component memanggil `addTransaction()` dari hook `useTransactionStore`
6. Hook memanggil `transactionStore.addTransaction()` untuk validasi dan penyimpanan
7. Business logic memvalidasi data: nama minimal 2 karakter, jumlah > 0, kategori valid
8. Jika valid, data disimpan ke LocalStorage melalui `localStorageClient.save()`
9. Hook update React state dengan transaksi baru
10. UI otomatis re-render: dashboard update stats, charts update, list transaksi update
11. Modal tertutup dan toast notifikasi muncul: "Transaksi berhasil ditambahkan"

## Keunggulan Arsitektur Ini

Arsitektur ini dirancang untuk aplikasi client-side yang sederhana namun powerful. Keunggulannya adalah:

- **Tidak perlu backend**: Semua logika dan data ada di browser, tidak perlu server atau database
- **Cepat**: Tidak ada delay network karena semua data lokal
- **Offline**: Aplikasi bisa bekerja tanpa internet
- **Mudah di-maintain**: Logic terpisah dari UI, sehingga mudah diubah dan di-test
- **Type-safe**: Menggunakan TypeScript untuk mencegah error dan memudahkan development

## Kesimpulan

Aplikasi IniKanMyDompet bekerja dengan cara yang sederhana: semua data disimpan di browser user menggunakan LocalStorage. Ketika user melakukan aksi (tambah, edit, hapus transaksi), data langsung disimpan ke LocalStorage dan UI otomatis update. Ketika user membuka kembali website, data dimuat dari LocalStorage dan ditampilkan. Semua perhitungan statistik dan grafik dilakukan secara real-time berdasarkan data transaksi yang ada. Sistem ini memastikan data user tetap aman dan tersimpan di browser mereka sendiri.

