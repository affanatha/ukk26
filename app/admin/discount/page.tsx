"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/lib/toast-context";
import { getErrorMessage, type Diskon } from "@/lib/api";
import {
  useAdminDiskon,
  useCreateDiskonMutation,
  useUpdateDiskonMutation,
  useDeleteDiskonMutation,
} from "@/lib/hooks/useAdmin";

const KOSONG = {
  nama_diskon: "",
  persentase_diskon: "",
  tanggal_mulai: "",
  tanggal_berakhir: "",
};

export default function AdminDiscountPage() {
  const { showToast } = useToast();
  const { data: items = [], isLoading, error } = useAdminDiskon();
  const createMutation = useCreateDiskonMutation();
  const updateMutation = useUpdateDiskonMutation();
  const deleteMutation = useDeleteDiskonMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [diskonToDelete, setDiskonToDelete] = useState<Diskon | null>(null);

  const updateField = (key: keyof typeof KOSONG) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const bukaTambah = () => {
    setEditId(null);
    setForm(KOSONG);
    setFormError("");
    setModalOpen(true);
  };

  const bukaEdit = (diskon: Diskon) => {
    setEditId(diskon.id);
    setForm({
      nama_diskon: diskon.nama,
      persentase_diskon: String(diskon.persentase),
      tanggal_mulai: (diskon.tanggalMulai || "").slice(0, 10),
      tanggal_berakhir: (diskon.tanggalBerakhir || "").slice(0, 10),
    });
    setFormError("");
    setModalOpen(true);
  };

  const simpan = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    // Validasi tanggal mulai < tanggal berakhir
    if (new Date(form.tanggal_berakhir) < new Date(form.tanggal_mulai)) {
      setFormError("Tanggal berakhir promo tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nama_diskon: form.nama_diskon,
        persentase_diskon: Number(form.persentase_diskon),
        tanggal_mulai: form.tanggal_mulai,
        tanggal_berakhir: form.tanggal_berakhir,
      };

      if (editId) {
        await updateMutation.mutateAsync({ id: editId, payload });
        showToast("Voucher diskon berhasil diperbarui.", "success");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("Voucher diskon baru berhasil dibuat.", "success");
      }

      setModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBukaHapus = (diskon: Diskon) => {
    setDiskonToDelete(diskon);
    setDeleteModalOpen(true);
  };

  const handleConfirmHapus = async () => {
    if (!diskonToDelete) return;
    try {
      await deleteMutation.mutateAsync(diskonToDelete.id);
      showToast(`Promo ${diskonToDelete.nama} berhasil dihapus.`, "info");
      setDeleteModalOpen(false);
      setDiskonToDelete(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Diskon & Promo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar kode voucher potongan harga untuk menarik reservasi member.
          </p>
        </div>

        <Button id="btn-tambah-diskon" onClick={bukaTambah} className="text-xs font-semibold">
          + Tambah Promo
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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse h-28"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          Belum ada promo diskon yang aktif atau dibuat.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" id="list-diskon">
          {items.map((diskon) => {
            const isExpired = new Date(diskon.tanggalBerakhir) < new Date();

            return (
              <div
                key={diskon.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-gray-900 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {diskon.nama}
                      </span>
                      {isExpired && (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          Kedaluwarsa
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-blue-600">
                      {diskon.persentase}% OFF
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Periode: {(diskon.tanggalMulai || "-").slice(0, 10)} s/d{" "}
                      {(diskon.tanggalBerakhir || "-").slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="secondary"
                    onClick={() => bukaEdit(diskon)}
                    className="px-3 py-1 text-xs"
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleBukaHapus(diskon)}
                    className="px-3 py-1 text-xs"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Promo */}
      <Modal
        open={modalOpen}
        title={editId ? "Ubah Promo Diskon" : "Tambah Promo Diskon Baru"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={simpan} className="space-y-4">
          {formError && (
            <div
              id="modal-diskon-error"
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              {formError}
            </div>
          )}

          <Input
            label="Nama / Kode Voucher Promo"
            id="modal-nama-diskon"
            value={form.nama_diskon}
            required
            placeholder="Contoh: MERDEKA50"
            onChange={updateField("nama_diskon")}
          />

          <Input
            label="Persentase Potongan (%)"
            id="modal-persentase-diskon"
            type="number"
            min={1}
            max={100}
            value={form.persentase_diskon}
            required
            placeholder="1 - 100"
            onChange={updateField("persentase_diskon")}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Tanggal Mulai Berlaku"
              id="modal-tgl-mulai"
              type="date"
              value={form.tanggal_mulai}
              required
              onChange={updateField("tanggal_mulai")}
            />

            <Input
              label="Tanggal Berakhir"
              id="modal-tgl-akhir"
              type="date"
              value={form.tanggal_berakhir}
              required
              onChange={updateField("tanggal_berakhir")}
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
            <Button type="submit" id="btn-submit-diskon" loading={submitting}>
              {editId ? "Simpan Perubahan" : "Buat Promo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmDialog
        open={deleteModalOpen}
        title="Hapus Promo Diskon"
        message={`Apakah Anda yakin ingin menghapus voucher "${diskonToDelete?.nama}"?`}
        confirmText="Ya, Hapus Promo"
        cancelText="Batal"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmHapus}
        onClose={() => {
          setDeleteModalOpen(false);
          setDiskonToDelete(null);
        }}
      />
    </div>
  );
}
