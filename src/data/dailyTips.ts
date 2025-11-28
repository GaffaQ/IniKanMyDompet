/**
 * Daily Tips untuk menabung
 */

export interface DailyTip {
  id: string;
  title: string;
  message: string;
  category: "budgeting" | "saving" | "spending" | "planning";
}

export const dailyTips: DailyTip[] = [
  {
    id: "1",
    title: "Mulai dengan Budget 50/30/20",
    message: "Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan. Ini adalah aturan praktis untuk mengelola keuangan dengan baik.",
    category: "budgeting",
  },
  {
    id: "2",
    title: "Catat Semua Pengeluaran",
    message: "Dengan mencatat setiap pengeluaran, Anda akan lebih sadar tentang kemana uang Anda pergi. Ini membantu mengidentifikasi pengeluaran yang tidak perlu.",
    category: "spending",
  },
  {
    id: "3",
    title: "Bayar Diri Sendiri Terlebih Dahulu",
    message: "Setiap kali menerima gaji, langsung sisihkan persentase untuk tabungan sebelum membelanjakan uang untuk hal lain. Pay yourself first!",
    category: "saving",
  },
  {
    id: "4",
    title: "Buat Tujuan Menabung yang Spesifik",
    message: "Tentukan tujuan menabung yang jelas dan spesifik. Misalnya: 'Menabung Rp 5 juta untuk liburan akhir tahun'. Tujuan yang jelas lebih mudah dicapai.",
    category: "planning",
  },
  {
    id: "5",
    title: "Gunakan Aturan 24 Jam",
    message: "Sebelum membeli barang yang tidak penting, tunggu 24 jam. Ini membantu menghindari pembelian impulsif dan menghemat uang.",
    category: "spending",
  },
  {
    id: "6",
    title: "Review Pengeluaran Bulanan",
    message: "Setiap akhir bulan, review semua pengeluaran Anda. Identifikasi area yang bisa dikurangi dan buat rencana untuk bulan berikutnya.",
    category: "budgeting",
  },
  {
    id: "7",
    title: "Otomatiskan Tabungan",
    message: "Set up auto-transfer dari rekening utama ke rekening tabungan setiap bulan. Dengan cara ini, Anda tidak akan lupa menabung.",
    category: "saving",
  },
  {
    id: "8",
    title: "Bandingkan Harga Sebelum Membeli",
    message: "Selalu bandingkan harga di beberapa toko atau platform sebelum membeli. Sedikit usaha bisa menghemat banyak uang dalam jangka panjang.",
    category: "spending",
  },
  {
    id: "9",
    title: "Buat Dana Darurat",
    message: "Prioritaskan untuk membangun dana darurat setara 3-6 bulan pengeluaran. Ini akan melindungi Anda dari kejadian tak terduga.",
    category: "planning",
  },
  {
    id: "10",
    title: "Hindari Hutang Konsumtif",
    message: "Hindari berhutang untuk barang konsumtif. Jika tidak bisa membeli dengan cash, mungkin Anda belum siap untuk membelinya.",
    category: "spending",
  },
  {
    id: "11",
    title: "Investasi dalam Diri Sendiri",
    message: "Alokasikan sebagian uang untuk belajar skill baru atau meningkatkan kemampuan. Investasi terbaik adalah investasi dalam diri sendiri.",
    category: "planning",
  },
  {
    id: "12",
    title: "Gunakan Cashback dan Diskon",
    message: "Manfaatkan program cashback, diskon, dan promo yang tersedia. Tapi ingat, diskon hanya menghemat uang jika Anda memang perlu membeli barang tersebut.",
    category: "spending",
  },
];

/**
 * Get random tip untuk hari ini
 * Tips akan sama sepanjang hari (berdasarkan tanggal)
 */
export function getTodayTip(): DailyTip {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tipIndex = dayOfYear % dailyTips.length;
  return dailyTips[tipIndex];
}

/**
 * Check apakah user sudah melihat tips hari ini
 */
export function hasSeenTodayTip(): boolean {
  const today = new Date().toDateString();
  const lastSeen = localStorage.getItem("lastTipDate");
  return lastSeen === today;
}

/**
 * Mark bahwa user sudah melihat tips hari ini
 */
export function markTodayTipAsSeen(): void {
  const today = new Date().toDateString();
  localStorage.setItem("lastTipDate", today);
}

