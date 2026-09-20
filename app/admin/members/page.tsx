"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import {
  createMember,
  deleteMember,
  getErrorMessage,
  getMembers,
  updateMember,
  uploadMemberImage,
  type Member,
} from "@/lib/api";

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
  const [items, setItems] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
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

    getMembers(search || undefined)
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (key: keyof typeof KOSONG) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const bukaTambah = () => {
    setEditId(null);
    setForm(KOSONG);
    setFile(null);
    setOpen(true);
  };

  const bukaEdit = (member: Member) => {
    setEditId(member.id);
    setForm({
      username: member.username,
      password: "",
      nama_member: member.nama,
      instansi: member.instansi,
      alamat: member.alamat,
      telp: member.telp,
      foto: String(member.raw?.foto ?? ""),
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
      if (file) foto = await uploadMemberImage(file);

      const payload = {
        nama_member: form.nama_member,
        instansi: form.instansi,
        alamat: form.alamat,
        telp: form.telp,
        foto: foto || undefined,
      };

      if (editId) {
        await updateMember(editId, payload);
      } else {
        await createMember({
          ...payload,
          username: form.username,
          password: form.password,
        });
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
    if (!window.confirm("Hapus member ini?")) return;

    try {
      await deleteMember(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Member</h1>
        <Button onClick={bukaTambah}>Tambah member</Button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari nama member"
        className="mt-6 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
      />

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat member…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Nama</th>
                <th className="px-5 py-4 font-medium">Username</th>
                <th className="px-5 py-4 font-medium">Instansi</th>
                <th className="px-5 py-4 font-medium">Telepon</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {member.nama}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{member.username}</td>
                  <td className="px-5 py-4 text-gray-600">{member.instansi}</td>
                  <td className="px-5 py-4 text-gray-600">{member.telp}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => bukaEdit(member)}>
                        Ubah
                      </Button>

                      <Button variant="danger" onClick={() => hapus(member.id)}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Belum ada member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        title={editId ? "Ubah member" : "Tambah member"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={simpan} className="space-y-4">
          {!editId && (
            <>
              <Input label="Username" value={form.username} required onChange={update("username")} />
              <Input
                label="Kata sandi"
                type="password"
                value={form.password}
                required
                onChange={update("password")}
              />
            </>
          )}

          <Input label="Nama lengkap" value={form.nama_member} required onChange={update("nama_member")} />
          <Input label="Instansi" value={form.instansi} onChange={update("instansi")} />
          <Input label="Alamat" value={form.alamat} onChange={update("alamat")} />
          <Input label="Nomor telepon" value={form.telp} onChange={update("telp")} />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Foto</span>

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
