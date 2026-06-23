import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const NAVY = '#1E1B72'
const RED  = '#CC1515'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FLOW Natural Mineral Water — Call Report System</title>
        <meta name="description" content="Call report management system for FLOW Natural Mineral Water" />
        {/* Dancing Script for the tagline */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-100">

        <Navbar />

        {/* ── HERO BANNER ─────────────────────────────────────────── */}
        <div
          className="py-6 text-center"
          style={{ backgroundColor: NAVY }}
        >
          <p
            className="text-white text-3xl sm:text-4xl"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Oh Yes! Flow Water, Our Own!
          </p>
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* LEFT COLUMN */}
            <div className="flex-1 space-y-6">

              {/* Product card */}
              <div
                className="rounded-2xl overflow-hidden shadow-md flex flex-col sm:flex-row items-center gap-4 p-6"
                style={{ backgroundColor: '#1E3AA0' }}
              >
                {/* Branding + sizes */}
                <div className="text-white flex-shrink-0">
                  <p className="text-3xl font-black tracking-wide leading-none">FLOW</p>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-200 mt-1">
                    Natural Mineral Water
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['500ml', '1.5L', '5L', '20L'].map((size) => (
                      <span
                        key={size}
                        className="border border-white/60 text-white text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Product image */}
                <div className="flex-1 flex justify-center sm:justify-end">
                  <div className="bg-white rounded-xl p-3 shadow-inner">
                    <Image
                      src="/flow-products.png"
                      alt="FLOW water products"
                      width={300}
                      height={210}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Welcome text */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  Welcome to the{' '}
                  <span style={{ color: RED }}>Call Report System</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2 max-w-md leading-relaxed">
                  Capture and manage follow up calls with our valued
                  customers — efficiently and reliably.
                </p>
              </div>

              {/* Distributor info */}
              <div className="flex items-start gap-4">
                <Image
                  src="/desert-lion-logo.jpeg"
                  alt="Desert Lion International Ltd."
                  width={64}
                  height={64}
                  className="rounded-full flex-shrink-0 object-cover border-2 border-gray-200"
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-0.5">
                    Produced in Ghana by:
                  </p>
                  <p className="font-bold text-gray-900 text-base">
                    Desert Lion International Ltd.
                  </p>
                  <p>P.O.Box 14283, Kumasi – Ashanti Region</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="font-bold text-gray-900 text-base sm:text-lg">
                  Contact: 0500106010 / 0248744533 / 0598676581
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — Quick Actions */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                  Quick Actions
                </p>

                {/* Add New Call Report */}
                <Link
                  href="/call-report"
                  className="flex items-center gap-4 w-full text-white rounded-xl px-5 py-4 mb-3 font-semibold text-sm transition-opacity hover:opacity-90 group"
                  style={{ backgroundColor: RED }}
                >
                  <span className="text-xl flex-shrink-0">📋</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-base">Add New Call Report</p>
                    <p className="text-red-200 text-xs font-normal mt-0.5">
                      Record a new customer call
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-red-300 group-hover:translate-x-1 transition-transform flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* View All Reports */}
                <Link
                  href="/reports"
                  className="flex items-center gap-4 w-full text-gray-800 rounded-xl px-5 py-4 mb-3 font-semibold text-sm border-2 border-gray-200 hover:border-gray-400 bg-white transition-colors group"
                >
                  <span className="text-xl flex-shrink-0">📊</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-base">View All Reports</p>
                    <p className="text-gray-400 text-xs font-normal mt-0.5">
                      Browse and filter call history
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Manager Dashboard */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 w-full text-white rounded-xl px-5 py-4 font-semibold text-sm transition-opacity hover:opacity-90 group"
                  style={{ backgroundColor: NAVY }}
                >
                  <span className="text-xl flex-shrink-0">📈</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-base">Manager Dashboard</p>
                    <p className="text-blue-300 text-xs font-normal mt-0.5">
                      Summary, charts &amp; exports
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Quick tip */}
              <div className="mt-4 rounded-xl px-5 py-4 text-sm bg-red-50 border border-red-100">
                <p className="font-bold text-red-700 mb-1 flex items-center gap-1.5">
                  <span>📍</span> Quick tip
                </p>
                <p className="text-red-600 text-xs leading-relaxed">
                  After every customer call, add a report immediately to keep follow-up dates accurate.
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer
          className="py-4 text-center text-sm text-white/70"
          style={{ backgroundColor: NAVY }}
        >
          &copy; {new Date().getFullYear()} FLOW Natural Mineral Water. All rights reserved.
        </footer>

      </div>
    </>
  )
}

export default Home
