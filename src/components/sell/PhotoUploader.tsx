"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  photos: string[]; // base64 ou URL
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 6 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxPhotos - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB max

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange([...photos, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Bouton d'ajout */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              "aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
              draggingOver
                ? "border-accent bg-accent/10 scale-105"
                : "border-muted-foreground/30 text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5"
            )}
          >
            <Camera className="h-7 w-7" />
            <span className="text-xs font-medium text-center px-1">
              {photos.length === 0 ? "Ajouter photos" : "Ajouter"}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {photos.length}/{maxPhotos}
            </span>
          </button>
        )}

        {/* Aperçus des photos */}
        {photos.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Badge principale */}
            {i === 0 && (
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                Principale
              </div>
            )}
            {/* Bouton supprimer */}
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Slots vides */}
        {photos.length > 0 && Array.from({ length: Math.max(0, Math.min(3, maxPhotos - photos.length - 1)) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            onClick={() => inputRef.current?.click()}
            className="aspect-square bg-muted/40 rounded-xl border border-dashed border-muted-foreground/20 cursor-pointer hover:bg-muted/60 transition-colors"
          />
        ))}
      </div>

      {/* Input caché */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WEBP · Max 5 Mo par photo · {maxPhotos} photos maximum
      </p>
    </div>
  );
}
