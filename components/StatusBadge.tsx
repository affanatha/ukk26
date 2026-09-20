const tone: Record<string, string> = {
  menunggu: "bg-amber-50 text-amber-700 border-amber-200",
  "belum dikonfirmasi": "bg-amber-50 text-amber-700 border-amber-200",
  disetujui: "bg-emerald-50 text-emerald-700 border-emerald-200",
  aktif: "bg-purple-50 text-purple-700 border-purple-200",
  ditolak: "bg-red-50 text-red-700 border-red-200",
  dibatalkan: "bg-gray-100 text-gray-600 border-gray-200",
  selesai: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toLowerCase().trim();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border capitalize ${
        tone[key] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          key === "disetujui"
            ? "bg-emerald-500"
            : key === "aktif"
            ? "bg-purple-500"
            : key === "menunggu" || key === "belum dikonfirmasi"
            ? "bg-amber-500"
            : key === "ditolak"
            ? "bg-red-500"
            : key === "selesai"
            ? "bg-blue-500"
            : "bg-gray-400"
        }`}
      />
      {status || "-"}
    </span>
  );
}
