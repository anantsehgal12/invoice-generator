import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'
import { getDefaultSettings } from '@/utils/storage'

export async function GET() {
  try {
    const userId = await requireUserId()
    let settings = await prisma.settings.findUnique({ where: { userId } })
    if (!settings) {
      const data = getDefaultSettings()
      settings = await prisma.settings.create({ data: { userId, data } })
    }
    return NextResponse.json(settings.data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()

    const existing = await prisma.settings.findUnique({ where: { userId } })
    const current = existing?.data || getDefaultSettings()

    // Deep merge simple (shallow across top-level keys is okay given shape)
    const merged = {
      ...current,
      ...body,
      general: { ...current.general, ...(body.general || {}) },
      invoice: { ...current.invoice, ...(body.invoice || {}) },
      tax: { ...current.tax, ...(body.tax || {}) },
      backup: { ...current.backup, ...(body.backup || {}) },
    }

    const saved = await prisma.settings.upsert({
      where: { userId },
      update: { data: merged },
      create: { userId, data: merged },
    })
    return NextResponse.json(saved.data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating settings' }, { status: 400 })
  }
}
