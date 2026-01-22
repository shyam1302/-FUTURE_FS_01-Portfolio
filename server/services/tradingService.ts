import Trade, { ITrade } from '../models/Trade';

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
}

export class TradingService {
  async executeTrade(side: 'BUY' | 'SELL', quantity: number, price: number, strategy: string): Promise<void> {
    const trade = new Trade({
      symbol: 'BTC',
      side,
      quantity,
      price,
      strategy,
      status: 'CLOSED'
    });

    await trade.save();
  }

  async getPortfolio(): Promise<PortfolioItem[]> {
    try {
      // Get all closed trades
      const trades = await Trade.find({ status: 'CLOSED' }).sort({ timestamp: -1 });

      // Calculate current positions
      const positions = new Map<string, { quantity: number; totalCost: number; trades: number }>();

      for (const trade of trades) {
        const symbol = trade.symbol;
        const current = positions.get(symbol) || { quantity: 0, totalCost: 0, trades: 0 };

        if (trade.side === 'BUY') {
          current.quantity += trade.quantity;
          current.totalCost += trade.quantity * trade.price;
        } else {
          current.quantity -= trade.quantity;
          current.totalCost -= trade.quantity * trade.price;
        }

        current.trades += 1;
        positions.set(symbol, current);
      }

      // Convert to portfolio items with current prices (simplified)
      const portfolio: PortfolioItem[] = [];
      for (const [symbol, position] of positions) {
        if (position.quantity > 0) {
          const avgPrice = position.totalCost / position.trades; // Simplified calculation
          const currentPrice = await this.getCurrentPrice(symbol);
          const value = position.quantity * currentPrice;
          const pnl = value - position.totalCost;

          portfolio.push({
            symbol,
            quantity: position.quantity,
            avgPrice,
            currentPrice,
            value,
            pnl
          });
        }
      }

      return portfolio;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return [];
    }
  }

  async getPortfolioValue(): Promise<number> {
    const portfolio = await this.getPortfolio();
    return portfolio.reduce((total, item) => total + item.value, 0);
  }

  async getTradeHistory(): Promise<ITrade[]> {
    return await Trade.find().sort({ timestamp: -1 }).limit(50);
  }

  async getPerformance(): Promise<PerformanceMetrics> {
    const trades = await Trade.find({ status: 'CLOSED' });

    let winningTrades = 0;
    let losingTrades = 0;
    let totalPnL = 0;
    let maxDrawdown = 0;
    let peak = 0;
    let currentDrawdown = 0;

    // Simplified performance calculation
    for (const trade of trades) {
      if (trade.profit !== undefined) {
        totalPnL += trade.profit;
        if (trade.profit > 0) {
          winningTrades++;
        } else {
          losingTrades++;
        }

        // Calculate drawdown
        const currentValue = peak + trade.profit;
        if (currentValue > peak) {
          peak = currentValue;
          currentDrawdown = 0;
        } else {
          currentDrawdown = peak - currentValue;
          maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
        }
      }
    }

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL,
      maxDrawdown
    };
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    // Simplified - in real implementation, fetch from exchange API
    // For demo purposes, return a mock price
    const mockPrices: { [key: string]: number } = {
      'BTC': 45000,
      'ETH': 3000
    };

    return mockPrices[symbol] || 1;
  }
}