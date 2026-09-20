const tone: Record<string, string> = {
  menunggu: "bg-amber-50 text-amber-700",
  disetujui: "bg-emerald-50 text-emerald-700",
  ditolak: "bg-red-50 text-red-700",
  dibatalkan: "bg-gray-100 text-gray-600",
  selesai: "bg-blue-50 text-blue-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toLowerCase();

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        tone[key] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "-"}
    </span>
  );
}
