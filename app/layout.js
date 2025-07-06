import "../styles/globals.css";
import Navbar from "../components/Navbar";
import SessionWrapper from "../components/SessionWrapper";

export const metadata = {
  title: "Smart Persona Writer",
  description: "Generate AI content with saved personas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <SessionWrapper>
          <Navbar />
          <main className="p-4 max-w-5xl mx-auto">{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}