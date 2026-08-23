import "./globals.css";

export const metadata = {
  title: "Maveli — Onam Puzzle Challenge",
  description: "48-hour Onam-themed puzzle competition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-amber-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
