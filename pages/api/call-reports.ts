import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

const VALID_PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'] as const
const VALID_BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'] as const

type Product = (typeof VALID_PRODUCTS)[number]
type BuyerType = (typeof VALID_BUYER_TYPES)[number]

interface CreateReportBody {
  date: string
  customerName: string
  telephone: string
  location?: string
  product: Product
  buyerType: BuyerType
  comments?: string
  summary?: string
  followUpDate?: string
  followedUpBy: string
  createdBy?: string
}

interface SuccessResponse {
  success: true
  reportId: string
}

interface ErrorResponse {
  error: string
  field?: string
}

function isValidDate(value: string): boolean {
  const d = new Date(value)
  return !isNaN(d.getTime())
}

function validateBody(body: Partial<CreateReportBody>): ErrorResponse | null {
  const required: Array<keyof CreateReportBody> = [
    'date',
    'customerName',
    'telephone',
    'product',
    'buyerType',
    'followedUpBy',
  ]

  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return { error: `Missing required field: ${field}`, field }
    }
  }

  if (!isValidDate(body.date!)) {
    return { error: 'Invalid date format', field: 'date' }
  }

  if (body.followUpDate && !isValidDate(body.followUpDate)) {
    return { error: 'Invalid followUpDate format', field: 'followUpDate' }
  }

  if (!VALID_PRODUCTS.includes(body.product as Product)) {
    return {
      error: `Invalid product. Must be one of: ${VALID_PRODUCTS.join(', ')}`,
      field: 'product',
    }
  }

  if (!VALID_BUYER_TYPES.includes(body.buyerType as BuyerType)) {
    return {
      error: `Invalid buyerType. Must be one of: ${VALID_BUYER_TYPES.join(', ')}`,
      field: 'buyerType',
    }
  }

  return null
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  const body = req.body as Partial<CreateReportBody>

  const validationError = validateBody(body)
  if (validationError) {
    return res.status(400).json(validationError)
  }

  const {
    date,
    customerName,
    telephone,
    location,
    product,
    buyerType,
    comments,
    summary,
    followUpDate,
    followedUpBy,
    createdBy,
  } = body as CreateReportBody

  try {
    const report = await prisma.callReport.create({
      data: {
        date: new Date(date),
        customerName: customerName.trim(),
        telephone: telephone.trim(),
        location: location?.trim() || null,
        product,
        buyerType,
        comments: comments?.trim() || null,
        summary: summary?.trim() || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followedUpBy: followedUpBy.trim(),
        createdBy: (createdBy ?? followedUpBy).trim(),
        status: 'New',
      },
    })

    console.log(`[call-reports] Saved report ${report.id} for "${report.customerName}"`)
    return res.status(201).json({ success: true, reportId: report.id })
  } catch (error) {
    console.error('[call-reports] Database error on create:', error)
    return res.status(500).json({ error: 'Failed to save report. Please try again.' })
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const reports = await prisma.callReport.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        customerName: true,
        telephone: true,
        location: true,
        product: true,
        buyerType: true,
        comments: true,
        summary: true,
        followUpDate: true,
        followedUpBy: true,
        status: true,
        createdAt: true,
        createdBy: true,
      },
    })

    console.log(`[call-reports] GET returned ${reports.length} records`)
    return res.status(200).json({ success: true, reports })
  } catch (error) {
    console.error('[call-reports] Database error on fetch:', error)
    return res.status(500).json({ error: 'Failed to fetch reports. Please try again.' })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return handlePost(req, res)
  if (req.method === 'GET') return handleGet(req, res)
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}
