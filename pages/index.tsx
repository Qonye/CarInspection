import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CarInspection } from '../types/inspection';
import Head from 'next/head';

export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    completedToday: 0,
    drafts: 0
  });

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('inspectionHistory') || '[]') as CarInspection[];
    const today = new Date().toDateString();
    
    setStats({
      total: history.length,
      completedToday: history.filter(inspection => 
        new Date(inspection.date).toDateString() === today && 
        inspection.status === 'completed'
      ).length,
      drafts: history.filter(inspection => inspection.status === 'draft').length
    });
  }, []);

  return (
    <>
      <Head>
        <title>Car Self-Inspector - Do Your Own Vehicle Inspection</title>
        <meta name="description" content="DIY car inspection app. Create professional vehicle inspection reports for buying used cars. Make informed decisions when purchasing or selling vehicles." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Car Self-Inspector - Inspect Cars Yourself with Confidence" />
        <meta property="og:url" content="/" />
        <link rel="canonical" href="/" />
      </Head>
      
      {/* Hero Section with Fade Transition */}
      <div className="relative bg-[#000000]">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="/images/Hero2.jpg"
            alt="Car Inspection"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#000000]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto pt-16 pb-24 px-4 sm:pb-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl mx-auto max-w-4xl">
            Generate Professional Car Inspection Reports <span className="font-light">Instantly</span>
          </h1>
          <p className="mt-6 text-lg font-light tracking-wide text-white/90 max-w-3xl mx-auto">
            Complete your own professional vehicle inspection and get an instant detailed report. Perfect for buying, selling, or documenting your car's condition.
          </p>
          <div className="mt-10 sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link
                href="/new"
                className="flex items-center justify-center px-8 py-3 text-base font-light rounded-md text-white bg-transparent border border-white hover:bg-white hover:text-black md:py-4 md:text-lg md:px-10 transition-all duration-300 ease-in-out"
              >
                Start New Inspection
              </Link>
              <Link
                href="/history"
                className="flex items-center justify-center px-8 py-3 text-base font-light rounded-md text-white bg-transparent border border-white hover:bg-white hover:text-black md:py-4 md:text-lg md:px-10 transition-all duration-300 ease-in-out"
              >
                View Inspection History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - remove top padding to blend with hero */}
      <div className="bg-[#000000] relative">
        {/* Remove the additional gradient that was causing the header-like appearance */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-white sm:text-4xl">
              Why Use Our Inspection System
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Step-by-Step Guide",
                description: "Our intuitive inspection system guides you through every aspect of the vehicle inspection process, ensuring nothing is missed.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                )
              },
              {
                title: "Instant Professional Reports",
                description: "Generate comprehensive PDF reports instantly with photos and detailed condition assessments. Perfect for documentation and negotiations.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              },
              {
                title: "Save Time & Money",
                description: "Complete professional-grade inspections yourself without waiting for appointments or paying expensive inspection fees.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-[#000000] rounded-lg p-6 shadow-lg shadow-white/10 border border-gray-800 hover:shadow-white/20 transition-shadow duration-300">
                <div className="text-white mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-[#000000] relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-white sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Start Your Inspection",
                description: "Begin a new inspection anytime, anywhere. Our app walks you through each step of the process."
              },
              {
                title: "Document Everything",
                description: "Take photos and add detailed notes about every aspect of the vehicle's condition using our comprehensive checklist."
              },
              {
                title: "Get Your Report",
                description: "Generate your professional inspection report instantly with all documentation, photos, and recommendations included."
              }
            ].map((step, index) => (
              <div key={index} className="bg-[#000000] rounded-lg p-6 shadow-lg shadow-white/10 border border-gray-800 hover:shadow-white/20 transition-shadow duration-300">
                <div className="text-white mb-4">
                  <span className="text-4xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-[#000000] relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-white sm:text-4xl">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Korir",
                testimonial: "The step-by-step inspection guide made it easy to thoroughly check the car I was interested in. The instant report helped me negotiate a better price."
              },
              {
                name: "Sarah Nkatha",
                testimonial: "This app gave me the confidence to inspect a used car myself. The professional report helped me identify issues I would have missed otherwise."
              },
              {
                name: "David Kang'ethe",
                testimonial: "Saved hundreds on inspection fees and got a detailed report instantly. Perfect for documenting my car's condition before selling."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#000000] rounded-lg p-6 shadow-lg shadow-white/10 border border-gray-800 hover:shadow-white/20 transition-shadow duration-300">
                <div className="text-white mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{testimonial.name}</h3>
                <p className="mt-2 text-gray-300 italic">{testimonial.testimonial}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#000000] py-12 relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-medium text-white">
              Ready to Get Your Car Inspected?
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
              Start your inspection today and ensure your vehicle's performance and safety.
            </p>
            <div className="mt-8">
              <Link
                href="/new"
                className="inline-flex items-center justify-center px-12 py-4 text-lg font-light rounded-md text-white bg-transparent border border-white hover:bg-white hover:text-black transition-all duration-300 ease-in-out md:text-xl"
              >
                Start Your DIY Inspection Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}