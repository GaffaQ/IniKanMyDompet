# IniKanMyDompet 💰

Aplikasi web untuk mengelola keuangan pribadi dengan mudah. Catat pemasukan dan pengeluaran, kelola kategori, lihat statistik keuangan, dan capai target menabung bulanan Anda.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fitur Utama

### 📊 Dashboard
- Ringkasan keuangan real-time (Total Pemasukan, Pengeluaran, Sisa Anggaran)
- Grafik pengeluaran per kategori
- Grafik pengeluaran harian (7 hari terakhir)
- Perbandingan pemasukan vs pengeluaran bulanan
- Daftar transaksi terbaru
- Target menabung bulanan dengan notifikasi

### 💸 Manajemen Transaksi
- Tambah, edit, dan hapus transaksi
- Kategorisasi transaksi (Makanan, Transport, Belanja, dll)
- Filter berdasarkan tipe, kategori, dan tanggal
- Pencarian transaksi
- Sort berdasarkan tanggal atau jumlah

### 🏷️ Manajemen Kategori
- Buat, edit, dan hapus kategori
- Auto-redirect transaksi ke kategori "Lainnya" saat kategori dihapus
- Kategori default yang siap pakai

### 📈 Analisis & Statistik
- Grafik pie chart pengeluaran per kategori
- Grafik area chart pengeluaran harian
- Grafik bar chart pemasukan vs pengeluaran bulanan
- Statistik lengkap dengan perhitungan otomatis

### 🎯 Target Menabung
- Set target menabung bulanan dalam persentase
- Perhitungan otomatis berdasarkan pemasukan bulan ini
- Alert di dashboard jika saldo kurang dari target
- Warning saat menambah pengeluaran yang melewati target

### 💡 Daily Tips
- Tips menabung setiap kali mengunjungi website
- 12 tips berbeda yang berotasi setiap hari
- Auto-close setelah 10 detik atau tutup manual

### 💾 Data Management
- Export data ke JSON
- Import data dari JSON
- Validasi data saat import
- Semua data tersimpan di LocalStorage (client-side)

### 🎨 UI/UX
- Dark mode support
- Responsive design (mobile & desktop)
- Animasi smooth dan modern
- Glass morphism design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ atau lebih baru
- npm atau yarn atau bun

### Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/IniKanMyDompet.git
cd IniKanMyDompet
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Buka browser di `http://localhost:5173`

### Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Routing
- **LocalStorage** - Data persistence
- **Sonner** - Toast notifications

## 📁 Struktur Project

```
src/
├── components/          # Komponen UI
│   ├── dashboard/      # Komponen dashboard
│   ├── layout/         # Layout components
│   ├── transactions/   # Komponen transaksi
│   ├── tips/           # Daily tips modal
│   └── ui/             # Shadcn UI components
├── data/               # Data static (daily tips)
├── hooks/              # Custom hooks
├── logic/              # Business logic
│   ├── backup/         # Export/Import
│   ├── categories/     # Category management
│   ├── hooks/          # Logic hooks
│   ├── savings/        # Savings target
│   ├── stats/          # Statistics calculation
│   ├── storage/        # LocalStorage & IndexedDB
│   ├── transactions/   # Transaction management
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── pages/              # Page components
│   ├── About.tsx       # About page
│   ├── Categories.tsx  # Categories page
│   ├── Charts.tsx      # Charts page
│   ├── Index.tsx       # Dashboard
│   ├── Profile.tsx     # Profile & settings
│   ├── SearchFilter.tsx # Search & filter
│   └── Transactions.tsx # Transactions page
└── App.tsx             # Main app component
```

## 🎯 Fitur Detail

### Target Menabung
Set target menabung bulanan di halaman Profile dengan memasukkan persentase (0-100%). Aplikasi akan:
- Menghitung target berdasarkan pemasukan bulan ini
- Menampilkan alert di dashboard jika saldo kurang dari target
- Memberikan warning saat menambah pengeluaran yang melewati target

### Export/Import Data
- Export semua data (transaksi & kategori) ke file JSON
- Import data dari file JSON dengan validasi
- Backup dan restore data dengan mudah

### Filter & Search
- Search berdasarkan nama, kategori, atau catatan
- Filter berdasarkan tipe (Pemasukan/Pengeluaran)
- Filter berdasarkan kategori (multiple selection)
- Filter berdasarkan rentang tanggal (Hari Ini, Minggu Ini, Bulan Ini, Custom)

## 👥 Tim Pengembang

- **Gaffa** - Developer ([github.com/GaffaQ](https://github.com/GaffaQ))
- **Reno** - Project Manager ([github.com/Ren-blink](https://github.com/Ren-blink))
- **Sultan** - Designer ([github.com/RajwaSultan](https://github.com/RajwaSultan))

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build untuk production
npm run build:dev    # Build development mode

# Preview
npm run preview      # Preview production build

# Lint
npm run lint         # Run ESLint
```

## 🔒 Data Storage

Aplikasi menggunakan **LocalStorage** untuk menyimpan data. Semua data tersimpan di browser Anda dan tidak dikirim ke server manapun. Data akan tetap ada meskipun Anda menutup browser, kecuali:
- User menghapus data browser
- User menggunakan mode incognito/private
- Browser storage quota penuh

**Catatan:** Data di LocalStorage terbatas sekitar 5-10MB per domain. Jika data Anda sangat besar, pertimbangkan untuk menggunakan fitur Export untuk backup.

## 🎨 Customization

### Mengubah Warna Theme
Edit file `src/index.css` untuk mengubah warna theme light/dark mode.

### Menambah Kategori Default
Edit fungsi `getDefaultCategories()` di `src/logic/categories/categoryStore.ts`.

### Menambah Daily Tips
Edit array `dailyTips` di `src/data/dailyTips.ts`.

## 🐛 Troubleshooting

### Data tidak tersimpan
- Pastikan LocalStorage tidak diblokir di browser
- Cek apakah browser support LocalStorage
- Cek console untuk error messages

### Build error
- Pastikan semua dependencies terinstall: `npm install`
- Hapus `node_modules` dan `package-lock.json`, lalu install ulang
- Pastikan Node.js version 18+

### Modal Daily Tips tidak muncul
- Refresh halaman
- Cek console untuk error
- Pastikan component `DailyTipsModal` ada di `App.tsx`

## 📄 License

MIT License - bebas digunakan untuk project pribadi atau komersial.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) untuk komponen UI yang keren
- [Recharts](https://recharts.org/) untuk visualisasi data
- [Lucide Icons](https://lucide.dev/) untuk icon set

## 📞 Support

Jika ada pertanyaan atau menemukan bug, silakan buat issue di repository ini.

---

Dibuat dengan ❤️ oleh tim IniKanMyDompet

