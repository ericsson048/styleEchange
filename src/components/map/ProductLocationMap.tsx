"use client";

import { useRef, useState } from "react";
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
import { MapPin } from "lucide-react";
import { BURUNDI_CENTER, BURUNDI_BOUNDS } from "@/lib/burundi";

interface ProductLocationMapProps {
  /** Coordonnées [lng, lat] du produit */
  coords: [number, number];
  /** Texte affiché dans le popup */
  label: string;
  /** Hauteur de la carte */
  height?: string;
}

export function ProductLocationMap({
  coords,
  label,
  height = "240px",
}: ProductLocationMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [showPopup, setShowPopup] = useState(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height }}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: coords[0],
          latitude: coords[1],
          zoom: 9,
        }}
        maxBounds={BURUNDI_BOUNDS}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        <Marker
          longitude={coords[0]}
          latitude={coords[1]}
          anchor="bottom"
          onClick={() => setShowPopup(true)}
        >
          <div className="cursor-pointer group">
            <div className="bg-accent text-accent-foreground rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </Marker>

        {showPopup && (
          <Popup
            longitude={coords[0]}
            latitude={coords[1]}
            anchor="top"
            onClose={() => setShowPopup(false)}
            closeButton
            closeOnClick={false}
            className="text-sm font-medium"
          >
            <div className="px-1 py-0.5 text-foreground font-medium text-sm">
              📍 {label}
            </div>
          </Popup>
        )}
      </MapboxMap>
    </div>
  );
}
