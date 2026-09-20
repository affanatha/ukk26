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
    <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
      <img
        src={space.gambar}
        alt={space.nama}
        className="h-48 w-full object-cover"
      />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {space.tipe}
          </span>

          <h2 className="text-xl font-bold text-gray-800">{space.nama}</h2>

          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {space.deskripsi}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400">Harga per jam</p>
            <p className="text-lg font-bold text-blue-600">
              {formatRupiah(space.hargaPerJam)}
            </p>
          </div>

          <Link
            href={href ?? `/member/${space.id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
