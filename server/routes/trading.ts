import express from 'express';
import { TradingService } from '../services/tradingService';

const router = express.Router();
const tradingService = new TradingService();

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

export default router;