import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NAVY = '#1E1B72'
const RED  = '#CC1515'

const links = [
  { label: 'Home',      href: '/' },
  { label: 'Reports',   href: '/reports' },
  { label: 'Dashboard', href: '/dashboard' },
]

export default function Navbar() {
  const { pathname } = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/flow-logo.jpeg"
              alt="FLOW Natural Mineral Water"
              width={300}
              height={72}
              className="object-contain w-40 sm:w-64 md:w-72"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-8 text-sm font-semibold">
            {links.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors pb-0.5"
                  style={{
                    color: active ? '#111827' : '#6B7280',
                    borderBottom: active ? `2px solid ${RED}` : '2px solid transparent',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full left-0">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center px-6 py-4 text-sm font-semibold border-b border-gray-50 transition-colors"
                style={
                  active
                    ? { backgroundColor: NAVY, color: '#fff' }
                    : { color: '#374151' }
                }
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
