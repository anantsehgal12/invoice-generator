import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET() {
  try {
    const userId = await requireUserId()
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true, additionalCharges: true },
    })
    return NextResponse.json(invoices)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()

    // Validate that the company belongs to this user
    const company = await prisma.company.findFirst({ where: { id: body.companyId, userId } })
    if (!company) {
      return NextResponse.json({ error: 'Invalid company' }, { status: 400 })
    }

    // Validate any referenced products belong to this user
    const itemsArray = Array.isArray(body.items) ? body.items : []
    const productIds = itemsArray.map((it: any) => it.productId).filter((id: string | null | undefined) => !!id)
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({ where: { id: { in: productIds }, userId } })
      const allowed = new Set(products.map((p: any) => p.id))
      for (const it of itemsArray) {
        if (it.productId && !allowed.has(it.productId)) {
          return NextResponse.json({ error: 'Invalid product in items' }, { status: 400 })
        }
      }
    }

    const created = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: body.invoiceNumber,
        companyId: body.companyId,
        billToName: body.billToName,
        billToGst: body.billToGst,
        billToStreet: body.billToStreet,
        billToCity: body.billToCity,
        billToState: body.billToState,
        billToPincode: body.billToPincode,
        billToCountry: body.billToCountry,
        billToMobile: body.billToMobile,
        billToEmail: body.billToEmail,
        invoiceDate: new Date(body.invoiceDate),
        dueDate: new Date(body.dueDate),
        placeOfSupply: body.placeOfSupply,
        subtotal: body.subtotal,
        totalTax: body.totalTax,
        discount: body.discount,
        discountType: body.discountType,
        total: body.total,
        notes: body.notes,
        terms: body.terms,
        status: body.status,
        type: body.type ?? 'invoice',
        items: { create: (body.items || []).map((it: any) => ({
          productId: it.productId || null,
          productName: it.productName,
          description: it.description,
          hsnCode: it.hsnCode,
          quantity: it.quantity,
          unit: it.unit,
          rate: it.rate,
          taxRate: it.taxRate,
          amount: it.amount,
          taxAmount: it.taxAmount,
          totalAmount: it.totalAmount,
        })) },
        additionalCharges: { create: (body.additionalCharges || []).map((ac: any) => ({ name: ac.name, amount: ac.amount })) },
      },
      include: { items: true, payments: true, additionalCharges: true },
    })

    return NextResponse.json(created)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error creating invoice' }, { status: 400 })
  }
}
