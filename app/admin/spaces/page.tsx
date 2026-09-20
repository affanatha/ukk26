"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import {
  createSpace,
  deleteSpace,
  formatRupiah,
  getAdminSpaces,
  getErrorMessage,
  updateSpace,
  uploadSpaceImage,
  type Space,
  type SpacePayload,
} from "@/lib/api";

const KOSONG = {
  nama_space: "",
  tipe_space: "",
  deskripsi: "",
  harga_per_jam: "",
  kapasitas: "",
  fasilitas: "",
  foto: "",
};

export default function AdminSpacesPage() {
  const [items, setItems] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    getAdminSpaces()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const update = (key: keyof typeof KOSONG) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const bukaTambah = () => {
    setEditId(null);
    setForm(KOSONG);
    setFile(null);
    setOpen(true);
  };

  const bukaEdit = (space: Space) => {
    setEditId(space.id);
    setForm({
      nama_space: space.nama,
      tipe_space: space.tipe,
      deskripsi: space.deskripsi,
      harga_per_jam: String(space.hargaPerJam),
      kapasitas: space.kapasitas ? String(space.kapasitas) : "",
      fasilitas: space.fasilitas.join(", "),
      foto: String(space.raw?.foto ?? space.raw?.gambar ?? ""),
    });
    setFile(null);
    setOpen(true);
  };

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      let foto = form.foto;

      if (file) {
        foto = await uploadSpaceImage(file);
      }

      const payload: SpacePayload = {
        nama_space: form.nama_space,
        tipe_space: form.tipe_space,
        deskripsi: form.deskripsi,
        harga_per_jam: Number(form.harga_per_jam),
        kapasitas: form.kapasitas ? Number(form.kapasitas) : undefined,
        fasilitas: form.fasilitas || undefined,
        foto: foto || undefined,
      };

      if (editId) {
        await updateSpace(editId, payload);
      } else {
        await createSpace(payload);
      }

      setOpen(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const hapus = async (id: number) => {
    if (!window.confirm("Hapus ruangan ini?")) return;

    try {
      await deleteSpace(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Ruangan</h1>
        <Button onClick={bukaTambah}>Tambah ruangan</Button>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat ruangan…</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((space) => (
            <div
              key={space.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <img
                src={space.gambar}
                alt={space.nama}
                className="h-40 w-full object-cover"
              />

              <div className="p-5">
                <p className="text-sm text-gray-500">{space.tipe}</p>
                <h2 className="text-lg font-bold text-gray-900">{space.nama}</h2>
                <p className="mt-1 font-semibold text-blue-600">
                  {formatRupiah(space.hargaPerJam)} / jam
                </p>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => bukaEdit(space)}>
                    Ubah
                  </Button>

                  <Button variant="danger" onClick={() => hapus(space.id)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editId ? "Ubah ruangan" : "Tambah ruangan"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={simpan} className="space-y-4">
          <Input label="Nama ruangan" value={form.nama_space} required onChange={update("nama_space")} />
          <Input label="Tipe" value={form.tipe_space} required onChange={update("tipe_space")} />
          <Input label="Deskripsi" value={form.deskripsi} onChange={update("deskripsi")} />
          <Input
            label="Harga per jam"
            type="number"
            min={0}
            value={form.harga_per_jam}
            required
            onChange={update("harga_per_jam")}
          />
          <Input
            label="Kapasitas"
            type="number"
            min={0}
            value={form.kapasitas}
            onChange={update("kapasitas")}
          />
          <Input
            label="Fasilitas"
            value={form.fasilitas}
            hint="Pisahkan dengan koma"
            onChange={update("fasilitas")}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Foto ruangan
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>

            <Button type="submit" loading={saving}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
