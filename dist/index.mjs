import { useState, useEffect, useCallback } from 'react';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/client.ts
var SUPABASE_URL = "https://cukvfgdrnmsnlfuxezqe.supabase.co";
var CONFIG_FETCHER = `${SUPABASE_URL}/functions/v1/config-fetcher`;
var CACHE_KEY = "ss_shield_config";
var CACHE_TTL_MS = 60 * 60 * 1e3;
var DEFAULT_BRANDING = {
  primary_color: "#08152E",
  accent_color: "#F4611A",
  logo_tab_url: "https://shopshield.io/wp-content/uploads/2026/03/logo-quadrato-200x200-1.png",
  logo_popup_url: "https://shopshield.io/wp-content/uploads/2026/03/logo-compliance.png",
  banner_text: "Questo sito utilizza cookie tecnici e, previo consenso, cookie analitici e di profilazione. Puoi scegliere quali accettare.",
  privacy_url: null,
  dsar_url: "https://shopshield.io/dsar-guida"
};
function getShop() {
  return window.location.hostname.replace(/^www\./, "");
}
function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
    return cached.data;
  } catch (e) {
    return null;
  }
}
function setCache(data) {
  try {
    const cached = { data, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
  }
}
async function fetchConfig(shop) {
  const target = shop != null ? shop : getShop();
  const cached = getCached();
  if (cached && cached.shop === target) return cached;
  try {
    const res = await fetch(`${CONFIG_FETCHER}?shop=${encodeURIComponent(target)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "active") return null;
    setCache(data);
    return data;
  } catch (e) {
    return null;
  }
}
function resolveBranding(settings) {
  var _a, _b, _c, _d, _e, _f, _g;
  return {
    primary_color: (_a = settings.primary_color) != null ? _a : DEFAULT_BRANDING.primary_color,
    accent_color: (_b = settings.accent_color) != null ? _b : DEFAULT_BRANDING.accent_color,
    logo_tab_url: (_c = settings.logo_tab_url) != null ? _c : DEFAULT_BRANDING.logo_tab_url,
    logo_popup_url: (_d = settings.logo_popup_url) != null ? _d : DEFAULT_BRANDING.logo_popup_url,
    banner_text: (_e = settings.banner_text) != null ? _e : DEFAULT_BRANDING.banner_text,
    privacy_url: (_f = settings.privacy_url) != null ? _f : DEFAULT_BRANDING.privacy_url,
    dsar_url: (_g = settings.dsar_url) != null ? _g : DEFAULT_BRANDING.dsar_url
  };
}

// src/consent.ts
var CONSENT_ID_KEY = "ss_consent_id";
var CONSENT_CONFIG_KEY = "ss_consent_config";
var CONSENT_DATE_KEY = "ss_consent_date";
var VISITOR_ID_KEY = "ss_visitor_id";
var CONSENT_MAX_DAYS = 365;
function generateVisitorId() {
  return "ss_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
function getOrCreateVisitorId() {
  try {
    const stored = localStorage.getItem(VISITOR_ID_KEY);
    if (stored && stored !== "null") return stored;
    const id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch (e) {
    return generateVisitorId();
  }
}
function readConsent() {
  const visitorId = getOrCreateVisitorId();
  const defaultState = { necessary: true, analytics: false, marketing: false };
  try {
    const id = localStorage.getItem(CONSENT_ID_KEY);
    const config = localStorage.getItem(CONSENT_CONFIG_KEY);
    const dateStr = localStorage.getItem(CONSENT_DATE_KEY);
    if (!id || !config || !dateStr) {
      return { given: false, expired: false, state: defaultState, visitorId };
    }
    const daysSince = (Date.now() - parseInt(dateStr, 10)) / (1e3 * 60 * 60 * 24);
    if (daysSince > CONSENT_MAX_DAYS) {
      localStorage.removeItem(CONSENT_ID_KEY);
      localStorage.removeItem(CONSENT_CONFIG_KEY);
      localStorage.removeItem(CONSENT_DATE_KEY);
      return { given: false, expired: true, state: defaultState, visitorId };
    }
    const state = JSON.parse(config);
    return { given: true, expired: false, state, visitorId };
  } catch (e) {
    return { given: false, expired: false, state: defaultState, visitorId };
  }
}
function writeConsent(analytics, marketing) {
  const visitorId = getOrCreateVisitorId();
  const state = { necessary: true, analytics, marketing };
  try {
    localStorage.setItem(CONSENT_ID_KEY, visitorId);
    localStorage.setItem(CONSENT_CONFIG_KEY, JSON.stringify(state));
    localStorage.setItem(CONSENT_DATE_KEY, Date.now().toString());
  } catch (e) {
  }
  updateGoogleConsent(analytics, marketing);
  return { given: true, expired: false, state, visitorId };
}
function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_ID_KEY);
    localStorage.removeItem(CONSENT_CONFIG_KEY);
    localStorage.removeItem(CONSENT_DATE_KEY);
  } catch (e) {
  }
}
function updateGoogleConsent(analytics, marketing) {
  var _a;
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: marketing ? "granted" : "denied",
        ad_user_data: marketing ? "granted" : "denied",
        ad_personalization: marketing ? "granted" : "denied",
        analytics_storage: analytics ? "granted" : "denied"
      });
    }
    if (typeof window !== "undefined" && ((_a = window.Shopify) == null ? void 0 : _a.customerPrivacy)) {
      window.Shopify.customerPrivacy.setTrackingConsent(
        { analytics, marketing, preferences: true, sale_of_data: false },
        () => {
        }
      );
    }
  } catch (e) {
  }
}
async function logConsent(shop, visitorId, state, logUrl) {
  try {
    await fetch(logUrl, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ shop, id: visitorId, config: state, platform: "react" })
    });
  } catch (e) {
  }
}

// src/useShopShield.ts
var LOG_URL = "https://n8n.luigipesante.com/webhook/v1/log-consent";
function useShopShield(shop) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consent, setConsent] = useState(() => readConsent());
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchConfig(shop).then((data) => {
      if (cancelled) return;
      setConfig(data);
      setError(data ? null : "Store non trovato o non attivo");
    }).catch(() => {
      if (!cancelled) setError("Errore di rete");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [shop]);
  useEffect(() => {
    if (!loading) {
      setShowBanner(!consent.given);
    }
  }, [loading, consent.given]);
  const saveConsent = useCallback((analytics, marketing) => {
    var _a;
    const record = writeConsent(analytics, marketing);
    setConsent(record);
    setShowBanner(false);
    const currentShop = shop != null ? shop : window.location.hostname.replace(/^www\./, "");
    logConsent(currentShop, record.visitorId, record.state, LOG_URL).catch(() => {
    });
    if (((_a = config == null ? void 0 : config.config) == null ? void 0 : _a.reload_on_consent) !== false) {
      setTimeout(() => window.location.reload(), 300);
    }
  }, [shop, config]);
  const acceptAll = useCallback(() => saveConsent(true, true), [saveConsent]);
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
    saveConsent
  };
}
function ShopShieldBanner({ shop, onConsent, className }) {
  const { branding, loading, showBanner, acceptAll, rejectAll, saveConsent } = useShopShield(shop);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  if (loading || !branding) return null;
  const primary = branding.primary_color;
  const accent = branding.accent_color;
  const logoPopup = branding.logo_popup_url;
  const logoTab = branding.logo_tab_url;
  const text = branding.banner_text;
  const privacyUrl = branding.privacy_url;
  const dsarUrl = branding.dsar_url;
  const handleSave = (a, m) => {
    saveConsent(a, m);
    onConsent == null ? void 0 : onConsent(a, m);
  };
  const overlay = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483648,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "0 0 24px",
    pointerEvents: "none"
  };
  const box = {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    fontFamily: "sans-serif",
    pointerEvents: "all",
    border: "1px solid #e2e8f0",
    overflow: "hidden"
  };
  const head = {
    background: primary,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12
  };
  const body = { padding: "18px 20px" };
  const toggleRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    marginBottom: 8
  };
  const switchStyle = (active) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    position: "relative",
    cursor: "pointer",
    background: active ? accent : "#e2e8f0",
    transition: "background .2s",
    flexShrink: 0
  });
  const thumb = (active) => ({
    position: "absolute",
    top: 2,
    left: active ? 18 : 2,
    width: 16,
    height: 16,
    background: "white",
    borderRadius: "50%",
    transition: "left .2s"
  });
  const actions = {
    display: "flex",
    gap: 8,
    padding: "0 20px 18px"
  };
  const tab = {
    position: "fixed",
    bottom: 24,
    left: 0,
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    background: primary,
    border: `2px solid ${accent}`,
    borderLeft: "none",
    borderRadius: "0 12px 12px 0",
    boxShadow: "4px 4px 16px rgba(0,0,0,0.35)",
    cursor: "pointer",
    overflow: "hidden",
    width: tabOpen ? 172 : 44,
    transition: "width .3s",
    whiteSpace: "nowrap"
  };
  const panel = {
    position: "fixed",
    bottom: 80,
    left: 20,
    zIndex: 2147483646,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    width: 320,
    fontFamily: "sans-serif",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: panelOpen ? "block" : "none"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showBanner && /* @__PURE__ */ jsx("div", { style: overlay, className, children: /* @__PURE__ */ jsxs("div", { style: box, children: [
      /* @__PURE__ */ jsxs("div", { style: head, children: [
        logoPopup && /* @__PURE__ */ jsx("img", { src: logoPopup, style: { height: 26 }, alt: "ShopShield" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "white" }, children: "Privacy & Cookie" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: body, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 4px" }, children: text }),
        /* @__PURE__ */ jsxs("div", { style: toggleRow, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: "#08152E" }, children: "Necessari" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 }, children: "Login, carrello, sicurezza" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: __spreadProps(__spreadValues({}, switchStyle(true)), { opacity: 0.5, cursor: "default" }), children: /* @__PURE__ */ jsx("div", { style: thumb(true) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: toggleRow, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: "#08152E" }, children: "Analitici" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 }, children: "Statistiche di navigazione anonime" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: switchStyle(analytics), onClick: () => setAnalytics((a) => !a), children: /* @__PURE__ */ jsx("div", { style: thumb(analytics) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: __spreadProps(__spreadValues({}, toggleRow), { marginBottom: 10 }), children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600, color: "#08152E" }, children: "Marketing" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 }, children: "Pubblicit\xE0 personalizzata" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: switchStyle(marketing), onClick: () => setMarketing((m) => !m), children: /* @__PURE__ */ jsx("div", { style: thumb(marketing) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 10, color: "#94a3b8", marginBottom: 4 }, children: [
          privacyUrl && /* @__PURE__ */ jsx("a", { href: privacyUrl, style: { color: "#94a3b8", textDecoration: "none" }, children: "Privacy Policy" }),
          privacyUrl && dsarUrl && " \xB7 ",
          dsarUrl && /* @__PURE__ */ jsx("a", { href: dsarUrl, target: "_blank", rel: "noreferrer", style: { color: "#94a3b8", textDecoration: "none" }, children: "I tuoi diritti GDPR" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: actions, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { flex: 1, padding: 11, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#f1f5f9", color: "#08152E" },
            onClick: () => handleSave(false, false),
            children: "Rifiuta tutti"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { flex: 1, padding: 11, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "white", background: primary },
            onClick: () => handleSave(analytics, marketing),
            children: "Salva scelte"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { flex: 1, padding: 11, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "white", background: accent },
            onClick: () => handleSave(true, true),
            children: "Accetta tutti"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: tab,
        onMouseEnter: () => setTabOpen(true),
        onMouseLeave: () => setTabOpen(false),
        onClick: () => setPanelOpen((p) => !p),
        children: [
          /* @__PURE__ */ jsx("div", { style: { flexShrink: 0, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }, children: logoTab ? /* @__PURE__ */ jsx("img", { src: logoTab, style: { width: 24, height: 24, display: "block", borderRadius: 4 }, alt: "" }) : /* @__PURE__ */ jsx("span", { style: { fontSize: 16 }, children: "\u{1F6E1}\uFE0F" }) }),
          /* @__PURE__ */ jsx("span", { style: { color: "white", fontSize: 12, fontWeight: 700, paddingRight: 14, opacity: tabOpen ? 1 : 0, transition: "opacity .2s" }, children: "Privacy Active" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: panel, children: [
      /* @__PURE__ */ jsxs("div", { style: { background: primary, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        logoPopup && /* @__PURE__ */ jsx("img", { src: logoPopup, style: { height: 28 }, alt: "ShopShield" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setPanelOpen(false), style: { background: "none", border: "none", color: "#94a3b8", fontSize: 18, cursor: "pointer" }, children: "\u2715" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: 18 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 700, color: "#08152E", marginBottom: 12 }, children: "PREFERENZE COOKIE" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600 }, children: "Necessari" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8" }, children: "Sempre attivi" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: __spreadProps(__spreadValues({}, switchStyle(true)), { opacity: 0.5, cursor: "default" }), children: /* @__PURE__ */ jsx("div", { style: thumb(true) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600 }, children: "Analitici" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8" }, children: "Statistiche di navigazione" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: switchStyle(analytics), onClick: () => setAnalytics((a) => !a), children: /* @__PURE__ */ jsx("div", { style: thumb(analytics) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: 600 }, children: "Marketing" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#94a3b8" }, children: "Pubblicit\xE0 personalizzata" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: switchStyle(marketing), onClick: () => setMarketing((m) => !m), children: /* @__PURE__ */ jsx("div", { style: thumb(marketing) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { padding: "12px 18px", borderTop: "1px solid #f1f5f9" }, children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            handleSave(analytics, marketing);
            setPanelOpen(false);
          },
          style: { width: "100%", padding: 10, background: primary, color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 },
          children: "Salva preferenze"
        }
      ) }),
      privacyUrl && /* @__PURE__ */ jsx("div", { style: { padding: "8px 18px 14px", textAlign: "center" }, children: /* @__PURE__ */ jsx("a", { href: privacyUrl, style: { fontSize: 10, color: "#94a3b8", textDecoration: "none" }, children: "Privacy Policy" }) })
    ] })
  ] });
}

export { DEFAULT_BRANDING, ShopShieldBanner, clearConsent, fetchConfig, readConsent, resolveBranding, useShopShield, writeConsent };
