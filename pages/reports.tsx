import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { format, parseISO } from 'date-fns'

type SortField = 'date' | 'customerName' | 'status'
type SortDir = 'asc' | 'desc'

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
const PAGE_SIZE = 10

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), 'dd MMM yyyy') } catch { return dateStr }
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Pending: 'bg-amber-100 text-amber-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-purple-100 text-purple-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colours[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

function SortIcon({ field, active, dir }: { field: SortField; active: boolean; dir: SortDir }) {
  void field
  if (!active) return <span className="ml-1 text-gray-300 text-xs">↕</span>
  return <span className="ml-1 text-green-500 text-xs">{dir === 'asc' ? '↑' : '↓'}</span>
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-gray-800 text-sm">{value || '—'}</p>
    </div>
  )
}

const ReportsPage: NextPage = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [statusFilter, setStatusFilter] = useState('All')
  const [productFilter, setProductFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [page, setPage] = useState(1)

  const [viewReport, setViewReport] = useState<Report | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    setLoading(true)
    setFetchError('')
    try {
      const { data } = await axios.get<{ reports: Report[] }>('/api/call-reports')
      setReports(data.reports)
    } catch {
      setFetchError('Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await axios.delete(`/api/call-reports/${id}`)
      setReports((prev) => prev.filter((r) => r.id !== id))
      setDeleteConfirmId(null)
      if (viewReport?.id === id) setViewReport(null)
    } catch {
      alert('Failed to delete report. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  function applyFilter<T>(setter: (v: T) => void, value: T) {
    setter(value)
    setPage(1)
  }

  function clearFilters() {
    setStatusFilter('All')
    setProductFilter('All')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      if (productFilter !== 'All' && !r.product.includes(productFilter)) return false
      if (fromDate && new Date(r.date) < new Date(fromDate)) return false
      if (toDate && new Date(r.date) > new Date(toDate + 'T23:59:59')) return false
      return true
    })
  }, [reports, statusFilter, productFilter, fromDate, toDate])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
        return sortDir === 'asc' ? diff : -diff
      }
      const aVal = (a[sortField] ?? '').toLowerCase()
      const bVal = (b[sortField] ?? '').toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const startIdx = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endIdx = Math.min(page * PAGE_SIZE, sorted.length)

  const activeFilters =
    statusFilter !== 'All' || productFilter !== 'All' || fromDate || toDate

  return (
    <>
      <Head>
        <title>All Reports — FreshWater</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">

        <Navbar />

        {/* Page header */}
        <div className="text-white py-5 px-6" style={{ backgroundColor: '#1E1B72' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h1 className="text-lg font-bold tracking-wide">All Call Reports</h1>
                <p className="text-green-200 text-xs mt-0.5">
                  {loading ? 'Loading…' : `${reports.length} total report${reports.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/" className="text-green-200 hover:text-white text-sm transition-colors">
                ← Back to Home
              </Link>
              <Link
                href="/call-report"
                className="bg-white text-[#1B5E20] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
              >
                + Add New Report
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
            <div className="flex flex-wrap gap-3 items-end">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => applyFilter(setStatusFilter, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[130px]"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</label>
                <select
                  value={productFilter}
                  onChange={(e) => applyFilter(setProductFilter, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[150px]"
                >
                  {PRODUCT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => applyFilter(setFromDate, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => applyFilter(setToDate, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {activeFilters && (
                <button
                  onClick={clearFilters}
                  className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors self-end"
                >
                  Clear Filters
                </button>
              )}

              {!loading && (
                <p className="text-sm text-gray-400 self-end ml-auto">
                  {sorted.length} result{sorted.length !== 1 ? 's' : ''}
                  {activeFilters && ` (filtered from ${reports.length})`}
                </p>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg className="animate-spin w-9 h-9 mb-4 text-green-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Loading reports…</p>
            </div>
          )}

          {/* Fetch error */}
          {!loading && fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm flex items-center gap-3">
              <span className="text-lg">❌</span>
              <span>{fetchError}</span>
              <button onClick={fetchReports} className="ml-2 underline font-semibold hover:no-underline">
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-5">📋</span>
              <p className="text-gray-700 font-bold text-xl mb-2">No reports found</p>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                {reports.length === 0
                  ? 'No call reports yet. Create the first one to get started!'
                  : 'No reports match your current filters. Try clearing them.'}
              </p>
              {reports.length === 0 ? (
                <Link
                  href="/call-report"
                  className="bg-[#1B5E20] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors shadow-sm"
                >
                  + Add First Report
                </Link>
              ) : (
                <button
                  onClick={clearFilters}
                  className="border-2 border-gray-300 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && !fetchError && sorted.length > 0 && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(
                          [
                            { label: 'Date', field: 'date' as SortField, sortable: true },
                            { label: 'Customer Name', field: 'customerName' as SortField, sortable: true },
                            { label: 'Telephone', sortable: false },
                            { label: 'Product', sortable: false },
                            { label: 'Buyer Type', sortable: false },
                            { label: 'Status', field: 'status' as SortField, sortable: true },
                            { label: 'Follow-up Date', sortable: false },
                            { label: 'Actions', sortable: false },
                          ] as Array<{ label: string; field?: SortField; sortable: boolean }>
                        ).map(({ label, field, sortable }) => (
                          <th
                            key={label}
                            onClick={sortable && field ? () => handleSort(field) : undefined}
                            className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none ${
                              sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                            }`}
                          >
                            {label}
                            {sortable && field && (
                              <SortIcon field={field} active={sortField === field} dir={sortDir} />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginated.map((report, idx) => (
                        <tr
                          key={report.id}
                          className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {fmt(report.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-sm font-semibold text-gray-900">{report.customerName}</p>
                            {report.location && (
                              <p className="text-xs text-gray-400 mt-0.5">{report.location}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {report.telephone}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px]">
                            <span className="block truncate" title={report.product}>{report.product}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {report.buyerType}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {fmt(report.followUpDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {deleteConfirmId === report.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-red-600 font-semibold">Sure?</span>
                                <button
                                  onClick={() => handleDelete(report.id)}
                                  disabled={deleting}
                                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md font-semibold disabled:opacity-50 transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewReport(report)}
                                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(report.id)}
                                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <p className="text-sm text-gray-500 order-2 sm:order-1">
                  Showing{' '}
                  <span className="font-semibold text-gray-700">{startIdx}–{endIdx}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-700">{sorted.length}</span>
                  {' '}report{sorted.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500 px-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}

        </main>

        <footer className="text-white/70 text-center text-xs py-4 mt-auto" style={{ backgroundColor: '#1E1B72' }}>
          &copy; {new Date().getFullYear()} FLOW Natural Mineral Water. All rights reserved.
        </footer>

      </div>

      {/* View Detail Modal */}
      {viewReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setViewReport(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="bg-[#1B5E20] text-white px-6 py-4 rounded-t-2xl flex items-start justify-between flex-shrink-0">
              <div>
                <h2 className="font-bold text-base leading-tight">{viewReport.customerName}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-green-200 text-xs">{fmt(viewReport.date)}</span>
                  <StatusBadge status={viewReport.status} />
                </div>
              </div>
              <button
                onClick={() => setViewReport(null)}
                className="text-green-300 hover:text-white text-2xl leading-none ml-4 flex-shrink-0"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Telephone" value={viewReport.telephone} />
                <DetailField label="Location" value={viewReport.location ?? '—'} />
                <DetailField label="Product" value={viewReport.product} />
                <DetailField label="Buyer Type" value={viewReport.buyerType} />
                <DetailField label="Follow-up Date" value={fmt(viewReport.followUpDate)} />
                <DetailField label="Followed Up By" value={viewReport.followedUpBy} />
                <DetailField label="Created By" value={viewReport.createdBy} />
                <DetailField label="Created At" value={fmt(viewReport.createdAt)} />
              </div>

              {viewReport.comments && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Comments</p>
                  <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed border border-gray-100">
                    {viewReport.comments}
                  </p>
                </div>
              )}

              {viewReport.summary && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Summary / Follow Up</p>
                  <p className="text-gray-700 bg-gray-50 rounded-xl px-4 py-3 text-sm leading-relaxed border border-gray-100">
                    {viewReport.summary}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-300 pt-1 border-t border-gray-100">
                ID: {viewReport.id}
              </p>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setDeleteConfirmId(viewReport.id)
                  setViewReport(null)
                }}
                className="flex-1 border-2 border-red-200 text-red-600 font-semibold py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                Delete Report
              </button>
              <button
                onClick={() => setViewReport(null)}
                className="flex-2 flex-1 bg-[#1B5E20] text-white font-semibold py-2.5 rounded-xl hover:bg-green-800 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportsPage
