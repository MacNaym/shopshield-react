// ─── useShopShield hook ───────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { fetchConfig, resolveBranding, ShopShieldConfig } from './client';
import { readConsent, writeConsent, logConsent, ConsentState, ConsentRecord } from './consent';

export interface ShopShieldState {
  // Config
  config:    ShopShieldConfig | null;
  branding:  ReturnType<typeof resolveBranding> | null;
  loading:   boolean;
  error:     string | null;

  // Consenso
  consent:   ConsentRecord;
  showBanner: boolean;

  // Azioni
  acceptAll:    () => void;
  rejectAll:    () => void;
  saveConsent:  (analytics: boolean, marketing: boolean) => void;
}

const LOG_URL = 'https://n8n.luigipesante.com/webhook/v1/log-consent';

export function useShopShield(shop?: string): ShopShieldState {
  const [config,     setConfig]     = useState<ShopShieldConfig | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [consent,    setConsent]    = useState<ConsentRecord>(() => readConsent());
  const [showBanner, setShowBanner] = useState(false);

  // Carica config al mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchConfig(shop)
      .then(data => {
        if (cancelled) return;
        setConfig(data);
        setError(data ? null : 'Store non trovato o non attivo');
      })
      .catch(() => {
        if (!cancelled) setError('Errore di rete');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [shop]);

  // Mostra banner se consenso non dato o scaduto
  useEffect(() => {
    if (!loading) {
      setShowBanner(!consent.given);
    }
  }, [loading, consent.given]);

  const saveConsent = useCallback((analytics: boolean, marketing: boolean) => {
    const record = writeConsent(analytics, marketing);
    setConsent(record);
    setShowBanner(false);

    const currentShop = shop ?? window.location.hostname.replace(/^www\./, '');
    logConsent(currentShop, record.visitorId, record.state, LOG_URL).catch(() => {});

    if (config?.config?.reload_on_consent !== false) {
      setTimeout(() => window.location.reload(), 300);
    }
  }, [shop, config]);

  const acceptAll = useCallback(() => saveConsent(true, true),   [saveConsent]);
  const rejectAll = useCallback(() => saveConsent(false, false), [saveConsent]);

  const branding = config ? resolveBranding(config.settings) : null;

  return {
    config,
    branding,
    loading,
    error,
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    saveConsent,
  };
}
