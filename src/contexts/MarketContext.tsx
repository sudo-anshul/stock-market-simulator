
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Stock, StockIndex, Order, Portfolio, TimeRange } from '@/types/market';
import { generateMarketData, updateStockPrices, updateIndices } from '@/utils/marketData';
import { createInitialPortfolio, updatePortfolioPositions, checkLimitOrders, executeMarketOrder, createOrder } from '@/utils/trading';
import { toast } from 'sonner';

interface MarketContextType {
  stocks: Stock[];
  indices: StockIndex[];
  orders: Order[];
  portfolio: Portfolio;
  selectedTimeRange: TimeRange;
  isMarketLoading: boolean;
  placeLimitOrder: (stockId: string, side: 'buy' | 'sell', quantity: number, limitPrice: number) => void;
  placeMarketOrder: (stockId: string, side: 'buy' | 'sell', quantity: number) => void;
  cancelOrder: (orderId: string) => void;
  getStockById: (id: string) => Stock | undefined;
  getStockByTicker: (ticker: string) => Stock | undefined;
  setSelectedTimeRange: (range: TimeRange) => void;
}

const timeRanges: TimeRange[] = [
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '1 Year', value: '1Y' },
  { label: 'All', value: 'ALL' }
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<StockIndex[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>(createInitialPortfolio());
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[0]);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  
  // Initialize market data
  useEffect(() => {
    const initializeMarket = async () => {
      setIsMarketLoading(true);
      
      try {
        // Generate initial market data
        const { stocks: initialStocks, indices: initialIndices } = generateMarketData();
        setStocks(initialStocks);
        setIndices(initialIndices);
        
        // Initialize portfolio
        const initialPortfolio = createInitialPortfolio();
        setPortfolio(initialPortfolio);
        
        // Initialize empty orders array
        setOrders([]);
        
        // Set default time range
        setSelectedTimeRange(timeRanges[0]);
      } catch (error) {
        console.error("Error initializing market data:", error);
        toast.error("Failed to initialize market data");
      } finally {
        setIsMarketLoading(false);
      }
    };
    
    initializeMarket();
  }, []);
  
  // Update market prices periodically
  useEffect(() => {
    if (stocks.length === 0 || indices.length === 0) return;
    
    const updateInterval = setInterval(() => {
      // Update stock prices
      const updatedStocks = updateStockPrices([...stocks]);
      setStocks(updatedStocks);
      
      // Update indices based on new stock prices
      const updatedIndices = updateIndices([...indices], updatedStocks);
      setIndices(updatedIndices);
      
      // Update portfolio positions with new prices
      const updatedPortfolio = updatePortfolioPositions({...portfolio}, updatedStocks);
      setPortfolio(updatedPortfolio);
      
      // Check pending limit orders
      const { updatedOrders, updatedPortfolio: portfolioAfterOrders, executedOrders } = 
        checkLimitOrders([...orders].filter(o => o.status === 'pending'), updatedStocks, updatedPortfolio);
      
      if (executedOrders.length > 0) {
        toast.success(`${executedOrders.length} limit order(s) executed`);
        setOrders(updatedOrders);
        setPortfolio(portfolioAfterOrders);
      }
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(updateInterval);
  }, [stocks, indices, portfolio, orders]);
  
  // Helper to get stock by ID
  const getStockById = useCallback((id: string) => {
    return stocks.find(stock => stock.id === id);
  }, [stocks]);
  
  // Helper to get stock by ticker
  const getStockByTicker = useCallback((ticker: string) => {
    return stocks.find(stock => stock.ticker === ticker);
  }, [stocks]);
  
  // Place a limit order
  const placeLimitOrder = useCallback((
    stockId: string, 
    side: 'buy' | 'sell', 
    quantity: number, 
    limitPrice: number
  ) => {
    const stock = getStockById(stockId);
    if (!stock) {
      toast.error("Stock not found");
      return;
    }
    
    try {
      const newOrder = createOrder(
        'user-1', // Hard-coded user ID for now
        stock,
        'limit',
        side,
        quantity,
        limitPrice
      );
      
      setOrders(prevOrders => [...prevOrders, newOrder]);
      toast.success(`Limit order placed: ${side} ${quantity} ${stock.ticker} at ₹${limitPrice.toFixed(2)}`);
    } catch (error) {
      console.error("Error placing limit order:", error);
      toast.error("Failed to place limit order");
    }
  }, [getStockById]);
  
  // Place a market order
  const placeMarketOrder = useCallback((
    stockId: string, 
    side: 'buy' | 'sell', 
    quantity: number
  ) => {
    const stock = getStockById(stockId);
    if (!stock) {
      toast.error("Stock not found");
      return;
    }
    
    try {
      const newOrder = createOrder(
        'user-1', // Hard-coded user ID for now
        stock,
        'market',
        side,
        quantity
      );
      
      // Execute market order immediately
      const { updatedOrder, updatedPortfolio } = executeMarketOrder(
        newOrder, 
        stocks, 
        portfolio
      );
      
      setOrders(prevOrders => [...prevOrders, updatedOrder]);
      setPortfolio(updatedPortfolio);
      
      if (updatedOrder.status === 'filled') {
        toast.success(
          `Market order executed: ${side} ${quantity} ${stock.ticker} at ₹${updatedOrder.executedPrice?.toFixed(2)}`
        );
      } else {
        toast.error(`Market order failed: ${side} ${quantity} ${stock.ticker}`);
      }
    } catch (error) {
      console.error("Error placing market order:", error);
      toast.error("Failed to place market order");
    }
  }, [getStockById, stocks, portfolio]);
  
  // Cancel an order
  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: 'canceled' } : order
      )
    );
    toast.success("Order canceled successfully");
  }, []);
  
  const value = {
    stocks,
    indices,
    orders,
    portfolio,
    selectedTimeRange,
    isMarketLoading,
    placeLimitOrder,
    placeMarketOrder,
    cancelOrder,
    getStockById,
    getStockByTicker,
    setSelectedTimeRange
  };
  
  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
