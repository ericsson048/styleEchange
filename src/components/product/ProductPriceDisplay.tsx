"use client";

import { useCurrency } from "@/components/ui/currency-selector";

export function ProductPriceDisplay({ priceBIF }: { priceBIF: number }) {
  const { format } = useCurrency();
  return (
    <h1 className="text-4xl font-bold font-headline">{format(priceBIF)}</h1>
  );
}
