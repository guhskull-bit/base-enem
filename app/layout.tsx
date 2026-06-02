import "@/app/globals.css";
import { DemoStoreProvider } from "@/components/demo-store-provider";
import { readSessionCookie } from "@/lib/session";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Base ENEM",
  description: "Base ENEM - Ferramenta de estudos para o ENEM do Colégio Santa Marcelina · RJ",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await readSessionCookie();

  return (
    <html lang="pt-BR">
      <body>
        <DemoStoreProvider initialCurrentUserId={session?.id ?? null}>{children}</DemoStoreProvider>
      </body>
    </html>
  );
}
