export const designSystem = {
  colors: {
    pageBg: "bg-slate-100 text-slate-900 min-h-screen",
    cardBg: "bg-white border border-slate-200",
    border: "border-slate-200",
    status: {
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      confirmed: "bg-cyan-50 text-cyan-600 border-cyan-200",
      completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
      cancelled: "bg-slate-100 text-slate-500 border-slate-200",
      flagged: "bg-rose-50 text-rose-600 border-rose-200",
    }
  },
  typography: {
    pageTitle: "text-3xl font-extrabold text-slate-900 tracking-tight leading-none",
    sectionHeading: "text-xl font-bold text-slate-900 tracking-tight",
    cardHeading: "text-sm font-semibold text-slate-900",
    body: "text-sm font-medium text-slate-700 leading-relaxed",
    muted: "text-xs font-medium text-slate-500",
    label: "text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5",
  },
  spacing: {
    pagePadding: "max-w-7xl mx-auto px-6 lg:px-8 py-8",
    sectionGap: "space-y-6",
    cardPadding: "p-6",
    formFieldGap: "space-y-4",
  },
  components: {
    buttonPrimary: "px-5 py-2.5 bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-60",
    buttonSecondary: "px-5 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-[0.98] rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
    buttonDanger: "px-5 py-2.5 bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98] rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
    buttonOutline: "px-5 py-2.5 bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98] rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
    
    input: "w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none",
    card: "bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300",
    badge: "px-2.5 py-0.5 rounded-full font-semibold text-[10px] tracking-wider uppercase border flex items-center justify-center w-fit",
    
    table: "w-full text-left border-collapse",
    tableHeaderRow: "bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider",
    tableRow: "hover:bg-slate-50/50 transition-colors border-b border-slate-100 text-sm h-[64px]",
    tableCell: "px-6 py-4",
    
    modalOverlay: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]",
    modalContent: "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200",
    
    sidebar: "fixed left-0 top-0 bottom-0 h-full w-[280px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 shadow-sm z-50",
    navbar: "bg-white/80 backdrop-blur-lg shadow-lg shadow-slate-100/40 py-3",
  }
};
