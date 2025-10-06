// app/layout.js
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { StarknetProvider } from "./context/StarknetProvider";
import Navbar from './components/NavBar'; 
import FooterInfo from './components/FooterInfo';

export const metadata = {
  title: "Typhoon",
  description: "Typhoon coin mixer",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} ${GeistMono.className} antialiased overflow-hidden h-[100dvh]`}>
        <StarknetProvider>
          <div className="min-h-[100dvh] flex flex-col">
            <Navbar />
            <main className="flex-1 pb-16">
              {children}
            </main>
            <footer className="fixed bottom-0 left-0 right-0">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2">
                <FooterInfo />
              </div>
            </footer>
          </div>
        </StarknetProvider>
      </body>
    </html>
  );
}
