// Exponential Moving Average
export const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  let emaArr = [data[0]];
  for (let i = 1; i < data.length; i++) {
    emaArr.push(data[i] * k + emaArr[i - 1] * (1 - k));
  }
  return emaArr;
};

// Relative Strength Index (RSI)
export const calculateRSI = (data, period = 14) => {
  let gains = [];
  let losses = [];
  
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  let rsiArr = new Array(period).fill(null);
  
  for (let i = period; i < data.length; i++) {
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiArr.push(rsi);

    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  
  return rsiArr;
};

// Moving Average Convergence Divergence (MACD)
export const calculateMACD = (data, fast = 12, slow = 26, signal = 9) => {
  const fastEMA = calculateEMA(data, fast);
  const slowEMA = calculateEMA(data, slow);
  
  const macdLine = fastEMA.map((f, i) => f - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signal);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);
  
  return { macdLine, signalLine, histogram };
};
