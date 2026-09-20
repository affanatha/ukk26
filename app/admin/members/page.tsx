"use client";

import { useState, useDeferredValue } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/toast-context";
import { getErrorMessage, uploadMemberImage, type Member } from "@/lib/api";
import {
  useAdminMembers,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} from "@/lib/hooks/useAdmin";

const KOSONG = {
  username: "",
  password: "",
  nama_member: "",
  instansi: "",
  alamat: "",
  telp: "",
  foto: "",
};

export default function AdminMembersPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data: items = [], isLoading, error } = useAdminMembers(deferredSearch || undefined);
  const createMutation = useCreateMemberMutation();
  const updateMutation = useUpdateMemberMutation();
  const deleteMutation = useDeleteMemberMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(KOSONG);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const updateField = (key: keyof typeof KOSONG) => (
    event: React.ChangeEvent<HTMLInputElement>
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

  const bukaEdit = (member: Member) => {
    setEditId(member.id);
    setForm({
      username: member.username,
      password: "",
      nama_member: member.nama,
      instansi: member.instansi || "",
      alamat: member.alamat || "",
      telp: member.telp || "",
      foto: String(member.raw?.foto ?? ""),
    });
    setFile(null);
    setFilePreview(member.foto || null);
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
        fotoUrl = await uploadMemberImage(file);
      }

      const payload = {
        nama_member: form.nama_member,
        instansi: form.instansi,
        alamat: form.alamat,
        telp: form.telp,
        foto: fotoUrl || undefined,
      };

      if (editId) {
        await updateMutation.mutateAsync({ id: editId, payload });
        showToast("Data member berhasil diperbarui.", "success");
      } else {
        await createMutation.mutateAsync({
          ...payload,
          username: form.username,
          password: form.password,
        });
        showToast("Member baru berhasil ditambahkan.", "success");
      }

      setModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBukaHapus = (member: Member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleConfirmHapus = async () => {
    if (!memberToDelete) return;
    try {
      await deleteMutation.mutateAsync(memberToDelete.id);
      showToast(`Member ${memberToDelete.nama} berhasil dihapus.`, "info");
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Data Member</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar member aktif dan manajemen hak akses pengguna coworking.
          </p>
        </div>
        <Button id="btn-tambah-member" onClick={bukaTambah} className="text-xs font-semibold">
          + Tambah Member
        </Button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          id="search-member-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari berdasarkan nama atau username..."
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
        <table className="w-full min-w-[700px] text-left text-sm" id="table-members">
          <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-5 py-3.5">Member</th>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Instansi</th>
              <th className="px-5 py-3.5">Telepon</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  Belum ada data member yang ditemukan.
                </td>
              </tr>
            ) : (
              items.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {member.foto ? (
                        <img
                          src={member.foto}
                          alt={member.nama}
                          className="h-9 w-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {member.nama.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{member.nama}</p>
                        {member.alamat && (
                          <p className="text-xs text-gray-400 line-clamp-1">{member.alamat}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-mono text-xs">{member.username}</td>
                  <td className="px-5 py-4 text-gray-600">{member.instansi || "-"}</td>
                  <td className="px-5 py-4 text-gray-600">{member.telp || "-"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => bukaEdit(member)}
                        className="px-3 py-1 text-xs"
                      >
                        Ubah
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleBukaHapus(member)}
                        className="px-3 py-1 text-xs"
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Tambah / Ubah Member */}
      <Modal
        open={modalOpen}
        title={editId ? "Ubah Data Member" : "Tambah Member Baru"}
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

          {!editId && (
            <>
              <Input
                label="Username"
                id="modal-username"
                value={form.username}
                required
                placeholder="username unik"
                onChange={updateField("username")}
              />
              <Input
                label="Kata Sandi"
                id="modal-password"
                type="password"
                value={form.password}
                required
                placeholder="Minimal 6 karakter"
                onChange={updateField("password")}
              />
            </>
          )}

          <Input
            label="Nama Lengkap"
            id="modal-nama"
            value={form.nama_member}
            required
            placeholder="Nama lengkap member"
            onChange={updateField("nama_member")}
          />
          <Input
            label="Instansi"
            id="modal-instansi"
            value={form.instansi}
            placeholder="Nama perusahaan / kampus"
            onChange={updateField("instansi")}
          />
          <Input
            label="Alamat"
            id="modal-alamat"
            value={form.alamat}
            placeholder="Alamat domisili"
            onChange={updateField("alamat")}
          />
          <Input
            label="Nomor Telepon"
            id="modal-telp"
            type="tel"
            value={form.telp}
            placeholder="081234567890"
            onChange={updateField("telp")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Foto Member
            </label>
            <div className="flex items-center gap-3">
              {filePreview && (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="h-10 w-10 rounded-full object-cover border border-gray-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" id="btn-submit-member" loading={submitting}>
              {editId ? "Simpan Perubahan" : "Tambah Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Member */}
      <ConfirmDialog
        open={deleteModalOpen}
        title="Hapus Member"
        message={`Apakah Anda yakin ingin menghapus member "${memberToDelete?.nama}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
        confirmText="Ya, Hapus Member"
        cancelText="Batal"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmHapus}
        onClose={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
      />
    </div>
  );
}
