import "./globals.css";

import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>My Calendy</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="Scheduling your tasks around your brains schedule."
        />
        <meta property="og:title" content="My Calendy" />
        <meta
          property="og:description"
          content="Scheduling your tasks around your brains schedule."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Calendy" />
        <meta
          name="twitter:description"
          content="Scheduling your tasks around your brains schedule."
        />
        <meta name="twitter:image" content="/logo.png" />
      </head>
      <body className={publicSans.className}>
        <div className="flex flex-col p-4 md:p-12 h-[100vh]">{children}</div>
      </body>
    </html>
  );
}
