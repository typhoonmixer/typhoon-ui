// app/layout.js
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { StarknetProvider } from "./context/StarknetProvider";
import Navbar from './components/NavBar'; 

export const metadata = {
  title: "Typhoon",
  description: "Typhoon coin mixer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} ${GeistMono.className} antialiased`}
      >
        <StarknetProvider>
          <Navbar />
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
