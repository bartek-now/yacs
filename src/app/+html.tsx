import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#193D34" />
        <meta
          name="description"
          content="YACS — Yet Another Calorie Scanner. Your day, one meal at a time."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="YACS" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <title>YACS · Your daily food diary</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'body { background: #F6F7F2; } :focus-visible { outline: 3px solid #719B48; outline-offset: 3px; }',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
