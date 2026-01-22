import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import tradingRoutes from './routes/trading';
import portfolioRoutes from './routes/portfolio';
import { TradingAgent } from './services/tradingAgent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-bot')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/trading', tradingRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Initialize trading agent
const tradingAgent = new TradingAgent();
tradingAgent.start();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});