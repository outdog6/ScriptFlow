// app/layout.tsx
import type { Metadata } from "next";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScriptFlow - AI 小说转剧本",
  description: "将小说自动转换为结构化剧本",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="h-screen overflow-hidden">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
