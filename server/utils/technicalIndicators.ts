export class TechnicalIndicators {
  static sma(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;

    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  static rsi(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    let avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static ema(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  static macd(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.ema(prices, 12);
    const ema26 = this.ema(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.ema(prices.slice(-9), 9); // Simplified signal calculation
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }
}