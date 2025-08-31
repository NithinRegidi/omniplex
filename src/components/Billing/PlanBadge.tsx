"use client";
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserDetailsState } from '@/store/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';

export const PlanBadge: React.FC = () => {
  const user = useSelector(selectUserDetailsState);
  const [plan, setPlan] = React.useState<string>('');

  React.useEffect(() => {
    const load = async () => {
      if (!user.uid) return;
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const p = snap.get('plan');
        if (p) setPlan(p);
      } catch (e) {
        // silent
      }
    };
    load();
  }, [user.uid]);

  if (!user.uid) return null;
  return (
    <div style={{
      display: 'inline-block',
      background: plan === 'pro' ? '#16a34a' : '#374151',
      color: '#fff',
      fontSize: 12,
      padding: '2px 8px',
      borderRadius: 12,
      marginLeft: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}>
      {plan || 'free'}
    </div>
  );
};

export default PlanBadge;
