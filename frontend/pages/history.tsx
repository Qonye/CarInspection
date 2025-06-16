import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CarInspection } from '../types/inspection';
import EnhancedReportGenerator from '../components/EnhancedReportGenerator';
import Link from 'next/link';

export default function History() {
  const [inspections, setInspections] = useState<CarInspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<CarInspection | null>(null);

  useEffect(() => {
    const history = localStorage.getItem('inspectionHistory');
    if (history) {
      try {
        setInspections(JSON.parse(history));
      } catch (error) {
        console.error('Failed to parse inspection history:', error);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedInspection) {
    return (
      <div className="min-h-screen bg-[#000000]">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={() => setSelectedInspection(null)}
            className="mb-4 px-4 py-2 bg-[#000000] text-white border border-white rounded hover:bg-gray-900 transition-colors font-light tracking-wide"
          >
            Back to History
          </button>
          <EnhancedReportGenerator inspection={selectedInspection} theme="dark" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Inspection History - Car Inspector</title>
        <meta name="description" content="View and manage your vehicle inspection history. Access past reports, track inspections, and monitor your automotive assessment records." />
        <meta property="og:title" content="Vehicle Inspection History - Car Inspector" />
        <meta property="og:url" content="/history" />
        <link rel="canonical" href="/history" />
      </Head>
      <main className="min-h-screen bg-[#000000] pt-4 pb-8">
        <div className="max-w-4xl mx-auto pt-8 px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-light tracking-tight text-white">Inspection History</h1>
            <Link href="/new" className="text-white hover:text-gray-300 font-light tracking-wide">
              New Inspection
            </Link>
          </div>

          <div className="grid gap-4 mt-2">
            {inspections.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-light tracking-wide">
                No inspection history found.
              </div>
            ) : (
              inspections.map((inspection) => (
                <div 
                  key={inspection.id}
                  className="p-4 bg-[#000000] border border-gray-800 rounded-lg shadow-lg hover:shadow-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium tracking-wide text-white">
                        {inspection.carBasics?.make ?? 'Unknown Make'} {inspection.carBasics?.model ?? 'Unknown Model'}
                      </h3>
                      <p className="text-sm font-light text-gray-400 tracking-wide mt-1">
                        {formatDate(inspection.date)}
                      </p>
                      <p className="text-sm font-light text-gray-400 tracking-wide">
                        Inspector: {inspection.inspector?.name ?? 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInspection(inspection)}
                      className="px-4 py-2 bg-[#000000] text-white border border-white rounded hover:bg-gray-900 transition-colors font-light tracking-wide"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}