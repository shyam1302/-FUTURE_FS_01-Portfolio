import express from 'express';
import { TradingService } from '../services/tradingService';
import { TradingViewService } from '../services/tradingViewService';

const router = express.Router();
const tradingService = new TradingService();
const tradingViewService = new TradingViewService();

// Get trading status
router.get('/status', async (req, res) => {
  try {
    const performance = await tradingService.getPerformance();
    res.json({
      isActive: true,
      performance,
      lastUpdate: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trading status' });
  }
});

// Get trade history
router.get('/history', async (req, res) => {
  try {
    const trades = await tradingService.getTradeHistory();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trade history' });
  }
});

// Manual trade execution (for testing)
router.post('/trade', async (req, res) => {
  try {
    const { side, quantity, price, strategy } = req.body;

    if (!side || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await tradingService.executeTrade(side, quantity, price, strategy || 'MANUAL');
    res.json({ success: true, message: 'Trade executed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TradingView webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    // Check API key if configured
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    const configuredKey = process.env.TRADINGVIEW_API_KEY;

    if (configuredKey && apiKey !== configuredKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const result = await tradingViewService.processAlert(req.body);

    res.json({
      success: true,
      message: 'Alert processed successfully',
      tradeId: result.tradeId,
      action: result.action
    });
  } catch (error: any) {
    console.error('TradingView webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// TradingView integration status
router.get('/tradingview/status', async (req, res) => {
  try {
    res.json({
      enabled: tradingViewService.isIntegrationEnabled(),
      alertCount: (await tradingViewService.getAlertHistory()).length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle TradingView integration
router.post('/tradingview/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    const result = await tradingViewService.setIntegrationEnabled(enabled);
    res.json({ enabled: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get TradingView alert history
router.get('/tradingview/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await tradingViewService.getAlertHistory(limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;