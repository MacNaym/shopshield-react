// ─── @shopshield/react — public API ──────────────────────────────────────────

// Componente banner
export { ShopShieldBanner }    from './ShopShieldBanner';
export type { ShopShieldBannerProps } from './ShopShieldBanner';

// Hook
export { useShopShield }       from './useShopShield';
export type { ShopShieldState } from './useShopShield';

// Tipi config
export type { ShopShieldConfig } from './client';

// Tipi consenso
export type { ConsentState, ConsentRecord } from './consent';

// Utilità avanzate (per developer che vogliono UI custom)
export { fetchConfig, resolveBranding, DEFAULT_BRANDING } from './client';
export { readConsent, writeConsent, clearConsent }        from './consent';
