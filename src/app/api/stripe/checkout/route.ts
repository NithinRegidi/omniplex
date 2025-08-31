import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const priceIdEnv = process.env.STRIPE_PRICE_ID;
const successUrl = process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/billing/success';
const cancelUrl = process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/billing/cancel';

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe checkout will fail until it is configured.');
}

export async function POST(request: Request) {
  try {
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-08-27.basil' });
    const body = await request.json().catch(() => ({}));
    const { priceId = priceIdEnv } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: e.message || 'Stripe error' }, { status: 500 });
  }
}
