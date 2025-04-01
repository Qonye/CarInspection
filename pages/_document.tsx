import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <base href="/" />
        <meta charSet="utf-8" />
        <meta name="description" content="Professional car inspection service in Kenya. Expert vehicle assessments for used cars, imports, and local sales. Make informed decisions when buying or selling cars in Kenya." />
        <meta name="keywords" content="car inspection Kenya, buy used cars Kenya, sell used cars Kenya, import cars Kenya, Japanese used cars, car valuation Kenya, vehicle inspection report, pre-purchase car inspection, Toyota Kenya, Honda Kenya, Mazda Kenya, car dealer Kenya, second hand cars Nairobi, car marketplace Kenya" />
        <meta name="author" content="Car Inspector" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Car Inspector Kenya - Professional Vehicle Inspection for Buying & Selling Cars" />
        <meta property="og:description" content="Expert car inspection service in Kenya. Get detailed reports before buying used cars or importing vehicles. Professional assessments for car sales and valuations." />
        <meta property="og:site_name" content="Car Inspector Kenya" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1E293B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-background-dark text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}