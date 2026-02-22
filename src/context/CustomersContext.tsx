"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Customer = {
  id: string;
  title: string;
  afm: string;
  phone: string;
  status: "Ενεργός" | "Ανενεργός";
};

const initialCustomers: Customer[] = [
  { id: "1", title: "Επιχείρηση Α", afm: "123456789", phone: "210 1234567", status: "Ενεργός" },
  { id: "2", title: "Εταιρεία Β", afm: "987654321", phone: "210 7654321", status: "Ανενεργός" },
  { id: "3", title: "Όμιλος Γ", afm: "111222333", phone: "231 1112233", status: "Ενεργός" },
];

type CustomersContextValue = {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id">) => void;
};

const CustomersContext = createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = useCallback((customer: Omit<Customer, "id">) => {
    setCustomers((prev) => [
      ...prev,
      {
        ...customer,
        id: String(prev.length + 1),
      },
    ]);
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, addCustomer }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}
