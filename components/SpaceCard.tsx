import Link from "next/link";
import { formatRupiah, type Space } from "@/lib/api";

export default function SpaceCard({
  space,
  href,
}: {
  space: Space;
  href?: string;
}) {
  return (
    <div
      data-testid="space-card"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-48 w-full bg-gray-100">
        <img
          src={space.gambar}
          alt={space.nama}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blue-600/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white">
            {space.tipe}
          </span>
          {space.kapasitas && (
            <span className="rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-white">
              {space.kapasitas} Orang
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{space.nama}</h2>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {space.deskripsi || "Tempat kerja nyaman dengan fasilitas lengkap."}
          </p>

          {space.fasilitas && space.fasilitas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {space.fasilitas.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600 border border-gray-100"
                >
                  {item}
                </span>
              ))}
              {space.fasilitas.length > 3 && (
                <span className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
                  +{space.fasilitas.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400">Tarif per jam</p>
            <p className="text-base font-bold text-blue-600">
              {formatRupiah(space.hargaPerJam)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/member/${space.id}`}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Detail
            </Link>
            <Link
              href={href ?? `/member/reservation?spaceId=${space.id}`}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Pesan Space
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
