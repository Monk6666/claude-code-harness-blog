import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Shell } from "@/components/Layout/Shell";
import { getAllChapters } from "@/lib/chapters";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Claude Code Harness Engineering — 深入剖析 AI 編程代理架構",
    template: "%s | Claude Code Harness Engineering",
  },
  description:
    "深度剖析 Claude Code 如何透過工具系統、代理編排、權限分層、Hook 擴展等機制實現 Harness Engineering，將 LLM 轉化為自主工程代理。",
  openGraph: {
    title: "Claude Code Harness Engineering",
    description: "深入剖析 AI 編程代理的工程架構教學日誌",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chapters = getAllChapters();

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Shell chapters={chapters}>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
