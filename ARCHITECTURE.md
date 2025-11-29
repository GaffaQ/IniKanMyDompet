# Arsitektur Sistem IniKanMyDompet

## 📐 Overview Arsitektur

Aplikasi ini menggunakan **Client-Side Architecture** dengan **100% offline-first**. Semua data disimpan di browser user menggunakan LocalStorage, tidak ada backend server.

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                   │
│  ┌──────────────────────────────────────────┐  │
│  │         React Application                │  │
│  │  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │   UI       │  │   Logic Layer    │   │  │
│  │  │ Components │◄─┤  (Hooks/Store)  │   │  │
│  │  └────────────┘  └────────┬─────────┘   │  │
│  │                           │              │  │
│  │  ┌────────────────────────▼──────────┐   │  │
│  │  │      LocalStorage Wrapper        │   │  │
│  │  └────────────────────────┬──────────┘   │  │
│  └───────────────────────────┼──────────────┘  │
│                              │                 │
│  ┌───────────────────────────▼──────────────┐ │
│  │         Browser LocalStorage             │ │
│  │  - dompetku_transactions                 │ │
│  │  - dompetku_categories                    │ │
│  │  - dompetku_savingsTarget                │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🔄 Flow Aplikasi

### 1. Initialization Flow (Saat Website Dibuka)

```
User membuka website
    ↓
main.tsx: createRoot() → Render App component
    ↓
App.tsx: useEffect() → initializeDefaultCategories()
    ↓
categoryStore.initializeDefaultCategories()
    ├─ Cek LocalStorage: "dompetku_categories"
    ├─ Jika kosong → Buat default categories (6 kategori)
    └─ Simpan ke LocalStorage
    ↓
DailyTipsModal: useEffect() → setIsOpen(true)
    └─ Modal tips muncul otomatis
    ↓
User melihat halaman pertama (Dashboard/Index)
    ↓
Index.tsx: useCategoryStore() + useTransactionStore()
    ├─ useCategoryStore():
    │   ├─ Load categories dari LocalStorage
    │   └─ Set state: categories = [...]
    │
    └─ useTransactionStore(categories):
        ├─ Load transactions dari LocalStorage
        ├─ Set state: transactions = [...]
        └─ Set isLoading = false
    ↓
Dashboard render dengan data real
    ├─ getStats() → calculateStats(transactions)
    ├─ Menampilkan: totalIncome, totalExpense, balance
    ├─ Menampilkan charts dengan data real
    └─ Menampilkan target menabung (jika sudah di-set)
```

### 2. Flow Menambah Transaksi

```
User klik FAB (Floating Action Button)
    ↓
TransactionModal terbuka
    ↓
User isi form:
    - Type (income/expense)
    - Name
    - Amount
    - Category (dropdown dari categories)
    - Date
    - Note (optional)
    ↓
User klik "Simpan"
    ↓
handleSubmit() di TransactionModal:
    ├─ Validasi input (name, amount, category, date)
    ├─ Cek target menabung (jika expense):
    │   ├─ Hitung saldo setelah transaksi
    │   ├─ Jika < target → Show warning alert
    │   └─ Toast warning: "Target menabung terlewat"
    │
    └─ addTransaction(input) dari useTransactionStore
        ↓
        transactionStore.addTransaction(input, categories):
            ├─ Validasi input (validation.ts)
            ├─ Generate ID: timestamp_random
            ├─ Create Transaction object dengan timestamps
            ├─ Validasi transaction lengkap
            ├─ Load existing transactions dari LocalStorage
            ├─ Add transaction baru ke array
            └─ Save array ke LocalStorage: "dompetku_transactions"
        ↓
        useTransactionStore: setTransactions([...prev, newTransaction])
        ↓
        React re-render:
            ├─ Dashboard update stats otomatis
            ├─ TransactionList update
            ├─ Charts update
            └─ Alert target menabung update (jika perlu)
    ↓
Modal tertutup, toast success muncul
```

### 3. Flow Filter & Search

```
User buka halaman Transactions atau SearchFilter
    ↓
User input search query / pilih filter
    ↓
State update: searchQuery, selectedType, selectedCategory, dateRange
    ↓
getFilteredTransactions(filter, sortOption):
    ├─ filterTransactions(transactions, filter):
    │   ├─ Filter by searchQuery (name, note, category)
    │   ├─ Filter by type (income/expense)
    │   ├─ Filter by category
    │   └─ Filter by date range
    │
    └─ sortTransactions(filtered, sortOption):
        └─ Sort by date atau amount (asc/desc)
    ↓
UI menampilkan filteredTransactions
    └─ Update real-time saat filter berubah
```

### 4. Flow Menghitung Statistik

```
User melihat Dashboard
    ↓
getStats() dipanggil
    ↓
calculateStats(transactions):
    ├─ Loop semua transactions
    ├─ Hitung totalIncome (sum amount where type=income)
    ├─ Hitung totalExpense (sum amount where type=expense)
    ├─ Hitung balance = totalIncome - totalExpense
    ├─ Group expense by category → expenseByCategory
    ├─ Group expense by date → dailyExpenses
    ├─ Group income/expense by month → monthlyIncome/Expense
    └─ Return SummaryStats object
    ↓
UI menampilkan stats:
    ├─ SummaryCard: Total Pemasukan
    ├─ SummaryCard: Total Pengeluaran
    ├─ SummaryCard: Sisa Anggaran
    ├─ ExpenseCategoryChart: expenseByCategory
    ├─ DailyExpenseChart: dailyExpenses
    └─ IncomeExpenseChart: monthlyIncome vs monthlyExpense
```

### 5. Flow Target Menabung

```
User buka halaman Profile
    ↓
useSavingsTarget() load target dari LocalStorage
    ↓
User set persentase (contoh: 25%)
    ↓
setSavingsTarget(25):
    ├─ Validasi: 0-100
    ├─ Save ke LocalStorage: "dompetku_savingsTarget"
    └─ Update state
    ↓
User kembali ke Dashboard
    ↓
Dashboard: calculateTarget(currentMonthIncome)
    ├─ Get target dari LocalStorage
    ├─ Calculate: (income * percentage) / 100
    └─ Contoh: (1.000.000 * 25) / 100 = 250.000
    ↓
hasReachedTarget(balance, income):
    ├─ Calculate target
    └─ Return: balance >= target
    ↓
Jika balance < target:
    ├─ Alert muncul di atas dashboard
    └─ Info card menampilkan "Kurang Rp X"
```

### 6. Flow Menambah Pengeluaran (dengan Target Warning)

```
User buka TransactionModal
    ↓
User pilih type = "expense"
    ↓
User input amount
    ↓
useEffect() di TransactionModal:
    ├─ Hitung: newBalance = currentBalance - amount
    ├─ Cek: newBalance < savingsTarget?
    └─ Jika ya → setShowTargetWarning(true)
    ↓
Alert warning muncul di dalam modal:
    "Target Menabung Akan Terlewat"
    ↓
User tetap klik "Simpan"
    ↓
handleSubmit():
    ├─ Cek lagi target warning
    ├─ Toast warning muncul: "Target menabung terlewat!"
    ├─ addTransaction() tetap dijalankan
    └─ Transaksi tersimpan
```

## 🏗️ Arsitektur Layer

### Layer 1: Presentation Layer (UI Components)
```
pages/
├── Index.tsx          → Dashboard page
├── Transactions.tsx   → Transactions list page
├── Categories.tsx     → Categories management
├── SearchFilter.tsx   → Search & filter page
├── Charts.tsx         → Charts visualization
├── Profile.tsx        → Profile & settings
└── About.tsx          → About page

components/
├── dashboard/        → Dashboard components
├── transactions/     → Transaction components
├── layout/           → Layout components
└── ui/               → Shadcn UI components
```

**Tanggung Jawab:**
- Menampilkan UI ke user
- Menangkap user input
- Memanggil hooks untuk aksi

### Layer 2: State Management Layer (Custom Hooks)
```
logic/hooks/
├── useTransactionStore.ts  → State management transaksi
├── useCategoryStore.ts     → State management kategori
└── useSavingsTarget.ts     → State management target menabung
```

**Tanggung Jawab:**
- Mengelola React state
- Sync dengan LocalStorage
- Menyediakan API untuk UI components
- Error handling

**Pattern:**
```typescript
Hook Pattern:
  useState() → Local state
  useEffect() → Load dari LocalStorage saat mount
  useCallback() → Actions (add, update, delete)
  Return: { state, actions, utilities }
```

### Layer 3: Business Logic Layer (Store Functions)
```
logic/
├── transactions/transactionStore.ts  → CRUD transaksi
├── categories/categoryStore.ts      → CRUD kategori
├── savings/savingsStore.ts          → Target menabung
├── stats/useStats.ts                → Perhitungan stats
└── utils/
    ├── validation.ts                 → Validasi data
    └── transactionUtils.ts          → Filter, sort, utilities
```

**Tanggung Jawab:**
- Business logic murni (tidak ada React)
- CRUD operations
- Validasi data
- Perhitungan statistik
- Filter & sorting

**Pattern:**
```typescript
Store Function Pattern:
  getX() → Load dari LocalStorage
  addX() → Validasi → Save ke LocalStorage
  updateX() → Validasi → Update → Save
  deleteX() → Delete → Save
```

### Layer 4: Storage Layer
```
logic/storage/
├── localStorageClient.ts  → LocalStorage wrapper
└── indexedDbClient.ts     → IndexedDB (optional)
```

**Tanggung Jawab:**
- Abstract LocalStorage operations
- Error handling (quota exceeded, blocked)
- Data serialization (JSON)
- Key management dengan prefix

**Storage Keys:**
- `dompetku_transactions` → Array of Transaction
- `dompetku_categories` → Array of Category
- `dompetku_savingsTarget` → SavingsTarget object

## 🔀 Data Flow Diagram

### Read Flow (Membaca Data)
```
UI Component
    ↓
useTransactionStore() / useCategoryStore()
    ↓
transactionStore.getTransactions() / categoryStore.getCategories()
    ↓
localStorageClient.load("transactions" / "categories")
    ↓
localStorage.getItem("dompetku_transactions")
    ↓
JSON.parse() → Transaction[] / Category[]
    ↓
Return ke hook → setState()
    ↓
UI re-render dengan data baru
```

### Write Flow (Menulis Data)
```
User Action (klik button, submit form)
    ↓
UI Component memanggil hook action
    ↓
hook.addTransaction() / hook.addCategory()
    ↓
transactionStore.addTransaction() / categoryStore.addCategory()
    ↓
Validasi data (validation.ts)
    ↓
localStorageClient.save("transactions", data)
    ↓
JSON.stringify() → string
    ↓
localStorage.setItem("dompetku_transactions", string)
    ↓
hook.setState() → Update React state
    ↓
UI re-render dengan data baru
```

## 📊 State Management Pattern

Aplikasi menggunakan **Custom Hooks Pattern** (bukan Redux/Zustand):

```
┌─────────────────────────────────────┐
│   UI Component (Pages)               │
│   const { transactions, addTx } =   │
│     useTransactionStore(categories)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Custom Hook (useTransactionStore) │
│   - useState() untuk local state    │
│   - useEffect() untuk load data     │
│   - useCallback() untuk actions    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Store Functions (transactionStore)│
│   - Pure functions                  │
│   - No React dependencies           │
│   - Direct LocalStorage access     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Storage Client (localStorageClient)│
│   - Abstract LocalStorage          │
│   - Error handling                 │
│   - JSON serialization             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Browser LocalStorage              │
│   - Persistent storage             │
│   - Key-value pairs                │
└─────────────────────────────────────┘
```

## 🔐 Data Persistence

### LocalStorage Structure
```javascript
// Key: "dompetku_transactions"
[
  {
    id: "1706541234567_abc123",
    name: "Makan Siang",
    amount: 35000,
    type: "expense",
    category: "Makanan",
    date: "2024-01-28",
    note: "Nasi gudeg",
    createdAt: 1706541234567,
    updatedAt: 1706541234567
  },
  // ... more transactions
]

// Key: "dompetku_categories"
[
  {
    id: "1706541234567_1",
    name: "Makanan",
    color: "#4F46E5",
    createdAt: 1706541234567
  },
  // ... more categories
]

// Key: "dompetku_savingsTarget"
{
  percentage: 25,
  updatedAt: 1706541234567
}
```

### Data Lifecycle
1. **First Visit**: Default categories dibuat otomatis
2. **User Action**: Data ditambah/diubah/dihapus
3. **Auto-Save**: Setiap perubahan langsung ke LocalStorage
4. **Page Reload**: Data di-load dari LocalStorage
5. **Data Persist**: Data tetap ada sampai user clear browser data

## 🎯 Key Design Decisions

### 1. Mengapa LocalStorage?
- ✅ Sederhana, synchronous API
- ✅ Cukup untuk data tidak terlalu besar
- ✅ Support universal di browser
- ✅ Tidak perlu setup database
- ✅ Perfect untuk aplikasi offline-first

### 2. Mengapa Custom Hooks (bukan Redux)?
- ✅ Lebih ringan, tidak perlu library tambahan
- ✅ Lebih mudah dipahami untuk project kecil-medium
- ✅ TypeScript support lebih baik
- ✅ Cukup untuk kebutuhan aplikasi ini

### 3. Mengapa Separate Logic Layer?
- ✅ Business logic bisa di-test tanpa React
- ✅ Logic bisa digunakan di tempat lain (future: service worker)
- ✅ Separation of concerns yang jelas
- ✅ Mudah di-maintain

## 🔄 Complete User Journey

### Scenario: User Baru Pertama Kali Buka Website

```
1. User buka website
   ↓
2. App.tsx mount
   ├─ initializeDefaultCategories()
   │   └─ Buat 6 kategori default → LocalStorage
   └─ DailyTipsModal muncul
   ↓
3. User melihat Dashboard (Index.tsx)
   ├─ useCategoryStore() → Load categories (6 kategori)
   ├─ useTransactionStore() → Load transactions (kosong)
   ├─ getStats() → { totalIncome: 0, totalExpense: 0, balance: 0 }
   └─ UI menampilkan: "Belum ada transaksi"
   ↓
4. User klik FAB → TransactionModal terbuka
   ├─ Form kosong
   ├─ Category dropdown: 6 kategori default
   └─ Date: hari ini
   ↓
5. User isi form & klik Simpan
   ├─ Validasi input
   ├─ addTransaction() → Save ke LocalStorage
   ├─ State update → Dashboard re-render
   ├─ Stats update otomatis
   └─ Toast: "Transaksi berhasil ditambahkan"
   ↓
6. User refresh browser
   ├─ Data tetap ada (dari LocalStorage)
   ├─ Dashboard menampilkan transaksi yang sudah dibuat
   └─ Semua data persist
```

### Scenario: User Set Target Menabung

```
1. User buka Profile
   ├─ useSavingsTarget() → Load target (null)
   └─ Form kosong
   ↓
2. User input: 25%
   ↓
3. User klik "Simpan Target"
   ├─ setSavingsTarget(25) → Save ke LocalStorage
   └─ Toast: "Target menabung berhasil disimpan"
   ↓
4. User kembali ke Dashboard
   ├─ calculateTarget(currentMonthIncome)
   │   └─ Jika income = 1.000.000 → target = 250.000
   ├─ hasReachedTarget(balance, income)
   │   └─ Jika balance < 250.000 → Alert muncul
   └─ Info card menampilkan target & status
   ↓
5. User tambah pengeluaran yang melewati target
   ├─ Warning muncul di modal
   ├─ Toast warning saat simpan
   └─ Transaksi tetap tersimpan
```

## 🧩 Component Interaction

```
┌─────────────┐
│   App.tsx   │
│  (Router)   │
└──────┬──────┘
       │
       ├─► Index.tsx (Dashboard)
       │   ├─ useCategoryStore()
       │   ├─ useTransactionStore()
       │   ├─ useSavingsTarget()
       │   ├─ SummaryCard (3x)
       │   ├─ ExpenseCategoryChart
       │   ├─ DailyExpenseChart
       │   ├─ IncomeExpenseChart
       │   └─ TransactionList
       │
       ├─► Transactions.tsx
       │   ├─ useCategoryStore()
       │   ├─ useTransactionStore()
       │   ├─ Filter UI
       │   └─ Transaction List
       │
       ├─► Categories.tsx
       │   ├─ useCategoryStore()
       │   ├─ useTransactionStore() (untuk count)
       │   └─ Category Cards
       │
       ├─► Profile.tsx
       │   ├─ useSavingsTarget()
       │   ├─ useTransactionStore()
       │   └─ useCategoryStore()
       │
       └─► TransactionModal (Global)
           ├─ useTransactionStore()
           ├─ useCategoryStore()
           └─ useSavingsTarget() (untuk warning)
```

## 🔍 Error Handling Flow

```
User Action
    ↓
Try {
    ├─ Validasi input
    ├─ Business logic
    └─ Save ke LocalStorage
} Catch (error) {
    ├─ ValidationError → Toast error dengan pesan spesifik
    ├─ NotFoundError → Toast: "Data tidak ditemukan"
    ├─ DuplicateError → Toast: "Data sudah ada"
    ├─ LocalStorage Error → Toast: "Gagal menyimpan data"
    └─ Unknown Error → Toast: "Terjadi kesalahan"
}
    ↓
Error state di hook → UI menampilkan error
```

## 📈 Performance Considerations

1. **LocalStorage Access**: Synchronous, tapi cepat untuk data kecil
2. **React Re-renders**: Hanya component yang menggunakan state yang berubah
3. **Memoization**: useCallback untuk prevent unnecessary re-renders
4. **Data Size**: LocalStorage limit ~5-10MB (cukup untuk ribuan transaksi)

## 🚀 Future Enhancements

1. **IndexedDB**: Untuk data lebih besar (sudah ada abstraction layer)
2. **Service Worker**: Offline support & background sync
3. **PWA**: Install sebagai app
4. **Cloud Sync**: Optional sync ke cloud (jika perlu)

---

**Kesimpulan**: Aplikasi menggunakan arsitektur client-side yang sederhana namun powerful, dengan separation of concerns yang jelas antara UI, State Management, Business Logic, dan Storage Layer.

