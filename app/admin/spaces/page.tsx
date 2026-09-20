"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import {
  formatRupiah,
  getErrorMessage,
  uploadSpaceImage,
  type Space,
  type SpacePayload,
} from "@/lib/api";
import {
  useAdminSpaces,
  useCreateSpaceMutation,
  useUpdateSpaceMutation,
  useDeleteSpaceMutation,
} from "@/lib/hooks/useAdmin";

const KOSONG = {
  nama_space: "",
  tipe_space: "desk",
  deskripsi: "",
  harga_per_jam: "",
  kapasitas: "",
  fasilitas: "",
  foto: "",
};

export default function AdminSpacesPage() {
  const { showToast } = useToast();
  const { data: items = [], isLoading, error } = useAdminSpaces();
  const createMutation = useCreateSpaceMutation();
  const updateMutation = useUpdateSpaceMutation();
  const deleteMutation = useDeleteSpaceMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

  const updateField = (key: keyof typeof KOSONG) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const bukaTambah = () => {
    setEditId(null);
    setForm(KOSONG);
    setFile(null);
    setFilePreview(null);
    setFormError("");
    setModalOpen(true);
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
    setFilePreview(space.gambar || null);
    setFormError("");
    setModalOpen(true);
  };

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      let fotoUrl = form.foto;
      if (file) {
        fotoUrl = await uploadSpaceImage(file);
      }

      const payload: SpacePayload = {
        nama_space: form.nama_space,
        tipe_space: form.tipe_space,
        deskripsi: form.deskripsi,
        harga_per_jam: Number(form.harga_per_jam),
        kapasitas: form.kapasitas ? Number(form.kapasitas) : undefined,
        fasilitas: form.fasilitas || undefined,
        foto: fotoUrl || undefined,
      };

      if (editId) {
        await updateMutation.mutateAsync({ id: editId, payload });
        showToast("Data ruangan berhasil diperbarui.", "success");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Ruangan baru berhasil ditambahkan.", "success");
      }

      setModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBukaHapus = (space: Space) => {
    setSpaceToDelete(space);
    setDeleteModalOpen(true);
  };

  const handleConfirmHapus = async () => {
    if (!spaceToDelete) return;
    try {
      await deleteMutation.mutateAsync(spaceToDelete.id);
      showToast(`Ruangan "${spaceToDelete.nama}" berhasil dihapus.`, "info");
      setDeleteModalOpen(false);
      setSpaceToDelete(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Ruangan / Space</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atur daftar tipe ruangan, kapasitas, tarif per jam, dan foto ruang coworking.
          </p>
        </div>

        <Button id="btn-tambah-space" onClick={bukaTambah} className="text-xs font-semibold">
          + Tambah Ruangan
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse h-64"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          Belum ada data ruangan. Klik &ldquo;Tambah Ruangan&rdquo; untuk memulai.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="list-admin-spaces">
          {items.map((space) => (
            <div
              key={space.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
            >
              <div className="relative h-44 w-full bg-gray-100">
                <img
                  src={space.gambar}
                  alt={space.nama}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-blue-600/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white">
                  {space.tipe}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{space.nama}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {space.deskripsi || "Tanpa deskripsi."}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Kapasitas: {space.kapasitas ? `${space.kapasitas} orang` : "-"}</span>
                    <span className="font-bold text-blue-600 text-sm">
                      {formatRupiah(space.hargaPerJam)} / jam
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="secondary"
                    onClick={() => bukaEdit(space)}
                    className="flex-1 text-xs"
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleBukaHapus(space)}
                    className="flex-1 text-xs"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Ruangan */}
      <Modal
        open={modalOpen}
        title={editId ? "Ubah Data Ruangan" : "Tambah Ruangan Baru"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={simpan} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              {formError}
            </div>
          )}

          <Input
            label="Nama Ruangan"
            id="modal-nama-space"
            value={form.nama_space}
            required
            placeholder="Contoh: Meeting Room Alpha"
            onChange={updateField("nama_space")}
          />

          <Input
            label="Tipe Ruangan"
            id="modal-tipe-space"
            list="tipe-space-options"
            value={form.tipe_space}
            required
            placeholder="Personal Desk / Meeting Room / Private Office"
            onChange={updateField("tipe_space")}
          />
          <datalist id="tipe-space-options">
            <option value="Personal Desk" />
            <option value="Meeting Room" />
            <option value="Private Office" />
          </datalist>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              id="modal-deskripsi-space"
              value={form.deskripsi}
              required
              placeholder="Deskripsi fasilitas dan keunggulan ruangan..."
              onChange={updateField("deskripsi")}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Harga Per Jam (Rp)"
              id="modal-harga-space"
              type="number"
              min={0}
              value={form.harga_per_jam}
              required
              placeholder="50000"
              onChange={updateField("harga_per_jam")}
            />

            <Input
              label="Kapasitas (Orang)"
              id="modal-kapasitas-space"
              type="number"
              min={1}
              value={form.kapasitas}
              placeholder="4"
              onChange={updateField("kapasitas")}
            />
          </div>

          <Input
            label="Fasilitas (Pisahkan Koma)"
            id="modal-fasilitas-space"
            value={form.fasilitas}
            placeholder="WiFi, Whiteboard, Proyektor, AC"
            onChange={updateField("fasilitas")}
          />

          {/* Preview Foto Sebelum Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Foto Ruangan
            </label>
            {filePreview && (
              <div className="mb-2 h-36 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={filePreview}
                  alt="Preview foto ruangan"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              id="modal-file-space"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" id="btn-submit-space" loading={submitting}>
              {editId ? "Simpan Perubahan" : "Tambah Ruangan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        open={deleteModalOpen}
        title="Hapus Ruangan"
        message={`Apakah Anda yakin ingin menghapus ruangan "${spaceToDelete?.nama}"?`}
        confirmText="Ya, Hapus Ruangan"
        cancelText="Batal"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmHapus}
        onClose={() => {
          setDeleteModalOpen(false);
          setSpaceToDelete(null);
        }}
      />
    </div>
  );
}
