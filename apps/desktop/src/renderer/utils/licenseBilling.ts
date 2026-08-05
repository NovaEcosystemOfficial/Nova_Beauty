/**
 * Billing / license helpers for NovaBeauty Desktop.
 *
 * Predisposizione futura — nessuna chiamata di rete attiva in demo.
 *
 * TODO: integrazione Stripe
 * TODO: verifica licenza online
 * TODO: attivazione automatica piano
 * TODO: sincronizzazione con account Nova
 */

export type LicensePlanId = "community" | "pro" | "founder";

export type StripeCheckoutDraft = {
  plan: Exclude<LicensePlanId, "community">;
  interval: "month" | "year" | "once";
  amountEur: number;
  currency: "eur";
  studioId?: string;
  accountId?: string;
};

/**
 * Entry-point per il checkout Stripe.
 * In demo non avvia alcun pagamento: il caller mostra il messaggio placeholder.
 *
 * TODO: integrazione Stripe — creare Checkout Session / Payment Link
 * TODO: sincronizzazione con account Nova — passare customer / account id
 */
export async function startStripeCheckout(_draft: StripeCheckoutDraft): Promise<{
  ok: false;
  reason: "stripe_not_configured";
  message: string;
}> {
  // TODO: integrazione Stripe
  // TODO: verifica licenza online (pre-check entitlement)
  // TODO: attivazione automatica piano (webhook → unlock locale)
  // TODO: sincronizzazione con account Nova
  return {
    ok: false,
    reason: "stripe_not_configured",
    message: "Demo: integrazione Stripe non ancora attiva."
  };
}

/**
 * TODO: verifica licenza online — polling / JWT entitlement dal backend Nova
 */
export async function verifyLicenseOnline(_accountId?: string): Promise<{
  plan: LicensePlanId;
  valid: boolean;
}> {
  return { plan: "community", valid: true };
}

/**
 * TODO: attivazione automatica piano — applicare entitlement dopo webhook Stripe
 */
export function applyLicenseEntitlement(_plan: LicensePlanId): void {
  // no-op in demo
}
