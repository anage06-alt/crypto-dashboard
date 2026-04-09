import React, { useState, useEffect } from 'react';
import { Clock, Info, Newspaper, BrainCircuit, Activity } from 'lucide-react';
import Chart from './Chart';

const Dashboard = ({ coin, timeframe, setTimeframe, isSidebarOpen, setIsSidebarOpen }) => {
  const [marketData, setMarketData] = useState(null);
  const [fngData, setFngData] = useState(null);
  const [news, setNews] = useState([]);
  const [advice, setAdvice] = useState({ signal: 'HOLD', reason: 'Analyzing market data...', context: '' });
  const [historyLimit, setHistoryLimit] = useState(30);
  const [isNewsOpen, setIsNewsOpen] = useState(true);

  const timeframes = [
    { label: '1D Candle', val: '1' },
    { label: '3D Candle', val: '3' },
    { label: '1W Candle', val: '7' },
    { label: '2W Candle', val: '14' },
    { label: '1M Candle', val: '30' }
  ];

  const limits = [30, 90, 120];

  useEffect(() => {
    // Fetch Fear & Greed Index
    fetch('https://api.alternative.me/fng/')
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data[0]) {
          setFngData(data.data[0]);
        }
      })
      .catch(err => console.error("FNG Fetch Error:", err));

    const symbol = coin.symbol.toUpperCase();
    // Fetch from CoinTelegraph RSS via Vite proxy
    fetch('/cointelegraph-rss/rss')
      .then(res => res.text())
      .then(xmlString => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "text/xml");
        const items = Array.from(xml.querySelectorAll("item"));
        
        const parsedNews = items.map(item => ({
          title: item.querySelector("title")?.textContent,
          url: item.querySelector("link")?.textContent,
          published_on: new Date(item.querySelector("pubDate")?.textContent).getTime() / 1000,
          description: item.querySelector("description")?.textContent
        }));

        // Filter news by coin symbol or name in title/description
        const filtered = parsedNews.filter(n => 
          n.title.toUpperCase().includes(symbol) || 
          n.title.toUpperCase().includes(coin.name.toUpperCase()) ||
          n.description.toUpperCase().includes(symbol)
        );

        const finalNews = filtered.length > 0 ? filtered.slice(0, 5) : parsedNews.slice(0, 5);
        setNews(finalNews);

        // EXTRA: Fundamental Analysis Scan
        const fundamentalKeywords = [
          { key: 'FED', label: 'Federal Reserve Monetary Policy' },
          { key: 'SEC', label: 'SEC Regulatory Scrutiny' },
          { key: 'ETF', label: 'Spot ETF Inflows/Outflows' },
          { key: 'INFLATION', label: 'Macroeconomic Inflation Data' },
          { key: 'LAWSUIT', label: 'Ongoing Legal Proceedings' },
          { key: 'ELECTION', label: 'Political Election Volatility' }
        ];

        let context = "";
        const allText = finalNews.map(n => n.title + " " + n.description).join(" ").toUpperCase();
        
        fundamentalKeywords.forEach(fund => {
          if (allText.includes(fund.key)) {
            context += `Significant market focus detected on ${fund.label}. `;
          }
        });

        if (context) {
          setAdvice(prev => ({ ...prev, context: context.trim() }));
        } else {
          setAdvice(prev => ({ ...prev, context: 'No major macroeconomic or political triggers detected in latest news.' }));
        }
      })
      .catch(err => console.error("News RSS Fetch Error:", err));
  }, [coin]);

  return (
    <div className="main-content">
      {/* Header / Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="glass-card"
            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Clock size={20} style={{ transform: isSidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          </button>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700' }}>{coin.name} <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '20px' }}>({coin.symbol.toUpperCase()})</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Real-time market analysis and technical indicators.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '4px' }}>
            {limits.map((l) => (
              <button
                key={l}
                onClick={() => setHistoryLimit(l)}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: historyLimit === l ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: historyLimit === l ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '11px',
                  transition: 'all 0.2s ease'
                }}
              >
                {l} Candles
              </button>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '4px' }}>
            {timeframes.map((tf) => (
              <button
                key={tf.val}
                onClick={() => setTimeframe(tf.val)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: timeframe === tf.val ? 'var(--accent-primary)' : 'transparent',
                  color: timeframe === tf.val ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsNewsOpen(!isNewsOpen)}
            className="glass-card"
            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', background: isNewsOpen ? 'transparent' : 'var(--accent-primary)' }}
            title={isNewsOpen ? "Hide News" : "Show News"}
          >
            <Newspaper size={20} />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isNewsOpen ? 'minmax(0, 2fr) minmax(300px, 1fr)' : '1fr', gap: '24px' }}>
        
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', minHeight: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: '600' }}>Price Chart / Technicals</span>
              </div>
            </div>
            <Chart coinId={coin.id} timeframe={timeframe} historyLimit={historyLimit} onIndicatorsUpdate={setAdvice} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
             {/* Fear & Greed Index */}
             <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Info size={18} color="var(--accent-warning)" />
                  <span style={{ fontWeight: '600' }}>Market Sentiment</span>
                </div>
                {fngData && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: parseInt(fngData.value) > 50 ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
                      {fngData.value}
                    </div>
                    <div style={{ textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', fontSize: '14px', marginTop: '4px' }}>
                      {fngData.value_classification}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Fear & Greed Index</p>
                  </div>
                )}
             </div>

             {/* AI Signal */}
             <div className="glass-card" style={{ padding: '24px', border: advice.signal === 'BUY' ? '1px solid var(--accent-secondary)' : advice.signal === 'SELL' ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BrainCircuit size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: '600' }}>AI Signal Board</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      background: advice.signal === 'BUY' ? 'rgba(16, 185, 129, 0.1)' : advice.signal === 'SELL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: advice.signal === 'BUY' ? 'var(--accent-secondary)' : advice.signal === 'SELL' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                      fontWeight: '700',
                      fontSize: '12px',
                      marginBottom: '8px'
                    }}>
                      ACTION: {advice.signal}
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)', fontWeight: '600' }}>{advice.reason}</p>
                    
                    {advice.context && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Market Context (Fundamental)</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{advice.context}</p>
                      </div>
                    )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: News */}
        <div className={`glass-card news-panel ${!isNewsOpen ? 'collapsed' : ''}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: '600' }}>Latest {coin.name} News</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {news.map((item, idx) => (
              <div key={idx} style={{ borderBottom: idx !== news.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '16px' }}>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }} className="hover-primary">{item.title}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(item.published_on * 1000).toLocaleDateString()}</p>
                </a>
              </div>
            ))}
            {news.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No recent news found for this coin.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
