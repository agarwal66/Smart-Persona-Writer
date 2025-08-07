import "../styles/globals.css";
import Navbar from "../components/Navbar";
import SessionWrapper from "../components/SessionWrapper";
import { ThemeProvider } from "next-themes"; // Ensure this is installed
import { Inter, Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata = {
  title: "Smart Persona Writer",
  description: "Generate AI content with saved personas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionWrapper>
            <Navbar />
            <main className="p-4 max-w-5xl mx-auto">{children}</main>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}