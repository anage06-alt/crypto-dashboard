import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

const App = () => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('crypto_dashboard_coins');
    return saved ? JSON.parse(saved) : [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ripple', symbol: 'xrp', name: 'XRP' },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
      { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu' },
      { id: 'terra-luna-2', symbol: 'lunc', name: 'Terra Luna Classic' }
    ];
  });

  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [timeframe, setTimeframe] = useState('1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('crypto_dashboard_coins', JSON.stringify(coins));
  }, [coins]);

  return (
    <>
      <Sidebar 
        coins={coins} 
        activeCoin={selectedCoin} 
        onSelect={setSelectedCoin} 
        onAdd={(coin) => setCoins([...coins, coin])}
        onDelete={(id) => setCoins(coins.filter(c => c.id !== id))}
        isOpen={isSidebarOpen}
      />
      <Dashboard 
        coin={selectedCoin} 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};

export default App;
