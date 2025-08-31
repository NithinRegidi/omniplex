"use client";
import React, { useState } from 'react';

interface UpgradeButtonProps {
  priceId?: string; // optional override
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ priceId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Checkout failed');
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          background: '#6366f1',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        {loading ? 'Redirecting...' : 'Upgrade to Pro ($10)'}
      </button>
      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </div>
  );
};

export default UpgradeButton;
