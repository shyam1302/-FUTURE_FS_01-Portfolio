import { TradingService } from './tradingService';

export interface TradingViewAlert {
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  strategy: string;
  timestamp: string;
  message?: string;
  chart?: {
    timeframe: string;
    exchange: string;
  };
}

export interface AlertHistory {
  id: string;
  alert: TradingViewAlert;
  processed: boolean;
  tradeId?: string;
  error?: string;
  timestamp: Date;
}

export class TradingViewService {
  private tradingService: TradingService;
  private isEnabled: boolean = false;
  private alertHistory: AlertHistory[] = [];

  constructor() {
    this.tradingService = new TradingService();
  }

  async processAlert(alertData: any): Promise<{ tradeId: string; action: string }> {
    if (!this.isEnabled) {
      throw new Error('TradingView integration is disabled');
    }

    // Parse and validate alert
    const alert = this.parseAlert(alertData);

    // Create alert history entry
    const alertId = this.generateAlertId();
    const historyEntry: AlertHistory = {
      id: alertId,
      alert,
      processed: false,
      timestamp: new Date()
    };

    this.alertHistory.unshift(historyEntry);

    try {
      // Execute trade based on alert
      const tradeId = await this.executeTradeFromAlert(alert);

      // Update history entry
      historyEntry.processed = true;
      historyEntry.tradeId = tradeId;

      console.log(`TradingView alert processed: ${alert.action} ${alert.symbol} at ${alert.price}`);

      return { tradeId, action: alert.action };
    } catch (error: any) {
      historyEntry.error = error.message;
      throw error;
    }
  }

  private parseAlert(alertData: any): TradingViewAlert {
    // Support multiple TradingView alert formats
    let symbol = alertData.symbol || alertData.ticker || 'BTCUSDT';
    let action = alertData.action || alertData.side || alertData.signal;
    let price = alertData.price || alertData.close || alertData.last_price;
    let strategy = alertData.strategy || alertData.alert_name || 'TRADINGVIEW';
    let timestamp = alertData.timestamp || new Date().toISOString();
    let message = alertData.message || alertData.comment;
    let chart = alertData.chart;

    // Normalize symbol format
    symbol = this.normalizeSymbol(symbol);

    // Normalize action
    action = this.normalizeAction(action);

    // Ensure price is a number
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^0-9.-]/g, ''));
    }

    if (!symbol || !action || !price || isNaN(price)) {
      throw new Error('Invalid alert data: missing or invalid symbol, action, or price');
    }

    return {
      symbol,
      action,
      price,
      strategy,
      timestamp,
      message,
      chart
    };
  }

  private normalizeSymbol(symbol: string): string {
    // Convert various symbol formats to our internal format
    const symbolMap: { [key: string]: string } = {
      'BTCUSD': 'BTC',
      'BTCUSDT': 'BTC',
      'ETHUSD': 'ETH',
      'ETHUSDT': 'ETH',
      'BTC/USD': 'BTC',
      'ETH/USD': 'ETH'
    };

    return symbolMap[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  private normalizeAction(action: string): 'BUY' | 'SELL' {
    const actionStr = action.toUpperCase();

    if (actionStr.includes('BUY') || actionStr.includes('LONG') || actionStr === 'ENTER') {
      return 'BUY';
    } else if (actionStr.includes('SELL') || actionStr.includes('SHORT') || actionStr === 'EXIT') {
      return 'SELL';
    } else {
      throw new Error(`Invalid action: ${action}. Must contain BUY/SELL/LONG/SHORT/ENTER/EXIT`);
    }
  }

  private async executeTradeFromAlert(alert: TradingViewAlert): Promise<string> {
    // Calculate quantity based on risk management
    const quantity = await this.calculatePositionSize(alert);

    // Execute the trade
    await this.tradingService.executeTrade(
      alert.action,
      quantity,
      alert.price,
      `TRADINGVIEW_${alert.strategy}`
    );

    // Generate a trade ID (in a real implementation, this would come from the exchange)
    return `tv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async calculatePositionSize(alert: TradingViewAlert): Promise<number> {
    // Get current portfolio value for risk calculation
    const portfolioValue = await this.tradingService.getPortfolioValue();
    const riskPerTrade = 0.02; // 2% risk per trade
    const stopLossPercent = 0.02; // 2% stop loss

    // Calculate position size based on risk
    const riskAmount = portfolioValue * riskPerTrade;
    const stopLossAmount = alert.price * stopLossPercent;
    const quantity = riskAmount / stopLossAmount;

    // Ensure minimum trade size
    return Math.max(quantity, 0.0001); // Minimum 0.0001 BTC
  }

  async getAlertHistory(limit: number = 50): Promise<AlertHistory[]> {
    return this.alertHistory.slice(0, limit);
  }

  async setIntegrationEnabled(enabled: boolean): Promise<boolean> {
    this.isEnabled = enabled;
    console.log(`TradingView integration ${enabled ? 'enabled' : 'disabled'}`);
    return this.isEnabled;
  }

  isIntegrationEnabled(): boolean {
    return this.isEnabled;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to clear old alert history (keep last 1000 entries)
  clearOldHistory(): void {
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(0, 1000);
    }
  }
}