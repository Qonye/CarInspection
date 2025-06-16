import '../styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { initializeDemoLicense } from '../utils/licensing';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize demo license for new users
    initializeDemoLicense();
    
    // Force a re-render on client-side to properly hydrate components
    if (typeof window !== 'undefined') {
      const forceRerender = () => {
        if (document.documentElement.hasAttribute('data-hydrated')) return;
        document.documentElement.setAttribute('data-hydrated', 'true');
      };
      
      // Allow components to mount first
      setTimeout(forceRerender, 100);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1E293B" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;