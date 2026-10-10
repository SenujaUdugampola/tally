import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: "Tally",
  description: "A platform for sharing expenses with friends and family",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={inter.className}>
      <head>
        <link rel="icon" type="logos/logo-s.png" sizes="any" />

      </head>
      <body className="min-h-full flex flex-col">
        
        <Header />

        <main className="min-h-screen"> {children} </main>
      </body>
    </html>
  );
}
