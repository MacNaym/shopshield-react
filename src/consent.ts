// ─── ShopShield consent manager ──────────────────────────────────────────────
// Gestisce il consenso cookie nel localStorage con scadenza 12 mesi.
// Stessa logica di shield-uni.js — compatibile cross-platform.

const CONSENT_ID_KEY     = 'ss_consent_id';
const CONSENT_CONFIG_KEY = 'ss_consent_config';
const CONSENT_DATE_KEY   = 'ss_consent_date';
const VISITOR_ID_KEY     = 'ss_visitor_id';
const CONSENT_MAX_DAYS   = 365;

export interface ConsentState {
  necessary:  boolean;
  analytics:  boolean;
  marketing:  boolean;
}

export interface ConsentRecord {
  given:     boolean;
  expired:   boolean;
  state:     ConsentState;
  visitorId: string;
}

function generateVisitorId(): string {
  return 'ss_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getOrCreateVisitorId(): string {
  try {
    const stored = localStorage.getItem(VISITOR_ID_KEY);
    if (stored && stored !== 'null') return stored;
    const id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return generateVisitorId();
  }
}

export function readConsent(): ConsentRecord {
  const visitorId = getOrCreateVisitorId();
  const defaultState: ConsentState = { necessary: true, analytics: false, marketing: false };

  try {
    const id       = localStorage.getItem(CONSENT_ID_KEY);
    const config   = localStorage.getItem(CONSENT_CONFIG_KEY);
    const dateStr  = localStorage.getItem(CONSENT_DATE_KEY);

    if (!id || !config || !dateStr) {
      return { given: false, expired: false, state: defaultState, visitorId };
    }

    const daysSince = (Date.now() - parseInt(dateStr, 10)) / (1000 * 60 * 60 * 24);
    if (daysSince > CONSENT_MAX_DAYS) {
      // Consenso scaduto — pulizia
      localStorage.removeItem(CONSENT_ID_KEY);
      localStorage.removeItem(CONSENT_CONFIG_KEY);
      localStorage.removeItem(CONSENT_DATE_KEY);
      return { given: false, expired: true, state: defaultState, visitorId };
    }

    const state: ConsentState = JSON.parse(config);
    return { given: true, expired: false, state, visitorId };
  } catch {
    return { given: false, expired: false, state: defaultState, visitorId };
  }
}

export function writeConsent(analytics: boolean, marketing: boolean): ConsentRecord {
  const visitorId = getOrCreateVisitorId();
  const state: ConsentState = { necessary: true, analytics, marketing };

  try {
    localStorage.setItem(CONSENT_ID_KEY,     visitorId);
    localStorage.setItem(CONSENT_CONFIG_KEY, JSON.stringify(state));
    localStorage.setItem(CONSENT_DATE_KEY,   Date.now().toString());
  } catch { /* storage non disponibile */ }

  // Google Consent Mode v2
  updateGoogleConsent(analytics, marketing);

  return { given: true, expired: false, state, visitorId };
}

export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_ID_KEY);
    localStorage.removeItem(CONSENT_CONFIG_KEY);
    localStorage.removeItem(CONSENT_DATE_KEY);
  } catch { /* */ }
}

function updateGoogleConsent(analytics: boolean, marketing: boolean): void {
  try {
    // @ts-ignore — gtag globale non sempre presente
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        ad_storage:         marketing ? 'granted' : 'denied',
        ad_user_data:       marketing ? 'granted' : 'denied',
        ad_personalization: marketing ? 'granted' : 'denied',
        analytics_storage:  analytics ? 'granted' : 'denied',
      });
    }
    // Shopify Customer Privacy API
    if (
      typeof window !== 'undefined' &&
      (window as any).Shopify?.customerPrivacy
    ) {
      (window as any).Shopify.customerPrivacy.setTrackingConsent(
        { analytics, marketing, preferences: true, sale_of_data: false },
        () => {}
      );
    }
  } catch { /* */ }
}

export async function logConsent(
  shop:      string,
  visitorId: string,
  state:     ConsentState,
  logUrl:    string
): Promise<void> {
  try {
    await fetch(logUrl, {
      method: 'POST',
      mode:   'no-cors',
      body:   JSON.stringify({ shop, id: visitorId, config: state, platform: 'react' }),
    });
  } catch { /* silenzioso */ }
}
