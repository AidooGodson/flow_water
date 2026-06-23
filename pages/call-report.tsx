import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '../components/Navbar'

const NAVY = '#1E1B72'
const RED  = '#CC1515'

const PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'] as const
const BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'] as const

interface FormData {
  date: string
  customerName: string
  telephone: string
  location: string
  products: string[]
  buyerType: string
  comments: string
  summary: string
  followUpDate: string
  followedUpBy: string
}

interface FormErrors {
  date?: string
  customerName?: string
  telephone?: string
  products?: string
  buyerType?: string
  followedUpBy?: string
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function emptyForm(): FormData {
  return {
    date: today(),
    customerName: '',
    telephone: '',
    location: '',
    products: [],
    buyerType: '',
    comments: '',
    summary: '',
    followUpDate: '',
    followedUpBy: '',
  }
}

const CallReportPage: NextPage = () => {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function toggleProduct(product: string) {
    setForm((f) => ({
      ...f,
      products: f.products.includes(product)
        ? f.products.filter((p) => p !== product)
        : [...f.products, product],
    }))
    setErrors((e) => ({ ...e, products: undefined }))
  }

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!form.date) errs.date = 'Date is required'
    if (!form.customerName.trim()) errs.customerName = 'Customer name is required'
    if (!form.telephone.trim()) errs.telephone = 'Telephone number is required'
    if (form.products.length === 0) errs.products = 'Select at least one product'
    if (!form.buyerType) errs.buyerType = 'Buyer type is required'
    if (!form.followedUpBy.trim()) errs.followedUpBy = 'Staff name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStatus('saving')
    try {
      await axios.post('/api/call-reports', {
        ...form,
        product: form.products.join(', '),
      })
      setStatus('success')
      setForm(emptyForm())
      setErrors({})
      setTimeout(() => router.push('/reports'), 2000)
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Something went wrong. Please try again.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  function handleClear() {
    setForm(emptyForm())
    setErrors({})
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <>
      <Head>
        <title>Add Call Report — FLOW Natural Mineral Water</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">

        <Navbar />

        {/* Page header */}
        <div className="text-white py-5 px-6" style={{ backgroundColor: NAVY }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h1 className="text-lg font-bold tracking-wide">Add New Call Report</h1>
                <p className="text-green-200 text-xs mt-0.5">
                  Complete all required fields and save the report
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

          {/* Success banner */}
          {status === 'success' && (
            <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-300 text-green-800 rounded-xl px-5 py-4">
              <span className="text-xl mt-0.5">✅</span>
              <div>
                <p className="font-semibold">Report saved successfully!</p>
                <p className="text-sm text-green-700 mt-0.5">
                  Redirecting to reports in 2 seconds…{' '}
                  <Link href="/reports" className="underline font-medium">
                    Go now →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {status === 'error' && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-300 text-red-800 rounded-xl px-5 py-4">
              <span className="text-xl mt-0.5">❌</span>
              <div>
                <p className="font-semibold">Failed to save report</p>
                <p className="text-sm text-red-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* SECTION 1: Customer Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ backgroundColor: NAVY }}>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                  Section 1 — Customer Information
                </h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer / Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => set('customerName', e.target.value)}
                    placeholder="e.g. Accra Foods Ltd"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                  )}
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telephone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => set('telephone', e.target.value)}
                    placeholder="e.g. 0244 123 456"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.telephone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.telephone && (
                    <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Tema, Accra"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

              </div>
            </section>

            {/* SECTION 2: Product */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ backgroundColor: NAVY }}>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                  Section 2 — Product Purchased
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-xs text-gray-500 mb-3">
                  Select all that apply <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {PRODUCTS.map((product) => {
                    const checked = form.products.includes(product)
                    return (
                      <label
                        key={product}
                        className={`flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-colors ${
                          checked
                            ? 'border-green-600 bg-green-50 text-green-800'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(product)}
                          className="accent-green-700 w-4 h-4"
                        />
                        <span className="text-sm font-medium">{product}</span>
                      </label>
                    )
                  })}
                </div>
                {errors.products && (
                  <p className="text-red-500 text-xs mt-2">{errors.products}</p>
                )}
              </div>
            </section>

            {/* SECTION 3: Buyer Type */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ backgroundColor: NAVY }}>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                  Section 3 — Buyer Type
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-xs text-gray-500 mb-3">
                  Select one <span className="text-red-500">*</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {BUYER_TYPES.map((type) => {
                    const selected = form.buyerType === type
                    return (
                      <label
                        key={type}
                        className={`flex items-center gap-3 flex-1 cursor-pointer rounded-xl border-2 px-4 py-3 transition-colors ${
                          selected
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="buyerType"
                          value={type}
                          checked={selected}
                          onChange={() => set('buyerType', type)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </label>
                    )
                  })}
                </div>
                {errors.buyerType && (
                  <p className="text-red-500 text-xs mt-2">{errors.buyerType}</p>
                )}
              </div>
            </section>

            {/* SECTION 4: Call Details */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ backgroundColor: NAVY }}>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                  Section 4 — Call Details
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.comments}
                    onChange={(e) => set('comments', e.target.value)}
                    rows={3}
                    placeholder="Notes about the call, customer needs, concerns…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Summary / Follow Up <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => set('summary', e.target.value)}
                    rows={3}
                    placeholder="What is the next action? What was agreed with the customer?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

              </div>
            </section>

            {/* SECTION 5: Follow-up Tracking */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-3" style={{ backgroundColor: NAVY }}>
                <h2 className="text-white font-bold text-sm uppercase tracking-widest">
                  Section 5 — Follow-Up Tracking
                </h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow Up Date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={form.followUpDate}
                    min={today()}
                    onChange={(e) => set('followUpDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Followed Up By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.followedUpBy}
                    onChange={(e) => set('followedUpBy', e.target.value)}
                    placeholder="Your name"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.followedUpBy ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.followedUpBy && (
                    <p className="text-red-500 text-xs mt-1">{errors.followedUpBy}</p>
                  )}
                </div>

              </div>
            </section>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pb-8">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl py-3 text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="flex-1 text-white font-semibold rounded-xl py-3 text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              style={{ backgroundColor: RED }}
              >
                {status === 'saving' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  'Save Report'
                )}
              </button>
            </div>

          </form>
        </main>

        <footer className="text-white/70 text-center text-xs py-4" style={{ backgroundColor: NAVY }}>
          &copy; {new Date().getFullYear()} FLOW Natural Mineral Water. All rights reserved.
        </footer>

      </div>
    </>
  )
}

export default CallReportPage
