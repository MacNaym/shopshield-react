# @shopshield/react

Integrazione ufficiale di [ShopShield](https://shopshield.io) per React, Vite e [Lovable](https://lovable.dev).

Blocca i tracciatori prima del consenso, mostra un banner conforme GDPR e gestisce i consensi — tutto configurato direttamente dall'account ShopShield del merchant.

---

## Installazione

Il pacchetto è distribuito via GitHub. Nel `package.json` del tuo progetto aggiungi:

```json
{
  "dependencies": {
    "@shopshield/react": "github:MacNaym/shopshield-react"
  }
}
```

Poi installa:

```bash
npm install
```

Oppure in un comando solo:

```bash
npm install github:MacNaym/shopshield-react
```

> **Lovable** — incolla il comando qui sopra nel terminale integrato, oppure aggiungi la riga direttamente nel `package.json` del progetto e clicca "Install dependencies".

---

## Uso base (Lovable / Vite / CRA)

```tsx
// App.tsx
import { ShopShieldBanner } from '@shopshield/react';

export default function App() {
  return (
    <>
      <ShopShieldBanner />
      {/* resto dell'app */}
    </>
  );
}
```

Il banner legge automaticamente la configurazione dal dominio del sito (`window.location.hostname`). Colori, logo e testo vengono letti dalle impostazioni salvate nell'account ShopShield del merchant.

---

## Specificare il dominio manualmente

```tsx
<ShopShieldBanner shop="miosito.it" />
```

Utile in sviluppo locale o quando il dominio deve essere forzato.

---

## Callback dopo il consenso

```tsx
<ShopShieldBanner
  onConsent={(analytics, marketing) => {
    console.log('Analytics:', analytics, '| Marketing:', marketing);
  }}
/>
```

---

## Hook `useShopShield`

Per accedere allo stato del consenso nel resto dell'app:

```tsx
import { useShopShield } from '@shopshield/react';

export function MyComponent() {
  const { consent, config, branding, loading } = useShopShield();

  if (loading) return null;

  return (
    <div>
      <p>Piano: {config?.plan}</p>
      <p>Analytics: {consent.state.analytics ? 'Sì' : 'No'}</p>
      <p>Marketing: {consent.state.marketing ? 'Sì' : 'No'}</p>
    </div>
  );
}
```

---

## Azioni manuali

```tsx
const { acceptAll, rejectAll, saveConsent } = useShopShield();

// Accetta tutto
acceptAll();

// Rifiuta tutto
rejectAll();

// Consenso granulare
saveConsent(true, false); // analytics sì, marketing no
```

---

## UI completamente custom

Per chi vuole costruire la propria UI invece di usare `<ShopShieldBanner />`:

```tsx
import { useShopShield, fetchConfig, readConsent, writeConsent } from '@shopshield/react';

export function CustomBanner() {
  const { showBanner, branding, acceptAll, rejectAll } = useShopShield();

  if (!showBanner || !branding) return null;

  return (
    <div style={{ background: branding.primary_color }}>
      <p>{branding.banner_text}</p>
      <button onClick={acceptAll}>Accetta</button>
      <button onClick={rejectAll}>Rifiuta</button>
    </div>
  );
}
```

---

## Requisiti

- React ≥ 17
- Il dominio del sito deve essere registrato su [shopshield.io](https://shopshield.io/inizia)

---

## Aggiornare il pacchetto

Per rilasciare una nuova versione:

1. Modifica i file sorgente in `src/`
2. Aggiorna la versione in `package.json` (`1.0.0` → `1.0.1` per bugfix, `1.1.0` per nuove feature)
3. Fai `npm run build` per generare la cartella `dist/`
4. Fai commit e push su GitHub

I progetti che usano il pacchetto si aggiornano con:
```bash
npm update
```
Oppure reinstallando:
```bash
npm install github:MacNaym/shopshield-react
```

---

## Licenza

MIT — RMP Foodworks s.r.l.
