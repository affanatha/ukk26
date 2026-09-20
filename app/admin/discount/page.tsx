"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import {
  createDiskon,
  deleteDiskon,
  getAdminDiskon,
  getErrorMessage,
  updateDiskon,
  type Diskon,
} from "@/lib/api";

const KOSONG = {
  nama_diskon: "",
  persentase_diskon: "",
  tanggal_mulai: "",
  tanggal_berakhir: "",
};

export default function AdminDiscountPage() {
  const [items, setItems] = useState<Diskon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    getAdminDiskon()
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
    setOpen(true);
  };

  const bukaEdit = (diskon: Diskon) => {
    setEditId(diskon.id);
    setForm({
      nama_diskon: diskon.nama,
      persentase_diskon: String(diskon.persentase),
      tanggal_mulai: (diskon.tanggalMulai || "").slice(0, 10),
      tanggal_berakhir: (diskon.tanggalBerakhir || "").slice(0, 10),
    });
    setOpen(true);
  };

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        nama_diskon: form.nama_diskon,
        persentase_diskon: Number(form.persentase_diskon),
        tanggal_mulai: form.tanggal_mulai,
        tanggal_berakhir: form.tanggal_berakhir,
      };

      if (editId) {
        await updateDiskon(editId, payload);
      } else {
        await createDiskon(payload);
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
    if (!window.confirm("Hapus diskon ini?")) return;

    try {
      await deleteDiskon(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Diskon</h1>
        <Button onClick={bukaTambah}>Tambah diskon</Button>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat diskon…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-gray-500">Belum ada diskon.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((diskon) => (
            <div
              key={diskon.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-lg font-bold text-gray-900">{diskon.nama}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Potongan {diskon.persentase}% ·{" "}
                  {(diskon.tanggalMulai || "-").slice(0, 10)} s/d{" "}
                  {(diskon.tanggalBerakhir || "-").slice(0, 10)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => bukaEdit(diskon)}>
                  Ubah
                </Button>

                <Button variant="danger" onClick={() => hapus(diskon.id)}>
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editId ? "Ubah diskon" : "Tambah diskon"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={simpan} className="space-y-4">
          <Input
            label="Nama / kode diskon"
            value={form.nama_diskon}
            required
            onChange={update("nama_diskon")}
          />

          <Input
            label="Persentase"
            type="number"
            min={1}
            max={100}
            value={form.persentase_diskon}
            required
            onChange={update("persentase_diskon")}
          />

          <Input
            label="Tanggal mulai"
            type="date"
            value={form.tanggal_mulai}
            required
            onChange={update("tanggal_mulai")}
          />

          <Input
            label="Tanggal berakhir"
            type="date"
            value={form.tanggal_berakhir}
            required
            onChange={update("tanggal_berakhir")}
          />

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
