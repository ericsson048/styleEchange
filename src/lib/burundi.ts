// Découpage administratif du Burundi
// Province → Communes → Zones → Collines

export const PROVINCES_BURUNDI = [
  "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi",
  "Cankuzo", "Cibitoke", "Gitega", "Karuzi", "Kayanza",
  "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro",
  "Ngozi", "Rumonge", "Rutana", "Ruyigi",
] as const;

export type Province = typeof PROVINCES_BURUNDI[number];

// Communes par province (principales)
export const COMMUNES_BY_PROVINCE: Record<string, string[]> = {
  "Bubanza": ["Bubanza", "Gihanga", "Mpanda", "Musigati", "Rugazi"],
  "Bujumbura Mairie": ["Mukaza", "Ntahangwa", "Muha"],
  "Bujumbura Rural": ["Isale", "Kabezi", "Kanyosha", "Mugamba", "Mutimbuzi", "Nyabiraba", "Nyabikere", "Rohero"],
  "Bururi": ["Bururi", "Burambi", "Buyengero", "Matana", "Mugamba", "Rumonge", "Rutovu", "Songa"],
  "Cankuzo": ["Cankuzo", "Gisagara", "Kigamba", "Mishiha", "Murore"],
  "Cibitoke": ["Buganda", "Bukinanyana", "Cibitoke", "Mabayi", "Mugina", "Murwi"],
  "Gitega": ["Bugendana", "Buraza", "Giheta", "Gitega", "Itaba", "Makebuko", "Mutaho", "Nyanrusange"],
  "Karuzi": ["Buhiga", "Bugenyuzi", "Gitaramuka", "Karuzi", "Mutumba", "Shombo"],
  "Kayanza": ["Butaganzwa", "Gahombo", "Gatara", "Kabarore", "Kayanza", "Matongo", "Muruta", "Rango"],
  "Kirundo": ["Bugabira", "Bwambarangwe", "Busoni", "Gitobe", "Kirundo", "Ntega", "Vumbi"],
  "Makamba": ["Kibago", "Kayogoro", "Makamba", "Mabanda", "Nyanza-Lac", "Vugizo"],
  "Muramvya": ["Bukeye", "Kiganda", "Muramvya", "Rutegama"],
  "Muyinga": ["Buhinyuza", "Butihinda", "Gasorwe", "Giteranyi", "Muyinga", "Mwakiro"],
  "Mwaro": ["Bisoro", "Gisozi", "Kayokwe", "Kibumbu", "Mwaro", "Nyabihanga"],
  "Ngozi": ["Busiga", "Gashikanwa", "Kiremba", "Marangara", "Mwumba", "Ngozi", "Nyamurenza", "Ruhororo", "Tangara"],
  "Rumonge": ["Burambi", "Buyengero", "Kizuka", "Rumonge", "Vyanda"],
  "Rutana": ["Bukemba", "Giharo", "Gitanga", "Mpinga-Kayove", "Musongati", "Rutana"],
  "Ruyigi": ["Butaganzwa", "Butezi", "Gisuru", "Kinyinya", "Ruyigi"],
};

// Zones par commune (exemples pour les principales communes)
export const ZONES_BY_COMMUNE: Record<string, string[]> = {
  "Mukaza": ["Rohero I", "Rohero II", "Buyenzi", "Bwiza", "Nyakabiga", "Kinama", "Cibitoke"],
  "Ntahangwa": ["Kamenge", "Kinama", "Ngagara", "Nyakabiga", "Buterere", "Gihosha"],
  "Muha": ["Musaga", "Kanyosha", "Kinindo", "Mutanga Nord", "Mutanga Sud"],
  "Gitega": ["Gitega Centre", "Nyamugari", "Mushasha", "Mwumba"],
  "Ngozi": ["Ngozi Centre", "Busiga", "Ruhororo"],
  "Kayanza": ["Kayanza Centre", "Matongo", "Muruta"],
  "Bubanza": ["Bubanza Centre", "Gihanga", "Mpanda"],
};

// Devises supportées
export const CURRENCIES = [
  { code: "BIF", symbol: "BIF", name: "Franc Burundais", stripeCode: "bif" },
  { code: "USD", symbol: "$", name: "Dollar Américain", stripeCode: "usd" },
  { code: "EUR", symbol: "€", name: "Euro", stripeCode: "eur" },
] as const;

export type CurrencyCode = "BIF" | "USD" | "EUR";

// Taux de conversion approximatifs (base BIF)
// En production, utiliser une API de taux en temps réel
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  BIF: 1,
  USD: 0.00034,   // 1 BIF ≈ 0.00034 USD
  EUR: 0.00031,   // 1 BIF ≈ 0.00031 EUR
};

export function formatPrice(amount: number, currency: CurrencyCode): string {
  if (currency === "BIF") {
    return `${Math.round(amount).toLocaleString("fr-BI")} BIF`;
  }
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} €`;
}

export function convertPrice(amountBIF: number, toCurrency: CurrencyCode): number {
  if (toCurrency === "BIF") return amountBIF;
  return amountBIF * EXCHANGE_RATES[toCurrency];
}

// Frais de livraison en BIF
export const SHIPPING_FEES_BIF = {
  local: 2000,    // Livraison locale (même commune)
  province: 5000, // Livraison inter-province
  express: 8000,  // Livraison express
};

// Frais de protection (5%)
export function getProtectionFee(price: number): number {
  return Math.round(price * 0.05);
}

// Coordonnées GPS des provinces du Burundi (centre approximatif)
export const PROVINCE_COORDS: Record<string, [number, number]> = {
  "Bubanza":           [29.3833, -3.0833],
  "Bujumbura Mairie":  [29.3600, -3.3822],
  "Bujumbura Rural":   [29.3500, -3.5000],
  "Bururi":            [29.6167, -3.9500],
  "Cankuzo":           [30.5500, -3.2167],
  "Cibitoke":          [29.1167, -2.8833],
  "Gitega":            [29.9244, -3.4271],
  "Karuzi":            [30.1667, -3.1000],
  "Kayanza":           [29.6333, -2.9167],
  "Kirundo":           [30.0833, -2.5667],
  "Makamba":           [29.8000, -4.1333],
  "Muramvya":          [29.6000, -3.2667],
  "Muyinga":           [30.3333, -2.8500],
  "Mwaro":             [29.6667, -3.5000],
  "Ngozi":             [29.8333, -2.9000],
  "Rumonge":           [29.4333, -3.9667],
  "Rutana":            [29.9833, -3.9167],
  "Ruyigi":            [30.2500, -3.4833],
};

// Centre géographique du Burundi
export const BURUNDI_CENTER: [number, number] = [29.9189, -3.3731];
export const BURUNDI_BOUNDS: [[number, number], [number, number]] = [
  [28.9, -4.5], // SW
  [30.9, -2.3], // NE
];

// Résout les coordonnées d'une localisation textuelle (Province, Commune, ...)
export function resolveLocationCoords(location: string | null | undefined): [number, number] | null {
  if (!location) return null;
  const parts = location.split(", ").map((p) => p.trim());
  // Cherche la province dans les parties (format: colline, zone, commune, province)
  for (const part of parts.reverse()) {
    if (PROVINCE_COORDS[part]) return PROVINCE_COORDS[part];
  }
  return null;
}
