import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export async function GET(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-08-27.basil' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: (session as any).payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (e: any) {
    console.error('Stripe verify error', e);
    return NextResponse.json({ error: e.message || 'Verify error' }, { status: 500 });
  }
}
