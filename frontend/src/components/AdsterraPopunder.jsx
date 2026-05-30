'use client';

import Script from 'next/script';

export default function AdsterraPopunder() {
  const adUrl = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL;

  if (!adUrl) return null;

  return (
    <Script
      src={adUrl}
      strategy="afterInteractive"
      onError={() => console.warn('Adsterra ad failed to load')}
    />
  );
}
