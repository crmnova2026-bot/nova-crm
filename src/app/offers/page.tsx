"use client";

import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";

type OfferStatus = "Σε αναμονή" | "Εγκεκριμένη" | "Ακυρωμένη";

type Offer = {
  id: string;
  number: string;
  customer: string;
  date: string;
  total: string;
  status: OfferStatus;
};

const mockOffers: Offer[] = [
  { id: "1", number: "ΠΡ-2024-001", customer: "Επιχείρηση Α", date: "15/01/2024", total: "230,00 €", status: "Εγκεκριμένη" },
  { id: "2", number: "ΠΡ-2024-002", customer: "Εταιρεία Β", date: "20/01/2024", total: "150,00 €", status: "Σε αναμονή" },
  { id: "3", number: "ΠΡ-2024-003", customer: "Όμιλος Γ", date: "22/01/2024", total: "400,00 €", status: "Ακυρωμένη" },
];

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  customer: "",
  services: "",
  notes: "",
  total: "",
};

export default function OffersPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.date.includes(q) ||
        o.total.includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [offers, search]);

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const nextNumber = () => {
    const max = offers.reduce((acc, o) => {
      const n = parseInt(o.number.split("-").pop() ?? "0", 10);
      return n > acc ? n : acc;
    }, 0);
    return `ΠΡ-2024-${String(max + 1).padStart(3, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = form.date.split("-").reverse().join("/");
    const totalStr = form.total ? `${form.total.replace(",", ".")} €` : "0,00 €";
    setOffers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        number: nextNumber(),
        customer: form.customer,
        date: dateStr,
        total: totalStr,
        status: "Σε αναμονή" as OfferStatus,
      },
    ]);
    closeModal();
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const statusStyles: Record<OfferStatus, string> = {
    "Σε αναμονή": "bg-amber-100 text-amber-800",
    "Εγκεκριμένη": "bg-emerald-100 text-emerald-800",
    "Ακυρωμένη": "bg-slate-200 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Προσφορές</h1>
          <p className="mt-1 text-slate-600">
            Διαχείριση προσφορών NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Προσθήκη Προσφοράς
        </button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Αναζήτηση (αριθμός, πελάτης, ημερομηνία, σύνολο, κατάσταση)..."
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
                <th className="px-4 py-3 font-semibold">Αριθμός Προσφοράς</th>
                <th className="px-4 py-3 font-semibold">Πελάτης</th>
                <th className="px-4 py-3 font-semibold">Ημερομηνία</th>
                <th className="px-4 py-3 font-semibold">Σύνολο</th>
                <th className="px-4 py-3 font-semibold">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Δεν βρέθηκαν προσφορές.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{o.number}</td>
                    <td className="px-4 py-3 text-slate-700">{o.customer}</td>
                    <td className="px-4 py-3 text-slate-700">{o.date}</td>
                    <td className="px-4 py-3 text-slate-700">{o.total}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[o.status]}`}
                      >
                        {o.status}
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
              <h2 className="text-lg font-bold text-slate-900">Προσθήκη Προσφοράς</h2>
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
                  Πελάτης
                </label>
                <input
                  type="text"
                  required
                  value={form.customer}
                  onChange={(e) => updateForm("customer", e.target.value)}
                  placeholder="Διακριτικός τίτλος ή όνομα πελάτη"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Υπηρεσίες
                </label>
                <textarea
                  value={form.services}
                  onChange={(e) => updateForm("services", e.target.value)}
                  rows={3}
                  placeholder="Υπηρεσίες που περιλαμβάνονται (π.χ. Απολύμανση χώρου, Εντομοκτόνος)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Σημειώσεις
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  rows={2}
                  placeholder="Προαιρετικές σημειώσεις..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Σύνολο (€)
                </label>
                <input
                  type="text"
                  value={form.total}
                  onChange={(e) => updateForm("total", e.target.value)}
                  placeholder="π.χ. 230,00"
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
