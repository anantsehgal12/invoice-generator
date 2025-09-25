import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const body = await _req.json()
    const existing = await prisma.company.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await prisma.company.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        logo: body.logo ?? existing.logo,
        gst: body.gst ?? existing.gst,
        pan: body.pan ?? existing.pan,
        street: body.street ?? existing.street,
        city: body.city ?? existing.city,
        state: body.state ?? existing.state,
        pincode: body.pincode ?? existing.pincode,
        country: body.country ?? existing.country,
        mobile: body.mobile ?? existing.mobile,
        email: body.email ?? existing.email,
        website: body.website ?? existing.website,
        bankName: body.bankName ?? existing.bankName,
        accountNumber: body.accountNumber ?? existing.accountNumber,
        ifscCode: body.ifscCode ?? existing.ifscCode,
        accountHolderName: body.accountHolderName ?? existing.accountHolderName,
      }
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating company' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const existing = await prisma.company.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.company.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error deleting company' }, { status: 400 })
  }
}
