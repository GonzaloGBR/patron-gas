import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Patrón del Gas",
  description: "Sistema de gestión de ventas y préstamos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur-sm">
                  <div className="border-b border-slate-100/80 bg-slate-950/90 px-6 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#ff7a1a] to-[#ff4b1f] flex items-center justify-center shadow-sm">
                        <span className="text-xs font-black text-slate-950 tracking-[0.18em]">
                          GAS
                        </span>
                      </div>
                      <div className="leading-tight">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                          Patrón del Gas
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          Panel operativo de ventas, stock y préstamos
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Sesión activa
                    </span>
                  </div>
                  <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
