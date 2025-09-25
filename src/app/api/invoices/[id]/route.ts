import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.invoice.findFirst({ where: { id, userId }, include: { payments: true, additionalCharges: true } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If companyId is being changed, validate it belongs to the same user
    if (body.companyId && body.companyId !== existing.companyId) {
      const company = await prisma.company.findFirst({ where: { id: body.companyId, userId } })
      if (!company) return NextResponse.json({ error: 'Invalid company' }, { status: 400 })
    }

    // Update simple scalar fields
    const data: any = {
      invoiceNumber: body.invoiceNumber ?? existing.invoiceNumber,
      companyId: body.companyId ?? existing.companyId,
      billToName: body.billToName ?? existing.billToName,
      billToGst: body.billToGst ?? existing.billToGst,
      billToStreet: body.billToStreet ?? existing.billToStreet,
      billToCity: body.billToCity ?? existing.billToCity,
      billToState: body.billToState ?? existing.billToState,
      billToPincode: body.billToPincode ?? existing.billToPincode,
      billToCountry: body.billToCountry ?? existing.billToCountry,
      billToMobile: body.billToMobile ?? existing.billToMobile,
      billToEmail: body.billToEmail ?? existing.billToEmail,
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : existing.invoiceDate,
      dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      placeOfSupply: body.placeOfSupply ?? existing.placeOfSupply,
      subtotal: body.subtotal ?? existing.subtotal,
      totalTax: body.totalTax ?? existing.totalTax,
      discount: body.discount ?? existing.discount,
      discountType: body.discountType ?? existing.discountType,
      total: body.total ?? existing.total,
      notes: body.notes ?? existing.notes,
      terms: body.terms ?? existing.terms,
      status: body.status ?? existing.status,
      amountPaid: body.amountPaid ?? existing.amountPaid,
      type: body.type ?? existing.type,
    }

    // Update payments if provided (replace all)
    if (Array.isArray(body.payments)) {
      await prisma.payment.deleteMany({ where: { invoiceId: id } })
      await prisma.payment.createMany({ data: body.payments.map((p: any) => ({ invoiceId: id, amount: p.amount, date: new Date(p.date), method: p.method, note: p.note })) })
    }

    // Update additional charges if provided (replace all)
    if (Array.isArray(body.additionalCharges)) {
      await prisma.additionalCharge.deleteMany({ where: { invoiceId: id } })
      await prisma.additionalCharge.createMany({ data: body.additionalCharges.map((ac: any) => ({ invoiceId: id, name: ac.name, amount: ac.amount })) })
    }

    const updated = await prisma.invoice.update({ where: { id }, data, include: { items: true, payments: true, additionalCharges: true } })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating invoice' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const existing = await prisma.invoice.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error deleting invoice' }, { status: 400 })
  }
}
