import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, Search, X } from 'lucide-react';

const Sidebar = ({ coins, activeCoin, onSelect, onAdd, onDelete, isOpen }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    // Basic search simulation - in a real app this would call CoinGecko search API
    setIsAdding(!isAdding);
  };

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px' }}>
          <TrendingUp size={24} color="white" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>CryptoPulse</h1>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Your Portfolio</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {coins.map((coin) => (
            <div 
              key={coin.id}
              onClick={() => onSelect(coin)}
              className="glass-card"
              style={{ 
                padding: '12px 16px', 
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                background: activeCoin.id === coin.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                borderColor: activeCoin.id === coin.id ? 'var(--accent-primary)' : 'var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '12px' }}>
                  {coin.symbol.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>{coin.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{coin.symbol.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(coin.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                className="hover-danger"
              >
                <X size={14} color="var(--text-secondary)" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleAdd}
        className="glass-card"
        style={{ 
          marginTop: 'auto', 
          padding: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px',
          cursor: 'pointer',
          width: '100%',
          color: 'var(--text-primary)',
          fontWeight: '600',
          background: 'rgba(255,255,255,0.05)'
        }}
      >
        <Plus size={18} /> Add Coin
      </button>

      {isAdding && (
        <div style={{ marginTop: '16px' }} className="animate-fade-in">
           <input 
            type="text" 
            placeholder="Search coin (e.g. solana)..." 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#1a1f26', color: 'white', fontSize: '13px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.target.value.toLowerCase();
                onAdd({ id: val, symbol: val.slice(0,3), name: val.charAt(0).toUpperCase() + val.slice(1) });
                setIsAdding(false);
                e.target.value = '';
              }
            }}
           />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
