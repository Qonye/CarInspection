import Head from 'next/head';
import InspectionForm from '../components/InspectionForm';
import Layout from '../components/Layout';

export default function New() {
  return (
    <Layout>
      <Head>
        <title>Car Inspection Report - Used Cars & Import Inspections | Car Inspector Kenya</title>
        <meta name="description" content="Get a detailed car inspection report before buying or selling vehicles in Kenya. Professional assessment for Japanese imports, Dubai cars, and local used vehicles. Make informed decisions with our expert reports." />
        <meta property="og:title" content="Professional Car Inspection Report - Car Inspector Kenya" />
        <meta property="og:url" content="/new" />
        <meta name="keywords" content="car inspection report Kenya, used car inspection, import car check, vehicle condition report, pre-purchase car inspection Nairobi, Japanese car import inspection" />
        <link rel="canonical" href="/new" />
      </Head>
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4">
          <InspectionForm />
        </div>
      </main>
    </Layout>
  );
}