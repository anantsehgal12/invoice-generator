import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const body = await req.json()
    const existing = await prisma.product.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        hsnCode: body.hsnCode ?? existing.hsnCode,
        price: body.price ?? existing.price,
        taxRate: body.taxRate ?? existing.taxRate,
        unit: body.unit ?? existing.unit,
        category: body.category ?? existing.category,
      }
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating product' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const existing = await prisma.product.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error deleting product' }, { status: 400 })
  }
}
