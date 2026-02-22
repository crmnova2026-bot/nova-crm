"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Search, X, FileSpreadsheet } from "lucide-react";

type Product = {
  id: string;
  name: string;
  code: string;
  price: string;
  unit: string;
  status: "Ενεργό" | "Ανενεργό";
};

const UNIT_OPTIONS = ["τεμάχιο", "κιλό", "λίτρο", "κουτί", "συσκ."];

const mockProducts: Product[] = [
  { id: "1", name: "Πρόσθετο απολύμανσης", code: "PR-01", price: "12,50 €", unit: "λίτρο", status: "Ενεργό" },
  { id: "2", name: "Φίλτρο αερίου", code: "FL-01", price: "8,00 €", unit: "τεμάχιο", status: "Ενεργό" },
];

const initialForm = {
  name: "",
  code: "",
  price: "",
  unit: UNIT_OPTIONS[0],
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.price.includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceStr = form.price ? `${form.price.replace(",", ".")} €` : "—";
    setProducts((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: form.name,
        code: form.code,
        price: priceStr,
        unit: form.unit,
        status: "Ενεργό",
      },
    ]);
    closeModal();
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setImportError(null);
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setImportError("Δεχόμαστε μόνο αρχεία Excel (.xlsx ή .xls).");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 }) as (string | number)[][];
      if (rows.length < 2) {
        setImportError("Το αρχείο πρέπει να έχει τουλάχιστον γραμμή επικεφαλίδας και μία γραμμή δεδομένων.");
        return;
      }
      const headers = (rows[0] as (string | number)[]).map((h) => String(h).trim().toLowerCase());
      const nameCol = headers.findIndex((h) => h === "όνομα" || h === "onoma" || h === "name" || h === "ονομα προιοντος");
      const codeCol = headers.findIndex((h) => h === "κωδικός" || h === "κωδικος" || h === "code" || h === "kodikos");
      const priceCol = headers.findIndex((h) => h === "τιμή" || h === "τιμη" || h === "price" || h === "timh");
      const unitCol = headers.findIndex((h) => h === "μονάδα" || h === "μοναδα" || h === "unit" || h === "monada");
      const hasHeaders = nameCol >= 0 || codeCol >= 0 || priceCol >= 0;
      const startRow = hasHeaders ? 1 : 0;
      const cols = hasHeaders
        ? { name: nameCol >= 0 ? nameCol : 0, code: codeCol >= 0 ? codeCol : 1, price: priceCol >= 0 ? priceCol : 2, unit: unitCol >= 0 ? unitCol : 3 }
        : { name: 0, code: 1, price: 2, unit: 3 };

      const newProducts: Product[] = [];
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i] as (string | number)[];
        const nameVal = row[cols.name] != null ? String(row[cols.name]).trim() : "";
        if (!nameVal) continue;
        const codeVal = row[cols.code] != null ? String(row[cols.code]).trim() : "";
        const priceVal = row[cols.price] != null ? String(row[cols.price]).trim() : "";
        const num = priceVal.replace(",", ".");
        const priceStr = num && !Number.isNaN(Number(num)) ? `${Number(num).toFixed(2).replace(".", ",")} €` : "—";
        const unitVal = row[cols.unit] != null ? String(row[cols.unit]).trim() : UNIT_OPTIONS[0];
        const unit = UNIT_OPTIONS.includes(unitVal) ? unitVal : (unitVal || UNIT_OPTIONS[0]);
        newProducts.push({
          id: String(products.length + newProducts.length + 1),
          name: nameVal,
          code: codeVal || "—",
          price: priceStr,
          unit,
          status: "Ενεργό",
        });
      }
      if (newProducts.length === 0) {
        setImportError("Δεν βρέθηκαν έγκυρες γραμμές στο αρχείο. Ελέγξτε ότι η πρώτη γραμμή έχει επικεφαλίδες: Όνομα, Κωδικός, Τιμή, Μονάδα.");
        return;
      }
      setProducts((prev) => [...prev, ...newProducts]);
    } catch (err) {
      console.error(err);
      setImportError("Σφάλμα ανάγνωσης αρχείου. Βεβαιωθείτε ότι είναι έγκυρο αρχείο Excel.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Προϊόντα</h1>
          <p className="mt-1 text-slate-600">
            Διαχείριση προϊόντων NOVA ΑΠΟΛΥΜΑΝΤΙΚΗ · Εισαγωγή από Excel
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Εισαγωγή από Excel
          </button>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Προσθήκη Προϊόντος
          </button>
        </div>
      </header>

      {importError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {importError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Αναζήτηση (όνομα, κωδικός, τιμή, μονάδα)..."
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
                <th className="px-4 py-3 font-semibold">Όνομα Προϊόντος</th>
                <th className="px-4 py-3 font-semibold">Κωδικός</th>
                <th className="px-4 py-3 font-semibold">Τιμή</th>
                <th className="px-4 py-3 font-semibold">Μονάδα</th>
                <th className="px-4 py-3 font-semibold">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Δεν βρέθηκαν προϊόντα. Προσθέστε με το κουμπί πάνω ή εισάγετε από Excel.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-700">{p.code}</td>
                    <td className="px-4 py-3 text-slate-700">{p.price}</td>
                    <td className="px-4 py-3 text-slate-700">{p.unit}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.status === "Ενεργό"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.status}
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
              <h2 className="text-lg font-bold text-slate-900">Προσθήκη Προϊόντος</h2>
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
                  Όνομα Προϊόντος
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="π.χ. Πρόσθετο απολύμανσης"
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
                  placeholder="π.χ. PR-01"
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
                  placeholder="π.χ. 12,50"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Μονάδα
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
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
