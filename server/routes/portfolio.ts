import express from 'express';
import { TradingService } from '../services/tradingService';

const router = express.Router();
const tradingService = new TradingService();

// Get current portfolio
router.get('/', async (req, res) => {
  try {
    const portfolio = await tradingService.getPortfolio();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Get portfolio value
router.get('/value', async (req, res) => {
  try {
    const value = await tradingService.getPortfolioValue();
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolio value' });
  }
});

export default router;