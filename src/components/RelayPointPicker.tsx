"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Search, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export interface SelectedRelayPoint {
  id?: string | null;
  label: string;
}

interface ApiRelayPoint {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  distanceMeters: number;
  hours: string;
}

interface RelayPointPickerProps {
  postalCode: string;
  city: string;
  value: SelectedRelayPoint | null;
  onChange: (next: SelectedRelayPoint | null) => void;
  onSuggestCity?: (suggestedCity: string) => void;
}

export function RelayPointPicker({
  postalCode,
  city,
  value,
  onChange,
  onSuggestCity,
}: RelayPointPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [communes, setCommunes] = useState<string[]>([]);
  const [points, setPoints] = useState<ApiRelayPoint[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [manualChoice, setManualChoice] = useState("");
  const lastFetchedZipRef = useRef<string>("");

  const fetchRelayPoints = useCallback(
    async (zip: string) => {
      if (!/^\d{5}$/.test(zip)) {
        setPoints([]);
        setCommunes([]);
        setConfigured(null);
        setSearchError("Saisissez un code postal français à 5 chiffres pour rechercher.");
        return;
      }

      setIsLoading(true);
      setSearchError(null);

      try {
        const res = await fetch(
          `/api/shipping/relay-points?postalCode=${encodeURIComponent(zip)}`
        );
        const data = (await res.json().catch(() => ({}))) as {
          configured?: boolean;
          communes?: string[];
          points?: ApiRelayPoint[];
          error?: string;
        };

        if (!res.ok) {
          setSearchError(data.error || "Impossible de rechercher les Points Relais.");
          setPoints([]);
          setCommunes([]);
          return;
        }

        const nextCommunes = Array.isArray(data.communes) ? data.communes : [];
        const nextPoints = Array.isArray(data.points) ? data.points : [];

        setConfigured(Boolean(data.configured));
        setCommunes(nextCommunes);
        setPoints(nextPoints);
        lastFetchedZipRef.current = zip;

        if (nextCommunes.length > 0 && !city.trim() && onSuggestCity) {
          onSuggestCity(nextCommunes[0]);
        }
      } catch {
        setSearchError("Erreur réseau lors de la recherche des Points Relais.");
      } finally {
        setIsLoading(false);
      }
    },
    [city, onSuggestCity]
  );

  useEffect(() => {
    const cleanZip = postalCode.trim();
    if (!/^\d{5}$/.test(cleanZip)) {
      return;
    }
    if (lastFetchedZipRef.current === cleanZip) {
      return;
    }

    const timer = setTimeout(() => {
      void fetchRelayPoints(cleanZip);
    }, 250);

    return () => clearTimeout(timer);
  }, [postalCode, fetchRelayPoints]);

  const cleanZip = postalCode.trim();
  const hasValidZip = /^\d{5}$/.test(cleanZip);
  const resolvedCommune = communes[0] || city.trim();

  const handleConfirmManual = () => {
    const trimmed = manualChoice.trim();
    if (!trimmed) return;
    const suffix = [cleanZip, resolvedCommune].filter(Boolean).join(" ");
    onChange({
      id: null,
      label: suffix ? `${trimmed} (${suffix})` : trimmed,
    });
  };

  const handleConfirmNearestFallback = () => {
    if (!hasValidZip) return;
    const locationPart = [cleanZip, resolvedCommune].filter(Boolean).join(" ");
    onChange({
      id: null,
      label: `Point Relais Mondial Relay le plus proche — ${locationPart}`,
    });
  };

  return (
    <div className="pt-3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[#1C1917] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#A16207]" />
            <span>Choix du Point Relais (Mondial Relay) *</span>
          </p>
          {resolvedCommune && hasValidZip && (
            <p className="text-xs text-[#57534E] mt-0.5">
              Commune détectée : <strong className="text-[#1C1917]">{resolvedCommune}</strong> ({cleanZip})
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void fetchRelayPoints(cleanZip)}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] hover:bg-[#F2EFE9] text-xs font-semibold text-[#1C1917] transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A16207]" />
          ) : (
            <Search className="w-3.5 h-3.5 text-[#A16207]" />
          )}
          <span>Rechercher un Point Relais</span>
        </button>
      </div>

      {!hasValidZip && (
        <p className="text-xs text-[#57534E] bg-[#FAFAF8] border border-[#E7E2DA] rounded-xl p-3">
          Renseignez d&apos;abord votre code postal français à 5 chiffres ci-dessus pour afficher les points de retrait disponibles.
        </p>
      )}

      {searchError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Liste des Points Relais officiels Mondial Relay */}
      {points.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {points.map((pt) => {
            const isSelected = value?.id === pt.id;
            const distanceText =
              pt.distanceMeters >= 1000
                ? `${(pt.distanceMeters / 1000).toFixed(1)} km`
                : `${pt.distanceMeters} m`;
            const fullLabel = `${pt.name} — ${pt.address}, ${pt.postalCode} ${pt.city} (Réf. ${pt.id})`;

            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => onChange({ id: pt.id, label: fullLabel })}
                className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-[#A16207] bg-[#A16207]/5 ring-1 ring-[#A16207]"
                    : "border-[#E7E2DA] bg-white hover:border-[#1C1917]"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-[#1C1917]">
                      {pt.name}
                    </span>
                    <span className="text-[11px] font-mono bg-[#F2EFE9] text-[#57534E] px-2 py-0.5 rounded-full">
                      Réf. {pt.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E]">
                    {pt.address}, {pt.postalCode} {pt.city}
                  </p>
                  <p className="text-[11px] text-[#78716C] flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{pt.hours}</span>
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-[#A16207]">{distanceText}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#A16207]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode saisie assistée si l'API Mondial Relay temps réel n'est pas configurée ou ne retourne aucun point */}
      {hasValidZip && !isLoading && (configured === false || points.length === 0) && (
        <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E7E2DA] space-y-3">
          <p className="text-xs text-[#57534E] leading-relaxed">
            {configured === false
              ? "La sélection automatique par carte Mondial Relay sera activée prochainement. Indiquez ci-dessous le commerce ou locker souhaité, ou confiez-nous l'attribution du Point Relais le plus proche de votre commune."
              : "Aucun Point Relais retourné automatiquement pour ce code postal. Précisez votre préférence ci-dessous ou confirmez l'attribution au plus proche."}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Ex : Locker 24/7 Gare, Tabac Presse du Centre..."
              value={manualChoice}
              onChange={(e) => setManualChoice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs bg-white text-[#1C1917]"
            />
            <button
              type="button"
              onClick={handleConfirmManual}
              disabled={!manualChoice.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#A16207] disabled:bg-neutral-300 text-white text-xs font-semibold transition cursor-pointer"
            >
              Valider ce commerce
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirmNearestFallback}
            className="w-full py-2.5 px-4 rounded-xl border border-[#A16207]/40 bg-white hover:bg-[#F5F2EB] text-[#1C1917] text-xs font-medium transition cursor-pointer"
          >
            Sélectionner le Point Relais le plus proche ({resolvedCommune || "France"} • {cleanZip})
          </button>
        </div>
      )}

      {/* Point Relais sélectionné */}
      {value?.label && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Point Relais retenu :</span>
              <span>{value.label}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] underline text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer"
          >
            Modifier
          </button>
        </div>
      )}
    </div>
  );
}
