"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function RetractationFormClient() {
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedEmailSent, setSubmittedEmailSent] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/retractation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          reason: reason.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        reference?: string;
        emailSent?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success || !data.reference) {
        setErrorMessage(
          data.error || "Impossible d'enregistrer votre demande actuellement. Veuillez réessayer."
        );
        return;
      }

      setSubmittedRef(data.reference);
      setSubmittedEmailSent(Boolean(data.emailSent));
    } catch {
      setErrorMessage("Erreur réseau lors de l'envoi de votre demande de rétractation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
        <h3 className="font-serif text-xl text-emerald-950">
          Demande de retour enregistrée ({submittedRef})
        </h3>
        <p className="text-sm text-emerald-800 max-w-md mx-auto">
          Votre demande pour la commande <strong>#{orderNumber}</strong> a bien été prise en compte sous la référence{" "}
          <strong>{submittedRef}</strong>.{" "}
          {submittedEmailSent
            ? "Un accusé de réception avec l'adresse postale de retour vous a été envoyé par e-mail."
            : "Notre service client vous contactera très rapidement à l'adresse indiquée."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ret-order-number" className="block text-sm font-medium text-[#1C1917] mb-1">
            Numéro de Commande *
          </label>
          <input
            id="ret-order-number"
            type="text"
            required
            placeholder="Ex : CP-2026-01001"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm"
          />
        </div>
        <div>
          <label htmlFor="ret-customer-name" className="block text-sm font-medium text-[#1C1917] mb-1">
            Nom et Prénom *
          </label>
          <input
            id="ret-customer-name"
            type="text"
            required
            placeholder="Marie Dupont"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ret-customer-email" className="block text-sm font-medium text-[#1C1917] mb-1">
          Adresse E-mail de la commande *
        </label>
        <input
          id="ret-customer-email"
          type="email"
          required
          placeholder="marie.dupont@gmail.com"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm"
        />
      </div>

      <div>
        <label htmlFor="ret-reason" className="block text-sm font-medium text-[#1C1917] mb-1">
          Motif du retour (facultatif)
        </label>
        <textarea
          id="ret-reason"
          rows={3}
          maxLength={1000}
          placeholder="Précisez ici les produits concernés ou vos remarques éventuelles..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[46px] px-8 py-3 rounded-xl bg-[#1C1917] hover:bg-[#A16207] disabled:bg-neutral-500 text-white text-sm font-semibold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Transmettre ma rétractation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
