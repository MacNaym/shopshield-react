import * as react_jsx_runtime from 'react/jsx-runtime';

interface ShopShieldBannerProps {
    shop?: string;
    onConsent?: (analytics: boolean, marketing: boolean) => void;
    className?: string;
}
declare function ShopShieldBanner({ shop, onConsent, className }: ShopShieldBannerProps): react_jsx_runtime.JSX.Element | null;

interface ShopShieldConfig {
    shop: string;
    status: 'active' | 'inactive';
    plan: 'essential' | 'lite' | 'pro';
    blocked_cookies: string[];
    categories: {
        marketing?: string[];
        analytics?: string[];
    };
    features: {
        cookie_blocking: boolean;
        consent_storage: boolean;
        github_archive: boolean;
        monitoring: boolean;
        weekly_report: boolean;
        dsar: boolean;
        discovery_engine: boolean;
        show_branding: boolean;
    };
    settings: {
        primary_color: string | null;
        accent_color: string | null;
        logo_tab_url: string | null;
        logo_popup_url: string | null;
        banner_text: string | null;
        privacy_url: string | null;
        dsar_url: string | null;
    };
    config: {
        blocking_mode: string;
        reload_on_consent: boolean;
    };
}
declare const DEFAULT_BRANDING: {
    primary_color: string;
    accent_color: string;
    logo_tab_url: string;
    logo_popup_url: string;
    banner_text: string;
    privacy_url: string | null;
    dsar_url: string;
};
declare function fetchConfig(shop?: string): Promise<ShopShieldConfig | null>;
declare function resolveBranding(settings: ShopShieldConfig['settings']): typeof DEFAULT_BRANDING;

interface ConsentState {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}
interface ConsentRecord {
    given: boolean;
    expired: boolean;
    state: ConsentState;
    visitorId: string;
}
declare function readConsent(): ConsentRecord;
declare function writeConsent(analytics: boolean, marketing: boolean): ConsentRecord;
declare function clearConsent(): void;

interface ShopShieldState {
    config: ShopShieldConfig | null;
    branding: ReturnType<typeof resolveBranding> | null;
    loading: boolean;
    error: string | null;
    consent: ConsentRecord;
    showBanner: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    saveConsent: (analytics: boolean, marketing: boolean) => void;
}
declare function useShopShield(shop?: string): ShopShieldState;

export { type ConsentRecord, type ConsentState, DEFAULT_BRANDING, ShopShieldBanner, type ShopShieldBannerProps, type ShopShieldConfig, type ShopShieldState, clearConsent, fetchConfig, readConsent, resolveBranding, useShopShield, writeConsent };
