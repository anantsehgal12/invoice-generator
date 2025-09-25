import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET() {
  try {
    const userId = await requireUserId()
    const companies = await prisma.company.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(companies)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json()
    const created = await prisma.company.create({
      data: {
        userId,
        name: body.name,
        logo: body.logo,
        gst: body.gst,
        pan: body.pan,
        street: body.street,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        country: body.country,
        mobile: body.mobile,
        email: body.email,
        website: body.website,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        accountHolderName: body.accountHolderName,
      },
    })
    return NextResponse.json(created)
  } catch (e: any) {
    const message = e?.message || 'Error creating company'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
