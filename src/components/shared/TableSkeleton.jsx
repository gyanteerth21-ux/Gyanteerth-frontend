import React from 'react';

const TableSkeleton = () => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ display: 'flex', padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', gap: '2rem', alignItems: 'center' }}>
        <div style={{ flex: 1.5, display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: '#f1f5f9', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ height: '16px', width: '60%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ height: '12px', width: '40%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}><div style={{ height: '16px', width: '80%', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
        <div style={{ flex: 1 }}><div style={{ height: '24px', width: '100%', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} /></div>
        <div style={{ flex: 0.5, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.85rem', background: '#f1f5f9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      </div>
    ))}
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
  </div>
);

export default TableSkeleton;
