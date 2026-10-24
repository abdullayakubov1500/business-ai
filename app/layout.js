import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
});

const sans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans-family",
});

export const metadata = {
  title: "Ателье «Поле» — сайты, которые собирают заявки",
  description:
    "Лендинги и сайты компаний за 14 дней. ИИ собирает бриф, вы получаете готовый сайт под заявки.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem("pole-theme");
    var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <Script id="pole-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
