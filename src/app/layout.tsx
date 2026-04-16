import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/components/layout/SessionProvider';
import { CurrencyProvider } from '@/components/ui/currency-selector';

export const metadata: Metadata = {
  title: 'StyleÉchange — Marché de mode au Burundi',
  description: 'Achetez et vendez des articles de mode au Burundi sur StyleÉchange.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 min-h-screen flex flex-col">
        <SessionProvider>
          <CurrencyProvider>
            <Navbar />
            <main className="flex-1 bg-background">
              {children}
            </main>
            <Toaster />
          </CurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}