import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET() {
  try {
    const userId = await requireUserId()
    const products = await prisma.product.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(products)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()
    const created = await prisma.product.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        hsnCode: body.hsnCode,
        price: body.price,
        taxRate: body.taxRate,
        unit: body.unit,
        category: body.category,
      }
    })
    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error creating product' }, { status: 400 })
  }
}
