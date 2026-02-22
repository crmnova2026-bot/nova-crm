"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Search, X, Eye, Send, Printer, FileDown } from "lucide-react";
import { useCustomers } from "../../context/CustomersContext";

type OfferStatus = "Σε αναμονή" | "Εγκεκριμένη" | "Ακυρωμένη";

type Offer = {
  id: string;
  number: string;
  customer: string;
  date: string;
  total: string;
  status: OfferStatus;
  servicesLabel?: string;
  frequency?: string;
};

const SERVICES_LIST = [
  { id: "1", name: "Απεντόμωση" },
  { id: "2", name: "Μυοκτονία" },
  { id: "3", name: "Απεντόμωση & Μυοκτονία" },
  { id: "4", name: "Απεντόμωση ξυλοφάγα έντομα" },
  { id: "5", name: "Θερμική απεντόμωση" },
  { id: "6", name: "Μικροβιακή απολύμανση" },
] as const;

const FREQUENCY_OPTIONS = [
  "Μία φορά",
  "15 μέρες",
  "Μηνιαία",
  "Τριμηνιαία",
  "Εξαμηνιαία",
  "Ετήσια",
] as const;

const mockOffers: Offer[] = [
  { id: "1", number: "ΠΡ-2024-001", customer: "Επιχείρηση Α", date: "15/01/2024", total: "230,00 €", status: "Εγκεκριμένη", servicesLabel: "Απεντόμωση & Μυοκτονία", frequency: "Τριμηνιαία" },
  { id: "2", number: "ΠΡ-2024-002", customer: "Εταιρεία Β", date: "20/01/2024", total: "150,00 €", status: "Σε αναμονή", servicesLabel: "Απεντόμωση", frequency: "Μηνιαία" },
  { id: "3", number: "ΠΡ-2024-003", customer: "Όμιλος Γ", date: "22/01/2024", total: "400,00 €", status: "Ακυρωμένη", servicesLabel: "Θερμική απεντόμωση", frequency: "Μία φορά" },
];

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  customer: "",
  serviceIds: [] as string[],
  frequency: "",
  notes: "",
  total: "",
};

export default function OffersPage() {
  const { customers } = useCustomers();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.afm.includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, customerSearch]);

  useEffect(() => {
    if (!modalOpen) {
      setCustomerSearch("");
      setCustomerDropdownOpen(false);
    }
  }, [modalOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.date.includes(q) ||
        o.total.includes(q) ||
        o.status.toLowerCase().includes(q) ||
        (o.servicesLabel?.toLowerCase().includes(q)) ||
        (o.frequency?.toLowerCase().includes(q))
    );
  }, [offers, search]);

  const openModal = () => {
    setForm(initialForm);
    setCustomerSearch("");
    setCustomerDropdownOpen(false);
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
    const servicesLabel = form.serviceIds
      .map((id) => SERVICES_LIST.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "—";
    setOffers((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        number: nextNumber(),
        customer: form.customer,
        date: dateStr,
        total: totalStr,
        status: "Σε αναμονή" as OfferStatus,
        servicesLabel,
        frequency: form.frequency || "—",
      },
    ]);
    closeModal();
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleService = (id: string) => {
    setForm((f) =>
      f.serviceIds.includes(id)
        ? { ...f, serviceIds: f.serviceIds.filter((s) => s !== id) }
        : { ...f, serviceIds: [...f.serviceIds, id] }
    );
  };

  const statusStyles: Record<OfferStatus, string> = {
    "Σε αναμονή": "bg-amber-100 text-amber-800",
    "Εγκεκριμένη": "bg-emerald-100 text-emerald-800",
    "Ακυρωμένη": "bg-slate-200 text-slate-700",
  };

  const getOfferPrintHtml = (o: Offer) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Προσφορά ${o.number}</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 700px; margin: 2rem auto; padding: 1rem; color: #0f172a; }
      .header { border-bottom: 2px solid #0f172a; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
      .header h1 { margin: 0; font-size: 1.5rem; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 0.5rem 0.25rem; border-bottom: 1px solid #e2e8f0; }
      th { font-weight: 600; color: #475569; }
      .total { font-size: 1.25rem; font-weight: 700; margin-top: 1rem; }
    </style>
    </head>
    <body>
      <div class="header">
        <h1>NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ</h1>
        <p style="margin: 0.25rem 0 0 0; color: #64748b;">Προσφορά</p>
      </div>
      <table>
        <tr><th>Αριθμός Προσφοράς</th><td>${o.number}</td></tr>
        <tr><th>Πελάτης</th><td>${o.customer}</td></tr>
        <tr><th>Ημερομηνία</th><td>${o.date}</td></tr>
        <tr><th>Υπηρεσία(ες)</th><td>${o.servicesLabel ?? "—"}</td></tr>
        <tr><th>Συχνότητα Εφαρμογών</th><td>${o.frequency ?? "—"}</td></tr>
        <tr><th>Κατάσταση</th><td>${o.status}</td></tr>
        <tr><th>Σύνολο</th><td class="total">${o.total}</td></tr>
      </table>
    </body>
    </html>`;

  const handlePrint = (o: Offer) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(getOfferPrintHtml(o));
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const getOfferPdfFilename = (o: Offer) =>
    `Prosofora-${o.number.replace(/\s/g, "-")}.pdf`;

  const downloadOfferPdf = async (o: Offer) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.text("NOVA APOLYMANTIKI", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Prosofora", margin, y);
    y += 12;
    doc.setTextColor(15, 23, 42);

    const col1 = 45;
    const line = (label: string, value: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin, y);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(value, 120);
      doc.text(lines, margin + col1, y);
      y += Math.max(8, lines.length * 5 + 2);
    };

    line("Arithmos:", o.number);
    line("Pelatis:", o.customer);
    line("Imerominia:", o.date);
    line("Ypiresies:", o.servicesLabel ?? "—");
    line("Syxnotita:", o.frequency ?? "—");
    line("Katastasi:", o.status);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    line("Synolo:", o.total);

    doc.save(getOfferPdfFilename(o));
  };

  const handleSend = async (o: Offer) => {
    await downloadOfferPdf(o);
    const subject = encodeURIComponent(`Προσφορά ${o.number} - NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ`);
    const body = encodeURIComponent(
      `Καλημέρα,\n\nΣυνημμένα θα βρείτε την προσφορά ${o.number} σε μορφή PDF.\n\nΠαρακαλώ επισυνάψτε το αρχείο "${getOfferPdfFilename(o)}" που μόλις κατεβήκε στο Downloads σας και στείλτε το email.\n\n-- NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const updateOfferStatus = (offerId: string, newStatus: OfferStatus) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, status: newStatus } : offer
      )
    );
    if (previewOffer?.id === offerId) {
      setPreviewOffer((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
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
                <th className="px-4 py-3 font-semibold">Υπηρεσία(ες)</th>
                <th className="px-4 py-3 font-semibold">Συχνότητα Εφαρμογών</th>
                <th className="px-4 py-3 font-semibold">Ημερομηνία</th>
                <th className="px-4 py-3 font-semibold">Σύνολο</th>
                <th className="px-4 py-3 font-semibold">Κατάσταση</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
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
                    <td className="px-4 py-3 text-slate-700">{o.servicesLabel ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{o.frequency ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{o.date}</td>
                    <td className="px-4 py-3 text-slate-700">{o.total}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOfferStatus(o.id, e.target.value as OfferStatus)}
                        className={`min-w-[7rem] rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-slate-800 focus:ring-offset-0 ${statusStyles[o.status]}`}
                      >
                        <option value="Σε αναμονή">Σε αναμονή</option>
                        <option value="Εγκεκριμένη">Εγκεκριμένη</option>
                        <option value="Ακυρωμένη">Ακυρωμένη</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewOffer(o)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          title="Προεπισκόπηση"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSend(o)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          title="Αποστολή με email"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(o)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          title="Εκτύπωση"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadOfferPdf(o)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          title="Λήψη PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </button>
                      </div>
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
              <div ref={customerDropdownRef} className="relative">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Πελάτης
                </label>
                <input
                  type="text"
                  required
                  value={customerDropdownOpen ? customerSearch : form.customer}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (form.customer) updateForm("customer", "");
                    setCustomerDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setCustomerDropdownOpen(true);
                    if (form.customer) setCustomerSearch(form.customer);
                  }}
                  placeholder="Αναζήτηση ή επιλογή πελάτη (τίτλος, ΑΦΜ, τηλέφωνο)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
                {customerDropdownOpen && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {filteredCustomers.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-slate-500">
                        Δεν βρέθηκαν πελάτες. Προσθέστε πελάτες από τη σελίδα Πελάτες.
                      </li>
                    ) : (
                      filteredCustomers.map((c) => (
                        <li
                          key={c.id}
                          className="cursor-pointer px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
                          onClick={() => {
                            updateForm("customer", c.title);
                            setCustomerSearch("");
                            setCustomerDropdownOpen(false);
                          }}
                        >
                          <span className="font-medium">{c.title}</span>
                          <span className="ml-2 text-slate-500">{c.afm}</span>
                          <span className="ml-2 text-slate-500">{c.phone}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Υπηρεσία(ες)
                </label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-300 bg-slate-50/50 p-3">
                  {SERVICES_LIST.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={form.serviceIds.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                      />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Συχνότητα Εφαρμογών
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => updateForm("frequency", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="">— Επιλέξτε συχνότητα —</option>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
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

      {previewOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setPreviewOffer(null)}
        >
          <div
            id="offer-print-area"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Προσφορά {previewOffer.number}</h2>
                <p className="text-sm text-slate-500">NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOffer(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="font-medium text-slate-500">Πελάτης</dt><dd className="text-slate-900">{previewOffer.customer}</dd></div>
              <div><dt className="font-medium text-slate-500">Ημερομηνία</dt><dd className="text-slate-900">{previewOffer.date}</dd></div>
              <div><dt className="font-medium text-slate-500">Υπηρεσία(ες)</dt><dd className="text-slate-900">{previewOffer.servicesLabel ?? "—"}</dd></div>
              <div><dt className="font-medium text-slate-500">Συχνότητα Εφαρμογών</dt><dd className="text-slate-900">{previewOffer.frequency ?? "—"}</dd></div>
              <div><dt className="font-medium text-slate-500">Κατάσταση</dt><dd>
                <select
                  value={previewOffer.status}
                  onChange={(e) => updateOfferStatus(previewOffer.id, e.target.value as OfferStatus)}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-slate-800 ${statusStyles[previewOffer.status]}`}
                >
                  <option value="Σε αναμονή">Σε αναμονή</option>
                  <option value="Εγκεκριμένη">Εγκεκριμένη</option>
                  <option value="Ακυρωμένη">Ακυρωμένη</option>
                </select>
              </dd></div>
              <div className="border-t border-slate-200 pt-3"><dt className="font-medium text-slate-500">Σύνολο</dt><dd className="text-xl font-bold text-slate-900">{previewOffer.total}</dd></div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePrint(previewOffer)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                <Printer className="h-4 w-4" />
                Εκτύπωση
              </button>
              <button
                type="button"
                onClick={() => downloadOfferPdf(previewOffer)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileDown className="h-4 w-4" />
                Λήψη PDF
              </button>
              <button
                type="button"
                onClick={() => handleSend(previewOffer)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Send className="h-4 w-4" />
                Αποστολή (PDF)
              </button>
              <button
                type="button"
                onClick={() => setPreviewOffer(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
