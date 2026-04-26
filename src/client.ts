// ─── ShopShield config client ─────────────────────────────────────────────
// Legge la configurazione dello store da Supabase tramite la Edge Function
// config-fetcher. Usa la chiave anon pubblica — nessun privilegio admin.

const SUPABASE_URL     = 'https://cukvfgdrnmsnlfuxezqe.supabase.co';
const CONFIG_FETCHER   = `${SUPABASE_URL}/functions/v1/config-fetcher`;
const CACHE_KEY        = 'ss_shield_config';
const CACHE_TTL_MS     = 60 * 60 * 1000; // 1 ora

export interface ShopShieldConfig {
  shop:           string;
  status:         'active' | 'inactive';
  plan:           'essential' | 'lite' | 'pro';
  blocked_cookies: string[];
  categories: {
    marketing?: string[];
    analytics?: string[];
  };
  features: {
    cookie_blocking:   boolean;
    consent_storage:   boolean;
    github_archive:    boolean;
    monitoring:        boolean;
    weekly_report:     boolean;
    dsar:              boolean;
    discovery_engine:  boolean;
    show_branding:     boolean;
  };
  settings: {
    primary_color:  string | null;
    accent_color:   string | null;
    logo_tab_url:   string | null;
    logo_popup_url: string | null;
    banner_text:    string | null;
    privacy_url:    string | null;
    dsar_url:       string | null;
  };
  config: {
    blocking_mode:     string;
    reload_on_consent: boolean;
  };
}

// Branding di default — sovrascrivibile dalle impostazioni Supabase
export const DEFAULT_BRANDING = {
  primary_color:  '#08152E',
  accent_color:   '#F4611A',
  logo_tab_url:   'https://shopshield.io/wp-content/uploads/2026/03/logo-quadrato-200x200-1.png',
  logo_popup_url: 'https://shopshield.io/wp-content/uploads/2026/03/logo-compliance.png',
  banner_text:    'Questo sito utilizza cookie tecnici e, previo consenso, cookie analitici e di profilazione. Puoi scegliere quali accettare.',
  privacy_url:    null as string | null,
  dsar_url:       'https://shopshield.io/dsar-guida',
};

interface CachedConfig {
  data:      ShopShieldConfig;
  fetchedAt: number;
}

function getShop(): string {
  return window.location.hostname.replace(/^www\./, '');
}

function getCached(): ShopShieldConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedConfig = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(data: ShopShieldConfig): void {
  try {
    const cached: CachedConfig = { data, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch { /* storage pieno o privato */ }
}

export async function fetchConfig(shop?: string): Promise<ShopShieldConfig | null> {
  const target = shop ?? getShop();

  // Cache hit
  const cached = getCached();
  if (cached && cached.shop === target) return cached;

  try {
    const res = await fetch(`${CONFIG_FETCHER}?shop=${encodeURIComponent(target)}`);
    if (!res.ok) return null;
    const data: ShopShieldConfig = await res.json();
    if (data.status !== 'active') return null;
    setCache(data);
    return data;
  } catch {
    return null;
  }
}

// Merge branding: Supabase settings sovrascrivono i default
export function resolveBranding(settings: ShopShieldConfig['settings']): typeof DEFAULT_BRANDING {
  return {
    primary_color:  settings.primary_color  ?? DEFAULT_BRANDING.primary_color,
    accent_color:   settings.accent_color   ?? DEFAULT_BRANDING.accent_color,
    logo_tab_url:   settings.logo_tab_url   ?? DEFAULT_BRANDING.logo_tab_url,
    logo_popup_url: settings.logo_popup_url ?? DEFAULT_BRANDING.logo_popup_url,
    banner_text:    settings.banner_text    ?? DEFAULT_BRANDING.banner_text,
    privacy_url:    settings.privacy_url    ?? DEFAULT_BRANDING.privacy_url,
    dsar_url:       settings.dsar_url       ?? DEFAULT_BRANDING.dsar_url,
  };
}
