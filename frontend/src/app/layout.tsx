import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Splunk Nexus AI — Autonomous Enterprise Digital Twin & Crisis Commander",
  description: "AI-powered mission control for enterprise infrastructure. Real-time digital twin, autonomous incident response, predictive failure detection, and crisis management — powered by Splunk, LangGraph, and multi-agent AI.",
  keywords: "Splunk, AI, Digital Twin, Crisis Management, Incident Response, LangGraph, Enterprise, Observability",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
