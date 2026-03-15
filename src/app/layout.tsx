import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm sticky top-0 z-50 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🚗 AUTOWEB</h1>
            <div className="space-x-4">
              <a href="/" className="text-gray-700 hover:text-green-600 font-medium">Accueil</a>
              <a href="/stock" className="text-gray-700 hover:text-green-600 font-medium">Stock</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 font-medium">Contact</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xl mb-4">AUTOWEB COMMERCE</p>
            <p className="mb-2">📞 06 98 76 54 32 | WhatsApp</p>
            <p>🌐 www.souqify.fr | SAS SIREN 100148469</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
