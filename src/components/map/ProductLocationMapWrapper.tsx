"use client";

import dynamic from "next/dynamic";

const ProductLocationMap = dynamic(
  () => import("@/components/map/ProductLocationMap").then((m) => m.ProductLocationMap),
  {
    ssr: false,
    loading: () => <div className="h-[220px] rounded-xl bg-muted animate-pulse" />,
  }
);

interface Props {
  coords: [number, number];
  label: string;
  height?: string;
}

export function ProductLocationMapWrapper(props: Props) {
  return <ProductLocationMap {...props} />;
}
