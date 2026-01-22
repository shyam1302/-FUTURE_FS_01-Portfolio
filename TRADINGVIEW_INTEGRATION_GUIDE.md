# TradingView Chart Integration Guide

## Overview
This guide shows you how to connect your TradingView charts to your AI trading bot. The bot can now receive trading signals directly from your TradingView alerts and execute trades automatically.

## Features
- **Real-time Alerts**: Receive TradingView alerts via webhook
- **Multiple Strategies**: Support for various TradingView strategies
- **Risk Management**: Automatic position sizing and risk controls
- **Alert History**: Track all incoming alerts and their execution
- **Security**: API key authentication for webhook security

## Setup Instructions

### 1. Enable TradingView Integration

First, enable the TradingView integration on your bot:

```bash
# Start your server
npm start

# Enable TradingView integration via API
curl -X POST http://localhost:5000/api/trading/tradingview/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### 2. Set API Key (Optional but Recommended)

Add an API key to your `.env` file for webhook security:

```env
TRADINGVIEW_API_KEY=your_secure_api_key_here
```

### 3. Configure TradingView Alert

#### Step 1: Create Alert in TradingView
1. Open TradingView and go to your BTC/USD chart
2. Click the "Alert" button (bell icon) in the top toolbar
3. Set your alert conditions (e.g., price crosses SMA, RSI conditions)

#### Step 2: Configure Webhook URL
In the alert settings:
- **Message**: Choose "Webhook URL"
- **Webhook URL**: `http://your-server-url:5000/api/trading/webhook`
- **Method**: POST
- **Headers** (if using API key):
  ```
  Content-Type: application/json
  X-API-Key: your_secure_api_key_here
  ```

#### Step 3: Alert Message Format
Use one of these formats in the alert message:

**Simple Format:**
```
BUY BTCUSDT at {{close}} - My Strategy
```

**Detailed Format:**
```json
{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": {{close}},
  "strategy": "SMA_Crossover",
  "timestamp": "{{time}}",
  "message": "SMA 20 crossed above SMA 50"
}
```

## Supported Alert Formats

### Text-Based Alerts
The bot can parse natural language alerts:
- `BUY BTCUSD at 45000 - RSI Strategy`
- `SELL BTC/USDT at market - MACD Signal`
- `ENTER LONG BTCUSDT - Custom Indicator`

### JSON Alerts (Recommended)
For more precise control, use JSON format:
```json
{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": 45000.50,
  "strategy": "RSI_Divergence",
  "timestamp": "2024-01-22T10:30:00Z",
  "message": "Bullish RSI divergence detected",
  "chart": {
    "timeframe": "1H",
    "exchange": "Binance"
  }
}
```

## Action Keywords
The bot recognizes these action keywords:
- **BUY/LONG/ENTER**: Buy signals
- **SELL/SHORT/EXIT**: Sell signals

## Symbol Support
Currently supported symbols:
- `BTCUSDT` → BTC
- `BTCUSD` → BTC
- `ETHUSDT` → ETH
- `ETHUSD` → ETH

## Risk Management
The bot automatically applies risk management:
- **Risk per Trade**: 2% of portfolio value
- **Stop Loss**: 2% below entry price
- **Position Sizing**: Calculated based on risk parameters
- **Minimum Trade**: 0.0001 BTC

## API Endpoints

### Check Integration Status
```bash
GET /api/trading/tradingview/status
```

### Toggle Integration
```bash
POST /api/trading/tradingview/toggle
Content-Type: application/json

{
  "enabled": true
}
```

### Get Alert History
```bash
GET /api/trading/tradingview/history?limit=50
```

### Manual Webhook Test
```bash
POST /api/trading/webhook
X-API-Key: your_api_key
Content-Type: application/json

{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": 45000,
  "strategy": "Test_Alert"
}
```

## Testing Your Setup

### 1. Test Webhook
Use curl to test your webhook:

```bash
curl -X POST http://localhost:5000/api/trading/webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "symbol": "BTCUSDT",
    "action": "BUY",
    "price": 45000,
    "strategy": "Test_Alert"
  }'
```

### 2. Check Alert History
```bash
curl http://localhost:5000/api/trading/tradingview/history
```

### 3. Monitor Logs
Check your server logs for alert processing:
```bash
tail -f logs/trading.log
```

## Troubleshooting

### Common Issues

**1. Webhook Not Receiving Alerts**
- Check if the bot is running and integration is enabled
- Verify the webhook URL is correct
- Ensure API key matches (if used)

**2. Invalid Alert Format**
- Use supported action keywords (BUY/SELL/LONG/SHORT)
- Ensure price is a valid number
- Check symbol format

**3. Authentication Failed**
- Verify API key in headers matches `.env` file
- Check header format: `X-API-Key: your_key`

**4. Trades Not Executing**
- Ensure sufficient balance for the trade
- Check risk management limits
- Verify exchange API keys are configured

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=tradingview:*
```

## Advanced Configuration

### Custom Risk Parameters
Modify risk settings in `tradingViewService.ts`:
```typescript
const riskPerTrade = 0.02; // 2% risk per trade
const stopLossPercent = 0.02; // 2% stop loss
```

### Custom Symbol Mapping
Add more symbols in the `normalizeSymbol` method:
```typescript
const symbolMap: { [key: string]: string } = {
  'BTCUSD': 'BTC',
  'BTCUSDT': 'BTC',
  'ADAUSDT': 'ADA', // Add new symbols here
};
```

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS for webhook URLs in production
2. **API Keys**: Use strong, unique API keys
3. **IP Whitelisting**: Consider restricting webhook access to TradingView IPs
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Alert Validation**: Always validate incoming alert data

## Example TradingView Strategies

### RSI Strategy
**Alert Condition**: RSI(14) crosses below 30
**Message**:
```json
{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": {{close}},
  "strategy": "RSI_Oversold",
  "message": "RSI oversold signal"
}
```

### MACD Strategy
**Alert Condition**: MACD line crosses above signal line
**Message**:
```json
{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": {{close}},
  "strategy": "MACD_Crossover",
  "message": "Bullish MACD crossover"
}
```

### Moving Average Crossover
**Alert Condition**: EMA(9) crosses above EMA(21)
**Message**:
```json
{
  "symbol": "BTCUSDT",
  "action": "BUY",
  "price": {{close}},
  "strategy": "EMA_Crossover",
  "message": "EMA crossover bullish signal"
}
```

## Monitoring & Maintenance

### Regular Checks
1. **Alert History**: Review processed alerts regularly
2. **Trade Execution**: Verify trades are executing as expected
3. **Error Logs**: Monitor for webhook processing errors
4. **Performance**: Track strategy performance over time

### Maintenance Tasks
- Clear old alert history periodically
- Update API keys regularly
- Monitor server resources during high alert volume
- Backup trade and alert data

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Test webhook manually with curl
3. Verify TradingView alert configuration
4. Ensure bot has sufficient balance and permissions

The integration is now ready to receive signals from your TradingView charts! 🎯📊