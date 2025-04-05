
export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  initialPrice: number;
  currentPrice: number;
  previousPrice: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  volume: number;
  priceHistory: PricePoint[];
  volatility: number;
  trend: number;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockIndex {
  id: string;
  name: string;
  ticker: string;
  components: string[]; // stock ids
  currentValue: number;
  previousValue: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  valueHistory: IndexValuePoint[];
}

export interface IndexValuePoint {
  timestamp: number;
  value: number;
}

export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'canceled';

export interface Order {
  id: string;
  userId: string;
  stockId: string;
  ticker: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  limitPrice?: number;
  status: OrderStatus;
  createdAt: number;
  executedAt?: number;
  executedPrice?: number;
}

export interface Position {
  stockId: string;
  ticker: string;
  quantity: number;
  averageCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  totalInvestment: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}

export interface TimeRange {
  label: string;
  value: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}
