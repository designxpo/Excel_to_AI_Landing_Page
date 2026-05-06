import { NextResponse } from 'next/server';
import { addRegistration, getRegistrations } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getRegistrations());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReg = addRegistration({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      status: body.status,
      city: body.city
    });
    return NextResponse.json({ success: true, registration: newReg });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to register' }, { status: 500 });
  }
}
