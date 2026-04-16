"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PROVINCES_BURUNDI, COMMUNES_BY_PROVINCE, ZONES_BY_COMMUNE } from "@/lib/burundi";

export interface LocationValue {
  province: string;
  commune: string;
  zone: string;
  colline: string;
}

interface LocationSelectorProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  required?: boolean;
}

export function LocationSelector({ value, onChange, required }: LocationSelectorProps) {
  const communes = value.province ? (COMMUNES_BY_PROVINCE[value.province] ?? []) : [];
  const zones = value.commune ? (ZONES_BY_COMMUNE[value.commune] ?? []) : [];

  const set = (field: keyof LocationValue, val: string) => {
    const next = { ...value, [field]: val };
    // Reset les niveaux inférieurs si le niveau supérieur change
    if (field === "province") { next.commune = ""; next.zone = ""; next.colline = ""; }
    if (field === "commune") { next.zone = ""; next.colline = ""; }
    if (field === "zone") { next.colline = ""; }
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Province */}
      <div className="space-y-2">
        <Label>Province {required && <span className="text-destructive">*</span>}</Label>
        <Select value={value.province} onValueChange={(v) => set("province", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une province" />
          </SelectTrigger>
          <SelectContent>
            {PROVINCES_BURUNDI.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Commune */}
      <div className="space-y-2">
        <Label>Commune {required && <span className="text-destructive">*</span>}</Label>
        <Select value={value.commune} onValueChange={(v) => set("commune", v)} disabled={!value.province}>
          <SelectTrigger>
            <SelectValue placeholder={value.province ? "Choisir une commune" : "Sélectionnez d'abord une province"} />
          </SelectTrigger>
          <SelectContent>
            {communes.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zone */}
      <div className="space-y-2">
        <Label>Zone</Label>
        {zones.length > 0 ? (
          <Select value={value.zone} onValueChange={(v) => set("zone", v)} disabled={!value.commune}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>{z}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Nom de la zone"
            value={value.zone}
            onChange={(e) => set("zone", e.target.value)}
            disabled={!value.commune}
          />
        )}
      </div>

      {/* Colline */}
      <div className="space-y-2">
        <Label>Colline</Label>
        <Input
          placeholder="Nom de la colline"
          value={value.colline}
          onChange={(e) => set("colline", e.target.value)}
          disabled={!value.commune}
        />
      </div>
    </div>
  );
}

// Convertit un objet LocationValue en string pour stockage
export function locationToString(loc: LocationValue): string {
  return [loc.colline, loc.zone, loc.commune, loc.province]
    .filter(Boolean)
    .join(", ");
}

// Parse une string de localisation en objet
export function stringToLocation(str: string | null | undefined): LocationValue {
  if (!str) return { province: "", commune: "", zone: "", colline: "" };
  const parts = str.split(", ").reverse(); // province, commune, zone, colline
  return {
    province: parts[0] ?? "",
    commune: parts[1] ?? "",
    zone: parts[2] ?? "",
    colline: parts[3] ?? "",
  };
}
