import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { calculateRSI, calculateMACD } from '../utils/indicators';

const Chart = ({ coinId, timeframe, historyLimit, onIndicatorsUpdate }) => {
  const chartContainerRef = useRef();
  const rsiContainerRef = useRef();
  const macdContainerRef = useRef();
  const lastAdviceRef = useRef({ signal: '', reason: '' });
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const symbol = coinId === 'bitcoin' ? 'BTC' : 
                   coinId === 'ripple' ? 'XRP' :
                   coinId === 'dogecoin' ? 'DOGE' :
                   coinId === 'shiba-inu' ? 'SHIB' :
                   coinId === 'terra-luna-2' ? 'LUNC' : coinId.toUpperCase();

    const apiLimit = historyLimit + 50; 
    fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=${apiLimit}&aggregate=${timeframe}`)
      .then(res => res.json())
      .then(json => {
        if (json.Response !== 'Success' || !json.Data || !json.Data.Data) {
           console.error("CryptoCompare error:", json.Message);
           return;
        }
        setData(json.Data.Data.map(d => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    return () => {
      if (chartContainerRef.current) chartContainerRef.current.innerHTML = '';
      if (rsiContainerRef.current) rsiContainerRef.current.innerHTML = '';
      if (macdContainerRef.current) macdContainerRef.current.innerHTML = '';
    };
  }, [coinId, timeframe, historyLimit]);

  useEffect(() => {
    if (data.length > 0 && chartContainerRef.current && !loading) {
      renderCharts(data);
      generateAdvice(data);
    }
  }, [data, loading]);

  const generateAdvice = (data) => {
    if (!data || data.length < 30) return;
    const closes = data.map(d => d.close);
    const rsis = calculateRSI(closes);
    const macds = calculateMACD(closes);
    
    if (!rsis || rsis.length === 0 || !macds || !macds.macdLine) return;
    
    const lastRsi = rsis[rsis.length - 1];
    const lastMacd = macds.macdLine[macds.macdLine.length - 1];
    const lastSignal = macds.signalLine[macds.signalLine.length - 1];
    
    let signal = 'HOLD';
    let reason = `Market is currently neutral. RSI is at ${lastRsi.toFixed(1)}, showing stable momentum.`;

    if (lastRsi < 35 && lastMacd > lastSignal) {
      signal = 'STRONG BUY';
      reason = `Oversold RSI (${lastRsi.toFixed(1)}) and Bullish MACD Crossover confirmed. High probability of upward reversal.`;
    } else if (lastRsi < 45 || lastMacd > lastSignal) {
      signal = 'BUY';
      reason = `Bullish momentum detected. RSI is ${lastRsi.toFixed(1)} and MACD is trending above signal line.`;
    } else if (lastRsi > 75 && lastMacd < lastSignal) {
      signal = 'STRONG SELL';
      reason = `Extreme Overbought RSI (${lastRsi.toFixed(1)}) and Bearish MACD Crossover. Significant downside risk.`;
    } else if (lastRsi > 65 || lastMacd < lastSignal) {
      signal = 'SELL';
      reason = `Bearish divergence detected. RSI is high (${lastRsi.toFixed(1)}) and MACD signal suggests slowing momentum.`;
    }

    // Only update parent if advice changed to prevent infinite loops
    if (lastAdviceRef.current.signal !== signal || lastAdviceRef.current.reason !== reason) {
      lastAdviceRef.current = { signal, reason };
      onIndicatorsUpdate({ signal, reason });
    }
  };

  const renderCharts = (data) => {
    if (!chartContainerRef.current || !rsiContainerRef.current || !macdContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';
    rsiContainerRef.current.innerHTML = '';
    macdContainerRef.current.innerHTML = '';

    const createConfig = (container, height) => ({
      layout: { textColor: '#94a3b8', background: { type: ColorType.Solid, color: 'transparent' } },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      width: container.clientWidth || 800,
      height: height,
      timeScale: { borderColor: 'rgba(255,255,255,0.1)' }
    });

    const mainChart = createChart(chartContainerRef.current, createConfig(chartContainerRef.current, 300));
    const candSeries = mainChart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444'
    });
    candSeries.setData(data);

    const rsiChart = createChart(rsiContainerRef.current, createConfig(rsiContainerRef.current, 100));
    const rsiSeries = rsiChart.addLineSeries({ color: '#3b82f6', lineWidth: 2, lastValueVisible: true });
    const rsiValues = calculateRSI(data.map(d => d.close));
    rsiSeries.setData(rsiValues.map((v, i) => ({ time: data[i].time, value: v })).filter(d => d.value !== null));

    const macdChart = createChart(macdContainerRef.current, createConfig(macdContainerRef.current, 100));
    const macdLine = macdChart.addLineSeries({ color: '#3b82f6', lineWidth: 3, lastValueVisible: true }); // Bolder
    const signalLine = macdChart.addLineSeries({ color: '#f59e0b', lineWidth: 3, lastValueVisible: true }); // Bolder
    const histSeries = macdChart.addHistogramSeries({ lastValueVisible: false });

    const macdResults = calculateMACD(data.map(d => d.close));
    macdLine.setData(macdResults.macdLine.map((v, i) => ({ time: data[i].time, value: v })));
    signalLine.setData(macdResults.signalLine.map((v, i) => ({ time: data[i].time, value: v })));
    histSeries.setData(macdResults.histogram.map((v, i) => ({
      time: data[i].time, value: v, color: v >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
    })));

    // Sync and fit
    const sync = (src, targets) => {
      src.timeScale().subscribeVisibleTimeRangeChange(() => {
        const range = src.timeScale().getVisibleRange();
        targets.forEach(t => t.timeScale().setVisibleRange(range));
      });
    };
    sync(mainChart, [rsiChart, macdChart]);
    
    const visiblePart = data.slice(-historyLimit);
    if (visiblePart.length > 0) {
      mainChart.timeScale().setVisibleRange({ from: visiblePart[0].time, to: visiblePart[visiblePart.length - 1].time });
    }

    // Resize handling
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        mainChart.applyOptions({ width });
        rsiChart.applyOptions({ width });
        macdChart.applyOptions({ width });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => resizeObserver.disconnect();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {loading && <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '100px' }}>Loading real-time analytics...</div>}
      <div ref={chartContainerRef} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>RSI (14)</div>
      <div ref={rsiContainerRef} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>MACD (12, 26, 9)</div>
      <div ref={macdContainerRef} />
    </div>
  );
};

export default Chart;
