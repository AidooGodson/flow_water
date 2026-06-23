import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)

  if (req.method === 'DELETE') {
    try {
      await prisma.callReport.delete({ where: { id } })
      console.log(`[call-reports/${id}] Deleted`)
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(`[call-reports/${id}] Delete error:`, error)
      return res.status(500).json({ error: 'Failed to delete report' })
    }
  }

  if (req.method === 'GET') {
    try {
      const report = await prisma.callReport.findUnique({ where: { id } })
      if (!report) return res.status(404).json({ error: 'Report not found' })
      return res.status(200).json({ success: true, report })
    } catch (error) {
      console.error(`[call-reports/${id}] Fetch error:`, error)
      return res.status(500).json({ error: 'Failed to fetch report' })
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}
