import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stick it Up Dealers",
  description: "Dealer management platform for Stick it Up stickers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="min-h-screen">
        <body
          className={`${inter.variable} font-sans antialiased min-h-screen`}
        >
          <div className="relative min-h-screen">
            {/* Background Dots Pattern */}
            <div className="absolute inset-0 z-0 opacity-30">
              <div className="absolute inset-0" 
                style={{
                  backgroundImage: `radial-gradient(#f1872b 0.5px, transparent 0.5px), radial-gradient(#ee715f 0.5px, transparent 0.5px)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px'
                }}
              ></div>
            </div>
            
            {/* Main Content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
