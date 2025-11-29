# Flow Alur Kerja Aplikasi IniKanMyDompet

## Flow Awal: User Pertama Kali Mengakses Website

```
User (Mobile/Desktop)
  → Akses Website
  → Browser memuat aplikasi React
  → App.tsx dijalankan
  → initializeDefaultCategories() → Buat 6 kategori default
  → Simpan kategori ke LocalStorage
  → DailyTipsModal muncul otomatis
  → Dashboard dimuat
  → useCategoryStore() → Load kategori dari LocalStorage (6 kategori)
  → useTransactionStore() → Load transaksi dari LocalStorage (kosong)
  → getStats() → Hitung statistik (semua 0)
  → Dashboard menampilkan: "Belum ada transaksi"
```

## Flow: User Menambah Transaksi Baru

```
User (Mobile/Desktop)
  → Klik tombol "+" (FAB) di Dashboard
  → TransactionModal terbuka
  → User isi form: nama, jumlah, kategori, tipe, tanggal
  → User klik "Simpan"
  → Validasi input (nama minimal 2 karakter, jumlah > 0)
  → Cek target menabung (jika expense dan saldo < target → warning)
  → addTransaction() → transactionStore.addTransaction()
  → Generate ID unik untuk transaksi
  → Simpan transaksi ke LocalStorage
  → Update React state
  → Dashboard otomatis update: stats, charts, list transaksi
  → Modal tertutup
  → Toast notifikasi: "Transaksi berhasil ditambahkan"
```

## Flow: User Melihat Dashboard

```
User (Mobile/Desktop)
  → Buka Dashboard
  → useTransactionStore() → Load semua transaksi dari LocalStorage
  → getStats() → calculateStats(transactions)
  → Hitung: totalIncome, totalExpense, balance
  → Hitung: expenseByCategory (untuk pie chart)
  → Hitung: dailyExpenses (untuk line chart)
  → Hitung: monthlyIncome/Expense (untuk bar chart)
  → useSavingsTarget() → Load target dari LocalStorage
  → calculateTarget(currentMonthIncome)
  → Cek: balance < target? → Jika ya, tampilkan alert
  → Render Dashboard dengan data real-time
```

## Flow: User Filter & Search Transaksi

```
User (Mobile/Desktop)
  → Buka halaman Transactions atau SearchFilter
  → User input search query / pilih filter
  → getFilteredTransactions(filter, sortOption)
  → Filter by: search query (nama, catatan, kategori)
  → Filter by: tipe (income/expense)
  → Filter by: kategori
  → Filter by: rentang tanggal
  → Sort by: tanggal atau jumlah (asc/desc)
  → Tampilkan hasil filter di UI
  → Update real-time saat filter berubah
```

## Flow: User Set Target Menabung

```
User (Mobile/Desktop)
  → Buka halaman Profile
  → useSavingsTarget() → Load target dari LocalStorage
  → User input persentase (contoh: 25%)
  → User klik "Simpan Target"
  → setSavingsTarget(25) → Validasi (0-100)
  → Simpan ke LocalStorage
  → Toast: "Target menabung berhasil disimpan"
  → User kembali ke Dashboard
  → calculateTarget(currentMonthIncome)
  → Hitung: target = (income × 25) / 100
  → Cek: balance < target? → Jika ya, tampilkan alert
  → Info card menampilkan target & status
```

## Flow: User Menambah Pengeluaran yang Melewati Target

```
User (Mobile/Desktop)
  → Buka TransactionModal
  → Pilih tipe: "expense"
  → Input amount (contoh: 50000)
  → useEffect() → Hitung: newBalance = currentBalance - amount
  → Cek: newBalance < savingsTarget?
  → Jika ya → setShowTargetWarning(true)
  → Alert warning muncul di modal: "Target Menabung Akan Terlewat"
  → User tetap klik "Simpan"
  → handleSubmit() → Cek lagi target warning
  → Toast warning: "Target menabung terlewat!"
  → addTransaction() → Simpan transaksi
  → Dashboard update dengan saldo baru
```

## Flow: User Edit Transaksi

```
User (Mobile/Desktop)
  → Klik transaksi di list
  → TransactionModal terbuka dengan data transaksi
  → User edit data (nama, jumlah, kategori, dll)
  → User klik "Simpan"
  → Validasi input
  → updateTransaction() → transactionStore.updateTransaction()
  → Update transaksi di LocalStorage
  → Update React state
  → Dashboard otomatis update: stats, charts
  → Modal tertutup
  → Toast: "Transaksi berhasil diupdate"
```

## Flow: User Hapus Transaksi

```
User (Mobile/Desktop)
  → Klik tombol hapus di transaksi
  → Konfirmasi hapus
  → deleteTransaction(id) → transactionStore.deleteTransaction()
  → Hapus transaksi dari LocalStorage
  → Update React state
  → Dashboard otomatis update: stats, charts
  → Toast: "Transaksi berhasil dihapus"
```

## Flow: User Refresh Browser

```
User (Mobile/Desktop)
  → Refresh browser (F5 atau reload)
  → Browser memuat aplikasi React lagi
  → App.tsx dijalankan
  → initializeDefaultCategories() → Cek kategori sudah ada? Skip
  → Dashboard dimuat
  → useCategoryStore() → Load kategori dari LocalStorage
  → useTransactionStore() → Load transaksi dari LocalStorage
  → useSavingsTarget() → Load target dari LocalStorage
  → Semua data tetap ada (tidak hilang)
  → Dashboard menampilkan data terakhir sebelum refresh
```

## Flow: User Export Data

```
User (Mobile/Desktop)
  → Buka halaman Settings atau Backup
  → Klik "Export Data"
  → exportToJSON() → Load semua data dari LocalStorage
  → Gabungkan: transactions + categories + savingsTarget
  → Generate JSON file
  → Download file ke device user
  → File berisi semua data untuk backup
```

## Flow: User Import Data

```
User (Mobile/Desktop)
  → Buka halaman Settings atau Backup
  → Klik "Import Data"
  → User pilih file JSON
  → Baca file JSON
  → Validasi struktur JSON
  → Jika valid → importTransactions() + importCategories()
  → Timpa data di LocalStorage dengan data baru
  → Update React state
  → Dashboard otomatis update dengan data baru
  → Toast: "Data berhasil diimport"
```

## Flow: User Tambah Kategori Baru

```
User (Mobile/Desktop)
  → Buka halaman Categories
  → Klik "Tambah Kategori"
  → Form modal terbuka
  → User input nama kategori (contoh: "Olahraga")
  → User pilih warna
  → User klik "Simpan"
  → Validasi: nama minimal 2 karakter, tidak duplikat
  → addCategory() → categoryStore.addCategory()
  → Generate ID unik
  → Simpan kategori ke LocalStorage
  → Update React state
  → Kategori muncul di list
  → Kategori tersedia di dropdown transaksi
```

## Flow: User Hapus Kategori

```
User (Mobile/Desktop)
  → Buka halaman Categories
  → Klik tombol hapus di kategori
  → Validasi: kategori "Lainnya" tidak bisa dihapus
  → Cek: ada transaksi yang pakai kategori ini?
  → Jika ada → Reassign semua transaksi ke kategori "Lainnya"
  → deleteCategory(id) → categoryStore.deleteCategory()
  → Hapus kategori dari LocalStorage
  → Update transaksi yang pakai kategori ini
  → Update React state
  → Kategori hilang dari list
  → Toast: "Kategori berhasil dihapus"
```

## Ringkasan: Alur Data dalam Aplikasi

```
User Action
  → UI Component (Page/Modal)
  → Custom Hook (useTransactionStore/useCategoryStore)
  → Business Logic (transactionStore/categoryStore)
  → Storage Layer (localStorageClient)
  → Browser LocalStorage
  → Data tersimpan
  → Hook update React state
  → UI re-render dengan data baru
```

## Data yang Disimpan di LocalStorage

1. **dompetku_transactions** → Array semua transaksi
2. **dompetku_categories** → Array semua kategori
3. **dompetku_savingsTarget** → Object target menabung

Semua data ini tetap ada meskipun user refresh browser atau tutup tab.
