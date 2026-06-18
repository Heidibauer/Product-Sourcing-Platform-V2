import './globals.css';

export const metadata = {
  title: 'big ticket. studio',
  description: 'AI-powered interior intelligence. Real products. Real links. Complete solutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-white text-brand-black antialiased">
        {children}
      </body>
    </html>
  );
}
