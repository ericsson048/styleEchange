"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, CurrencyCode, formatPrice, convertPrice } from "@/lib/burundi";

// Context global pour la devise sélectionnée
interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountBIF: number) => string;
  convert: (amountBIF: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "BIF",
  setCurrency: () => {},
  format: (a) => `${a} BIF`,
  convert: (a) => a,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("BIF");

  const format = (amountBIF: number) => formatPrice(convertPrice(amountBIF, currency), currency);
  const convert = (amountBIF: number) => convertPrice(amountBIF, currency);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencySelector({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
      <SelectTrigger className={className ?? "w-28 h-8 text-xs"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            <span className="font-mono font-bold">{c.symbol}</span>
            <span className="ml-1 text-muted-foreground">{c.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
