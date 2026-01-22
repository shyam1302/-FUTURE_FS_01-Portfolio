import axios from 'axios';
import { TradingService } from './tradingService';
import { TechnicalIndicators } from '../utils/technicalIndicators';

export class TradingAgent {
  private tradingService: TradingService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private priceHistory: number[] = [];
  private readonly SYMBOL = 'BTCUSDT';
  private readonly INTERVAL = 60000; // 1 minute

  constructor() {
    this.tradingService = new TradingService();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Trading agent started');

    // Initialize price history
    await this.initializePriceHistory();

    // Start trading loop
    this.intervalId = setInterval(async () => {
      try {
        await this.executeTradingCycle();
      } catch (error) {
        console.error('Error in trading cycle:', error);
      }
    }, this.INTERVAL);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Trading agent stopped');
  }

  private async initializePriceHistory(): Promise<void> {
    try {
      // Get recent price data from Binance API
      const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${this.SYMBOL}&interval=1m&limit=100`);
      this.priceHistory = response.data.map((candle: any[]) => parseFloat(candle[4])); // Close prices
    } catch (error) {
      console.error('Error initializing price history:', error);
      // Fallback to simulated data
      this.priceHistory = Array.from({ length: 100 }, () => 50000 + Math.random() * 10000);
    }
  }

  private async executeTradingCycle(): Promise<void> {
    try {
      // Get current price
      const currentPrice = await this.getCurrentPrice();
      this.priceHistory.push(currentPrice);

      // Keep only last 100 prices
      if (this.priceHistory.length > 100) {
        this.priceHistory.shift();
      }

      // Calculate indicators
      const sma20 = TechnicalIndicators.sma(this.priceHistory, 20);
      const sma50 = TechnicalIndicators.sma(this.priceHistory, 50);
      const rsi = TechnicalIndicators.rsi(this.priceHistory, 14);

      // Trading logic
      await this.evaluateTradeSignal(currentPrice, sma20, sma50, rsi);

    } catch (error) {
      console.error('Error in trading cycle:', error);
    }
  }

  private async getCurrentPrice(): Promise<number> {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${this.SYMBOL}`);
      return parseFloat(response.data.price);
    } catch (error) {
      // Fallback to last known price or simulated price
      return this.priceHistory[this.priceHistory.length - 1] || 50000;
    }
  }

  private async evaluateTradeSignal(currentPrice: number, sma20: number, sma50: number, rsi: number): Promise<void> {
    const portfolio = await this.tradingService.getPortfolio();

    // Simple strategy: Buy when SMA20 crosses above SMA50 and RSI < 70, Sell when opposite
    const hasPosition = portfolio.some(p => p.symbol === 'BTC' && p.quantity > 0);

    if (!hasPosition && sma20 > sma50 && rsi < 70) {
      // Buy signal
      await this.tradingService.executeTrade('BUY', 0.001, currentPrice, 'SMA_CROSSOVER');
      console.log(`BUY signal executed at ${currentPrice}`);
    } else if (hasPosition && sma20 < sma50 && rsi > 30) {
      // Sell signal
      const position = portfolio.find(p => p.symbol === 'BTC');
      if (position) {
        await this.tradingService.executeTrade('SELL', position.quantity, currentPrice, 'SMA_CROSSOVER');
        console.log(`SELL signal executed at ${currentPrice}`);
      }
    }
  }
}