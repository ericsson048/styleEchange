"use client";

import { useRef, useState, useCallback } from "react";
import {
  Map as MapboxMap,
  MapRef,
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { BURUNDI_CENTER, BURUNDI_BOUNDS, resolveLocationCoords } from "@/lib/burundi";
import { Button } from "@/components/ui/button";

interface MapProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  location: string | null;
  ownerName: string;
}

interface ProductsMapViewProps {
  products: MapProduct[];
}

export function ProductsMapView({ products }: ProductsMapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<MapProduct | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  // Filtrer les produits avec des coordonnées résolvables
  const mappable = products
    .map((p) => ({ ...p, coords: resolveLocationCoords(p.location) }))
    .filter((p): p is typeof p & { coords: [number, number] } => p.coords !== null);

  if (mappable.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ height: "420px" }}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: BURUNDI_CENTER[0],
          latitude: BURUNDI_CENTER[1],
          zoom: 7,
        }}
        maxBounds={BURUNDI_BOUNDS}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl position="top-right" />

        {mappable.map((product) => (
          <Marker
            key={product.id}
            longitude={product.coords[0]}
            latitude={product.coords[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(product);
            }}
          >
            <div className="cursor-pointer group relative">
              <div className={`
                rounded-full p-1.5 shadow-md transition-all
                ${selected?.id === product.id
                  ? "bg-accent text-accent-foreground scale-125"
                  : "bg-white text-accent border border-accent/30 group-hover:scale-110"}
              `}>
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          </Marker>
        ))}

        {selected && (
          <Popup
            longitude={resolveLocationCoords(selected.location)![0]}
            latitude={resolveLocationCoords(selected.location)![1]}
            anchor="top"
            onClose={() => setSelected(null)}
            closeButton={false}
            closeOnClick={false}
            maxWidth="220px"
          >
            <div className="p-1">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-1 right-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {selected.imageUrl && (
                <div className="h-28 w-full rounded-lg overflow-hidden mb-2 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.imageUrl.startsWith("data:") ? selected.imageUrl : selected.imageUrl}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="font-semibold text-sm line-clamp-1 text-foreground">{selected.title}</p>
              <p className="text-xs text-muted-foreground">{selected.ownerName}</p>
              <p className="text-accent font-bold text-sm mt-1">
                {selected.price.toLocaleString("fr-BI")} BIF
              </p>
              <Link href={`/product/${selected.id}`}>
                <Button size="sm" className="w-full mt-2 h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                  Voir l'article
                </Button>
              </Link>
            </div>
          </Popup>
        )}
      </MapboxMap>
    </div>
  );
}
