import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  strategy: string;
  profit?: number;
  status: 'OPEN' | 'CLOSED';
}

const TradeSchema: Schema = new Schema({
  symbol: { type: String, required: true },
  side: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  strategy: { type: String, required: true },
  profit: { type: Number },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' }
});

export default mongoose.model<ITrade>('Trade', TradeSchema);