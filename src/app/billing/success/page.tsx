"use client";
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUserDetailsState } from '@/store/authSlice';

// This page runs client-side; for stronger security you would verify the session server-side.

export default function SuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'saved' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your payment...');
  const user = useSelector(selectUserDetailsState);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    let cancelled = false;
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setMessage('Missing session id.');
      return;
    }
    const controller = new AbortController();
    const verify = async () => {
      try {
        setMessage('Verifying your payment...');
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error('Verification failed');
        }
        const data = await res.json();
        if (data.payment_status === 'paid' || data.status === 'complete') {
          if (user.uid) {
            try { await setDoc(doc(db, 'users', user.uid), { plan: 'pro' }, { merge: true }); } catch {}
          }
          if (!cancelled) {
            setStatus('saved');
            setMessage('Payment successful! Your account is now Pro.');
          }
        } else {
          if (!cancelled) {
            setStatus('error');
            setMessage('Payment not completed.');
          }
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setMessage('Could not verify payment.');
        }
      }
    };
    verify();
    const timeout = setTimeout(() => {
      if (statusRef.current === 'verifying') {
        setStatus('error');
        setMessage('Timeout verifying payment.');
      }
    }, 15000);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [user.uid]);

  return (
    <div style={{ padding: 32 }}>
      <p>{message}</p>
      {status === 'saved' && (
        <a href="/" style={{ color: '#6366f1', textDecoration: 'underline' }}>Go back</a>
      )}
      {status === 'error' && (
        <div style={{ marginTop: 12 }}>
          <a href="/" style={{ color: '#ef4444', textDecoration: 'underline' }}>Return home</a>
        </div>
      )}
    </div>
  );
}
