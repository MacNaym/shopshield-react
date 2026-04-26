// ─── ShopShieldBanner component ──────────────────────────────────────────────
import React, { useState, CSSProperties } from 'react';
import { useShopShield } from './useShopShield';

export interface ShopShieldBannerProps {
  /** Dominio dello store. Se omesso usa window.location.hostname */
  shop?: string;
  /** Callback chiamata dopo ogni salvataggio consenso */
  onConsent?: (analytics: boolean, marketing: boolean) => void;
  /** Classe CSS aggiuntiva per il wrapper del banner */
  className?: string;
}

export function ShopShieldBanner({ shop, onConsent, className }: ShopShieldBannerProps) {
  const { branding, showBanner, loading, acceptAll, rejectAll, saveConsent } = useShopShield(shop);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [tabOpen,   setTabOpen]   = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  if (loading || !showBanner || !branding) return null;

  const primary = branding.primary_color;
  const accent  = branding.accent_color;
  const logoPopup = branding.logo_popup_url;
  const logoTab   = branding.logo_tab_url;
  const text      = branding.banner_text;
  const privacyUrl = branding.privacy_url;
  const dsarUrl    = branding.dsar_url;

  const handleSave = (a: boolean, m: boolean) => {
    saveConsent(a, m);
    onConsent?.(a, m);
  };

  // ── STILI INLINE (nessuna dipendenza da CSS esterni) ─────────────────────
  const overlay: CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 2147483648,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    padding: '0 0 24px', pointerEvents: 'none',
  };
  const box: CSSProperties = {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    fontFamily: 'sans-serif', pointerEvents: 'all',
    border: '1px solid #e2e8f0', overflow: 'hidden',
  };
  const head: CSSProperties = {
    background: primary, padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: 12,
  };
  const body: CSSProperties = { padding: '18px 20px' };
  const toggleRow: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px', background: '#f8fafc',
    borderRadius: 8, border: '1px solid #f1f5f9', marginBottom: 8,
  };
  const switchStyle = (active: boolean): CSSProperties => ({
    width: 36, height: 20, borderRadius: 10, position: 'relative',
    cursor: 'pointer', background: active ? accent : '#e2e8f0',
    transition: 'background .2s', flexShrink: 0,
  });
  const thumb = (active: boolean): CSSProperties => ({
    position: 'absolute', top: 2, left: active ? 18 : 2,
    width: 16, height: 16, background: 'white',
    borderRadius: '50%', transition: 'left .2s',
  });
  const actions: CSSProperties = {
    display: 'flex', gap: 8, padding: '0 20px 18px',
  };
  const btnBase: CSSProperties = {
    flex: 1, padding: 11, border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  };

  // ── TAB (linguetta) ───────────────────────────────────────────────────────
  const tab: CSSProperties = {
    position: 'fixed', bottom: 24, left: 0, zIndex: 2147483647,
    display: 'flex', alignItems: 'center', background: primary,
    border: `2px solid ${accent}`, borderLeft: 'none',
    borderRadius: '0 12px 12px 0',
    boxShadow: '4px 4px 16px rgba(0,0,0,0.35)',
    cursor: 'pointer', overflow: 'hidden',
    width: tabOpen ? 172 : 44, transition: 'width .3s',
    whiteSpace: 'nowrap',
  };

  // ── PANEL (preferenze) ────────────────────────────────────────────────────
  const panel: CSSProperties = {
    position: 'fixed', bottom: 80, left: 20, zIndex: 2147483646,
    background: 'white', borderRadius: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: 320, fontFamily: 'sans-serif',
    border: '1px solid #e2e8f0', overflow: 'hidden',
    display: panelOpen ? 'block' : 'none',
  };

  return (
    <>
      {/* BANNER */}
      <div style={overlay} className={className}>
        <div style={box}>
          <div style={head}>
            {logoPopup && <img src={logoPopup} style={{ height: 26 }} alt="ShopShield" />}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Privacy &amp; Cookie</span>
          </div>
          <div style={body}>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 4px' }}>{text}</p>

            {/* Toggle necessari */}
            <div style={toggleRow}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#08152E' }}>Necessari</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Login, carrello, sicurezza</div>
              </div>
              <div style={{ ...switchStyle(true), opacity: 0.5, cursor: 'default' }}>
                <div style={thumb(true)} />
              </div>
            </div>

            {/* Toggle analitici */}
            <div style={toggleRow}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#08152E' }}>Analitici</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Statistiche di navigazione anonime</div>
              </div>
              <div style={switchStyle(analytics)} onClick={() => setAnalytics(a => !a)}>
                <div style={thumb(analytics)} />
              </div>
            </div>

            {/* Toggle marketing */}
            <div style={{ ...toggleRow, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#08152E' }}>Marketing</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Pubblicità personalizzata</div>
              </div>
              <div style={switchStyle(marketing)} onClick={() => setMarketing(m => !m)}>
                <div style={thumb(marketing)} />
              </div>
            </div>

            {/* Link policy */}
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
              {privacyUrl && <a href={privacyUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>}
              {privacyUrl && dsarUrl && ' · '}
              {dsarUrl && <a href={dsarUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>I tuoi diritti GDPR</a>}
            </div>
          </div>

          <div style={actions}>
            <button style={{ ...btnBase, background: '#f1f5f9', color: '#08152E' }}
              onClick={() => handleSave(false, false)}>
              Rifiuta tutti
            </button>
            <button style={{ ...btnBase, background: primary, color: 'white' }}
              onClick={() => handleSave(analytics, marketing)}>
              Salva scelte
            </button>
            <button style={{ ...btnBase, background: accent, color: 'white' }}
              onClick={() => handleSave(true, true)}>
              Accetta tutti
            </button>
          </div>
        </div>
      </div>

      {/* TAB (linguetta) */}
      <div style={tab}
        onMouseEnter={() => setTabOpen(true)}
        onMouseLeave={() => setTabOpen(false)}
        onClick={() => setPanelOpen(p => !p)}>
        <div style={{ flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          {logoTab && <img src={logoTab} style={{ width: 24, height: 24, display: 'block', borderRadius: 4 }} alt="" />}
        </div>
        <span style={{ color: 'white', fontSize: 12, fontWeight: 700, paddingRight: 14, opacity: tabOpen ? 1 : 0, transition: 'opacity .2s' }}>
          Privacy Active
        </span>
      </div>

      {/* PANEL (preferenze estese) */}
      <div style={panel}>
        <div style={{ background: primary, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logoPopup && <img src={logoPopup} style={{ height: 28 }} alt="ShopShield" />}
          <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#08152E', marginBottom: 12 }}>PREFERENZE COOKIE</div>

          {/* Necessari — fisso */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Necessari</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Sempre attivi</div>
            </div>
            <div style={{ ...switchStyle(true), opacity: 0.5, cursor: 'default' }}><div style={thumb(true)} /></div>
          </div>

          {/* Analitici */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Analitici</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Statistiche di navigazione</div>
            </div>
            <div style={switchStyle(analytics)} onClick={() => setAnalytics(a => !a)}><div style={thumb(analytics)} /></div>
          </div>

          {/* Marketing */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Marketing</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Pubblicità personalizzata</div>
            </div>
            <div style={switchStyle(marketing)} onClick={() => setMarketing(m => !m)}><div style={thumb(marketing)} /></div>
          </div>

          <div style={{ marginTop: 12, padding: 10, background: '#f8fafc', borderRadius: 8, fontSize: 10, color: '#94a3b8' }}>
            ID: <span style={{ color: accent }}>{useShopShieldId()}</span>
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => { handleSave(analytics, marketing); setPanelOpen(false); }}
            style={{ width: '100%', padding: 10, background: primary, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
            Salva preferenze
          </button>
        </div>

        {privacyUrl && (
          <div style={{ padding: '8px 18px 14px', textAlign: 'center' }}>
            <a href={privacyUrl} style={{ fontSize: 10, color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
        )}
      </div>
    </>
  );
}

// Helper interno — legge il visitor ID per il pannello
function useShopShieldId(): string {
  try {
    return localStorage.getItem('ss_visitor_id') ?? '—';
  } catch {
    return '—';
  }
}
