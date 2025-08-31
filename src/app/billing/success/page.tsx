import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';
import { db } from '@/../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUserDetailsState } from '@/store/authSlice';

// This page runs client-side; for stronger security you would verify the session server-side.

export default function SuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'saved' | 'error'>('verifying');
  const user = useSelector(selectUserDetailsState);

  useEffect(() => {
    const verifyAndSave = async () => {
      try {
        const url = new URL(window.location.href);
        const sessionId = url.searchParams.get('session_id');
        if (!sessionId) {
          setStatus('error');
          return;
        }
        // Simple client acknowledgement (in production add a server route to verify session)
        if (user.uid) {
          await setDoc(doc(db, 'users', user.uid), { plan: 'pro' }, { merge: true });
        }
        setStatus('saved');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };
    verifyAndSave();
  }, [user.uid]);

  return (
    <div style={{ padding: 32 }}>
      {status === 'verifying' && <p>Verifying your payment...</p>}
      {status === 'saved' && <p>Payment successful! Your account is now Pro.</p>}
      {status === 'error' && <p>Could not verify payment. Contact support.</p>}
    </div>
  );
}
