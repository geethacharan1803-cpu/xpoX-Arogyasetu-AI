import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ArogyaSetu AI - Rural Healthcare Platform',
  description: 'AI-powered, multilingual, offline-first rural healthcare communication and care-continuity platform connecting patients, ASHA workers, healthcare workers and PHC doctors.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#134e4a" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

