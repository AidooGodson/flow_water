import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const NAVY = '#1E1B72'
const RED  = '#CC1515'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { format, parseISO, isToday } from 'date-fns'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Report {
  id: string
  date: string
  customerName: string
  telephone: string
  location: string | null
  product: string
  buyerType: string
  comments: string | null
  summary: string | null
  followUpDate: string | null
  followedUpBy: string
  status: string
  createdAt: string
  createdBy: string
}

const STATUS_OPTIONS = ['All', 'New', 'Pending', 'Completed', 'Reviewed']
const PRODUCT_OPTIONS = ['All', 'Bottled Water', 'Sachet Water', 'Dispenser']
const BUYER_TYPE_OPTIONS = ['All', 'Bulk buyer', 'Medium scale', 'Small scale']

const PIE_COLORS_PRODUCT = ['#CC1515', '#1E1B72', '#FF9800']
const PIE_COLORS_BUYER = ['#9C27B0', '#00BCD4', '#E91E63']

function fmt(d: string | null | undefined) {
  if (!d) return '—'
  try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Pending: 'bg-amber-100 text-amber-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function exportToCSV(data: Report[]) {
  const headers = [
    'Date', 'Customer Name', 'Telephone', 'Location', 'Product',
    'Buyer Type', 'Status', 'Follow-up Date', 'Followed Up By', 'Comments', 'Summary',
  ]
  const escape = (v: string | null | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  const rows = data.map((r) =>
    [
      fmt(r.date), r.customerName, r.telephone, r.location,
      r.product, r.buyerType, r.status, fmt(r.followUpDate),
      r.followedUpBy, r.comments, r.summary,
    ].map(escape).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `freshwater-reports-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const DashboardPage: NextPage = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [productFilter, setProductFilter] = useState('All')
  const [buyerTypeFilter, setBuyerTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    setLoading(true)
    setFetchError('')
    try {
      const { data } = await axios.get<{ reports: Report[] }>('/api/call-reports')
      setReports(data.reports)
    } catch {
      setFetchError('Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setFromDate('')
    setToDate('')
    setProductFilter('All')
    setBuyerTypeFilter('All')
    setStatusFilter('All')
  }

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      if (productFilter !== 'All' && !r.product.includes(productFilter)) return false
      if (buyerTypeFilter !== 'All' && r.buyerType !== buyerTypeFilter) return false
      if (fromDate && new Date(r.date) < new Date(fromDate)) return false
      if (toDate && new Date(r.date) > new Date(toDate + 'T23:59:59')) return false
      return true
    })
  }, [reports, statusFilter, productFilter, buyerTypeFilter, fromDate, toDate])

  // Summary card values
  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter((r) => r.status === 'Pending').length,
    today: filtered.filter((r) => {
      try { return isToday(parseISO(r.date)) } catch { return false }
    }).length,
    completed: filtered.filter((r) => r.status === 'Completed').length,
  }), [filtered])

  // Chart data
  const productChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((r) => {
      r.product.split(',').forEach((p) => {
        const key = p.trim()
        if (key) counts[key] = (counts[key] ?? 0) + 1
      })
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  const buyerTypeChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((r) => {
      if (r.buyerType) counts[r.buyerType] = (counts[r.buyerType] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Recent pending follow-ups
  const recentFollowUps = useMemo(() => {
    return filtered
      .filter((r) => r.followUpDate && (r.status === 'Pending' || r.status === 'New'))
      .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
      .slice(0, 5)
  }, [filtered])

  const activeFilters = fromDate || toDate || productFilter !== 'All' || buyerTypeFilter !== 'All' || statusFilter !== 'All'

  const summaryCards = [
    {
      title: 'Total Reports',
      value: stats.total,
      subtitle: activeFilters ? 'Filtered' : 'All Time',
      icon: '📋',
      color: NAVY,
    },
    {
      title: 'Follow Ups',
      value: stats.pending,
      subtitle: 'Awaiting Action',
      icon: '⏰',
      color: '#F97316',
    },
    {
      title: "Today's Reports",
      value: stats.today,
      subtitle: 'Submitted Today',
      icon: '📅',
      color: '#2563EB',
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: activeFilters ? 'Filtered' : 'All Time',
      icon: '✅',
      color: '#9333EA',
    },
  ]

  return (
    <>
      <Head>
        <title>Manager Dashboard — FLOW Natural Mineral Water</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">

        <Navbar />

        {/* Page header */}
        <div className="text-white py-5 px-6" style={{ backgroundColor: NAVY }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <h1 className="text-lg font-bold tracking-wide">Manager Dashboard</h1>
                <p className="text-green-200 text-xs mt-0.5">
                  Overview of all call report activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/" className="text-green-200 hover:text-white text-sm transition-colors">
                ← Back to Home
              </Link>
              <button
                onClick={() => exportToCSV(filtered)}
                disabled={filtered.length === 0}
                className="bg-white text-[#1B5E20] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⬇ Export CSV
              </button>
              <Link href="/call-report"
                className="bg-green-700 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors border border-green-500">
                + Add Report
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg className="animate-spin w-9 h-9 mb-4 text-green-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Loading dashboard…</p>
            </div>
          )}

          {!loading && fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
              <span>❌ {fetchError}</span>
              <button onClick={fetchReports} className="underline font-semibold">Retry</button>
            </div>
          )}

          {!loading && !fetchError && (
            <>
              {/* SECTION 1: Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                  <div key={card.title}
                    className="text-white rounded-2xl p-5 shadow-md"
                    style={{ backgroundColor: card.color }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                          {card.title}
                        </p>
                        <p className="text-4xl font-extrabold mt-2 leading-none">{card.value}</p>
                        <p className="text-white/60 text-xs mt-2">{card.subtitle}</p>
                      </div>
                      <span className="text-3xl opacity-80">{card.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 2: Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filters</h2>
                  {activeFilters && (
                    <button onClick={resetFilters}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
                      ✕ Clear All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
                    <input type="date" value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
                    <input type="date" value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</label>
                    <select value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]">
                      {PRODUCT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Buyer Type</label>
                    <select value={buyerTypeFilter}
                      onChange={(e) => setBuyerTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[140px]">
                      {BUYER_TYPE_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
                    <select value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[130px]">
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Reports Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Reports</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      Showing{' '}
                      <span className="font-semibold text-gray-600">{Math.min(10, filtered.length)}</span>
                      {' '}of{' '}
                      <span className="font-semibold text-gray-600">{reports.length}</span>
                      {' '}reports{activeFilters ? ' (filtered)' : ''}
                    </span>
                    <Link href="/reports"
                      className="text-xs text-green-700 hover:text-green-900 font-semibold underline">
                      View All →
                    </Link>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <span className="text-4xl block mb-3">📋</span>
                    <p className="text-sm">
                      {reports.length === 0 ? 'No reports yet.' : 'No reports match the current filters.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Date', 'Customer Name', 'Telephone', 'Product', 'Buyer Type', 'Status', 'Follow-up'].map((h) => (
                            <th key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.slice(0, 10).map((r, i) => (
                          <tr key={r.id}
                            className={`hover:bg-green-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(r.date)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900">{r.customerName}</p>
                              {r.location && <p className="text-xs text-gray-400">{r.location}</p>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.telephone}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px]">
                              <span className="block truncate" title={r.product}>{r.product}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.buyerType}</td>
                            <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmt(r.followUpDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 4: Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Chart 1: By Product */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                    📦 Reports by Product
                  </h2>
                  {!mounted || productChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                      No data to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={productChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={({ name, percent }: any) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {productChartData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS_PRODUCT[index % PIE_COLORS_PRODUCT.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [
                            `${value} report${value !== 1 ? 's' : ''}`,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Chart 2: By Buyer Type */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                    👥 Reports by Buyer Type
                  </h2>
                  {!mounted || buyerTypeChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                      No data to display
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={buyerTypeChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={({ name, percent }: any) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {buyerTypeChartData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS_BUYER[index % PIE_COLORS_BUYER.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [
                            `${value} report${value !== 1 ? 's' : ''}`,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* SECTION 5: Recent Follow-ups */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    ⏰ Upcoming Follow-ups
                  </h2>
                  <span className="text-xs text-gray-400">
                    {recentFollowUps.length} pending
                  </span>
                </div>

                {recentFollowUps.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-sm">No pending follow-ups. All caught up!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {recentFollowUps.map((r) => (
                      <li key={r.id}
                        className="px-5 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {r.customerName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.telephone}{r.location ? ` · ${r.location}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-orange-600">
                              {fmt(r.followUpDate)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Follow-up</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </>
          )}
        </main>

        <footer className="text-white/70 text-center text-xs py-4 mt-auto" style={{ backgroundColor: NAVY }}>
          &copy; {new Date().getFullYear()} FLOW Natural Mineral Water. All rights reserved.
        </footer>

      </div>
    </>
  )
}

export default DashboardPage
