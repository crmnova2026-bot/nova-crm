"use client";

import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";

type Service = {
  id: string;
  name: string;
  code: string;
  price: string;
  status: "Ενεργή" | "Ανενεργή";
};

const mockServices: Service[] = [
  { id: "1", name: "Απεντόμωση", code: "APE-01", price: "—", status: "Ενεργή" },
  { id: "2", name: "Μυοκτονία", code: "MYO-01", price: "—", status: "Ενεργή" },
  { id: "3", name: "Απεντόμωση & Μυοκτονία", code: "APE-MYO-01", price: "—", status: "Ενεργή" },
  { id: "4", name: "Απεντόμωση ξυλοφάγα έντομα", code: "APE-02", price: "—", status: "Ενεργή" },
  { id: "5", name: "Θερμική απεντόμωση", code: "THE-01", price: "—", status: "Ενεργή" },
  { id: "6", name: "Μικροβιακή απολύμανση", code: "MIK-01", price: "—", status: "Ενεργή" },
];

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  name: "",
  code: "",
  description: "",
  price: "",
};

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState<Service[]>(mockServices);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.price.includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [services, search]);

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceStr = form.price ? `${form.price.replace(",", ".")} €` : "—";
    setServices((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: form.name,
        code: form.code,
        price: priceStr,
        status: "Ενεργή",
      },
    ]);
    closeModal();
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Υπηρεσίες</h1>
          <p className="mt-1 text-slate-600">
            Διαχείριση υπηρεσιών απολύμανσης NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Προσθήκη Υπηρεσίας
        </button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Αναζήτηση (όνομα, κωδικός, τιμή, κατάσταση)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder-slate-500 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="px-4 py-3 font-semibold">Όνομα Υπηρεσίας</th>
                <th className="px-4 py-3 font-semibold">Κωδικός</th>
                <th className="px-4 py-3 font-semibold">Τιμή</th>
                <th className="px-4 py-3 font-semibold">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Δεν βρέθηκαν υπηρεσίες.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-700">{s.code}</td>
                    <td className="px-4 py-3 text-slate-700">{s.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.status === "Ενεργή"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Προσθήκη Υπηρεσίας</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Ημερομηνία
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Όνομα Υπηρεσίας
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="π.χ. Απολύμανση χώρου"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Κωδικός
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  placeholder="π.χ. APO-01"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Περιγραφή
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  placeholder="Περιγραφή υπηρεσίας..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Τιμή (€)
                </label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="π.χ. 150,00"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Αποθήκευση
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ακύρωση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
