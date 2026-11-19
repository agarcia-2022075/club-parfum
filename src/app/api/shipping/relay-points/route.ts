import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export interface RelayPointItem {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  distanceMeters: number;
  hours: string;
}

interface GeoCommune {
  nom?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function extractTagValue(block: string, tagName: string): string {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? decodeXmlEntities(match[1]) : "";
}

function formatDayHours(raw: string): string {
  const match = raw.match(/<string>(\d{4})<\/string>\s*<string>(\d{4})<\/string>/i);
  if (!match || match[1] === "0000") return "";
  const open = `${match[1].slice(0, 2)}h${match[1].slice(2)}`;
  const close = `${match[2].slice(0, 2)}h${match[2].slice(2)}`;
  return `${open}-${close}`;
}

async function fetchFrenchCommunes(postalCode: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(postalCode)}&fields=nom,code,centre&format=json`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as GeoCommune[];
    if (!Array.isArray(data)) return [];
    return data
      .map((c) => (typeof c.nom === "string" ? c.nom.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchMondialRelayPoints(
  postalCode: string,
  enseigne: string,
  privateKey: string
): Promise<RelayPointItem[]> {
  const params = {
    Enseigne: enseigne,
    Pays: "FR",
    NumPointRelais: "",
    Ville: "",
    CP: postalCode,
    Latitude: "",
    Longitude: "",
    Taille: "",
    Poids: "",
    Action: "",
    DelaiEnvoi: "0",
    RayonRecherche: "20",
    TypeActivite: "",
    NACE: "",
    NombreResultats: "8",
  };

  const securityConcat =
    params.Enseigne +
    params.Pays +
    params.NumPointRelais +
    params.Ville +
    params.CP +
    params.Latitude +
    params.Longitude +
    params.Taille +
    params.Poids +
    params.Action +
    params.DelaiEnvoi +
    params.RayonRecherche +
    params.TypeActivite +
    params.NACE +
    params.NombreResultats +
    privateKey;

  const securityHash = crypto
    .createHash("md5")
    .update(securityConcat, "utf8")
    .digest("hex")
    .toUpperCase();

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${escapeXml(params.Enseigne)}</Enseigne>
      <Pays>${escapeXml(params.Pays)}</Pays>
      <NumPointRelais></NumPointRelais>
      <Ville></Ville>
      <CP>${escapeXml(params.CP)}</CP>
      <Latitude></Latitude>
      <Longitude></Longitude>
      <Taille></Taille>
      <Poids></Poids>
      <Action></Action>
      <DelaiEnvoi>${escapeXml(params.DelaiEnvoi)}</DelaiEnvoi>
      <RayonRecherche>${escapeXml(params.RayonRecherche)}</RayonRecherche>
      <TypeActivite></TypeActivite>
      <NACE></NACE>
      <NombreResultats>${escapeXml(params.NombreResultats)}</NombreResultats>
      <Security>${securityHash}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch("https://api.mondialrelay.com/Web_Services.asmx", {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: '"http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche"',
    },
    body: soapEnvelope,
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Mondial Relay HTTP ${res.status}`);
  }

  const xml = await res.text();
  const stat = extractTagValue(xml, "STAT");
  if (stat && stat !== "0") {
    throw new Error(`Mondial Relay STAT ${stat}`);
  }

  const matches = xml.match(/<PointRelais_Details>[\s\S]*?<\/PointRelais_Details>/gi) || [];
  const points: RelayPointItem[] = [];

  for (const block of matches.slice(0, 8)) {
    const id = extractTagValue(block, "Num");
    const name = extractTagValue(block, "LgAdr1");
    const address = extractTagValue(block, "LgAdr3") || extractTagValue(block, "LgAdr2");
    const cp = extractTagValue(block, "CP") || postalCode;
    const city = extractTagValue(block, "Ville");
    const dist = parseInt(extractTagValue(block, "Distance") || "0", 10);
    const mondayHours = formatDayHours(extractTagValue(block, "Horaires_Lundi"));
    const satHours = formatDayHours(extractTagValue(block, "Horaires_Samedi"));
    const hoursParts = [
      mondayHours ? `Lun ${mondayHours}` : "",
      satHours ? `Sam ${satHours}` : "",
    ].filter(Boolean);

    if (id && name) {
      points.push({
        id,
        name,
        address,
        postalCode: cp,
        city,
        distanceMeters: Number.isFinite(dist) ? dist : 0,
        hours: hoursParts.join(" • ") || "Horaires commerçant habituels",
      });
    }
  }

  return points;
}

export async function GET(request: NextRequest) {
  try {
    const postalCode = request.nextUrl.searchParams.get("postalCode")?.trim() || "";
    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "Veuillez saisir un code postal français à 5 chiffres." },
        { status: 400 }
      );
    }

    const communes = await fetchFrenchCommunes(postalCode);

    const enseigne = process.env.MONDIAL_RELAY_ENSEIGNE?.trim() || "";
    const privateKey = process.env.MONDIAL_RELAY_PRIVATE_KEY?.trim() || "";

    if (!enseigne || !privateKey) {
      return NextResponse.json(
        {
          configured: false,
          communes,
          points: [],
        },
        { status: 200 }
      );
    }

    try {
      const points = await fetchMondialRelayPoints(postalCode, enseigne, privateKey);
      return NextResponse.json(
        {
          configured: true,
          communes,
          points,
        },
        { status: 200 }
      );
    } catch (mrError) {
      console.warn("Avertissement recherche API Mondial Relay:", mrError);
      return NextResponse.json(
        {
          configured: true,
          communes,
          points: [],
          warning: "Le répertoire temps réel Mondial Relay est momentanément indisponible.",
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur GET /api/shipping/relay-points:", error);
    return NextResponse.json(
      { error: "Impossible de rechercher les Points Relais pour le moment." },
      { status: 500 }
    );
  }
}
