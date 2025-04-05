import { Order, OrderSide, OrderStatus, OrderType, Portfolio, Position, Stock } from "@/types/market";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

// Process a market order (immediate execution)
export const executeMarketOrder = (
  order: Order, 
  stocks: Stock[], 
  portfolio: Portfolio
): { updatedOrder: Order; updatedPortfolio: Portfolio } => {
  // Find the stock
  const stock = stocks.find(s => s.id === order.stockId);
  if (!stock) {
    throw new Error(`Stock with ID ${order.stockId} not found`);
  }

  const executionPrice = stock.currentPrice;
  const totalCost = executionPrice * order.quantity;
  
  let updatedPortfolio = { ...portfolio };
  
  if (order.side === 'buy') {
    // Check if user has enough cash
    if (updatedPortfolio.cash < totalCost) {
      toast.error("Insufficient funds to execute this order");
      return { 
        updatedOrder: { ...order, status: 'canceled' }, 
        updatedPortfolio 
      };
    }
    
    // Update portfolio cash
    updatedPortfolio.cash -= totalCost;
    
    // Update or create position
    const existingPositionIndex = updatedPortfolio.positions.findIndex(
      p => p.stockId === order.stockId
    );
    
    if (existingPositionIndex >= 0) {
      // Update existing position using average cost method
      const existingPosition = updatedPortfolio.positions[existingPositionIndex];
      const oldValue = existingPosition.quantity * existingPosition.averageCost;
      const newValue = order.quantity * executionPrice;
      const newQuantity = existingPosition.quantity + order.quantity;
      const newAverageCost = (oldValue + newValue) / newQuantity;
      
      const updatedPosition = {
        ...existingPosition,
        quantity: newQuantity,
        averageCost: newAverageCost,
        currentValue: newQuantity * stock.currentPrice,
        profitLoss: (stock.currentPrice - newAverageCost) * newQuantity,
        profitLossPercentage: ((stock.currentPrice / newAverageCost) - 1) * 100
      };
      
      updatedPortfolio.positions[existingPositionIndex] = updatedPosition;
    } else {
      // Create a new position
      const newPosition: Position = {
        stockId: stock.id,
        ticker: stock.ticker,
        quantity: order.quantity,
        averageCost: executionPrice,
        currentValue: order.quantity * stock.currentPrice,
        profitLoss: 0, // No P&L at the moment of purchase
        profitLossPercentage: 0
      };
      
      updatedPortfolio.positions = [...updatedPortfolio.positions, newPosition];
    }
  } else { // Sell order
    // Check if user has enough shares to sell
    const existingPositionIndex = updatedPortfolio.positions.findIndex(
      p => p.stockId === order.stockId
    );
    
    if (existingPositionIndex < 0 || updatedPortfolio.positions[existingPositionIndex].quantity < order.quantity) {
      toast.error("Not enough shares to execute this sell order");
      return { 
        updatedOrder: { ...order, status: 'canceled' }, 
        updatedPortfolio 
      };
    }
    
    // Update portfolio cash
    updatedPortfolio.cash += totalCost;
    
    // Update position
    const existingPosition = updatedPortfolio.positions[existingPositionIndex];
    const updatedQuantity = existingPosition.quantity - order.quantity;
    
    if (updatedQuantity > 0) {
      // Update existing position
      const updatedPosition = {
        ...existingPosition,
        quantity: updatedQuantity,
        currentValue: updatedQuantity * stock.currentPrice,
        profitLoss: (stock.currentPrice - existingPosition.averageCost) * updatedQuantity,
        profitLossPercentage: ((stock.currentPrice / existingPosition.averageCost) - 1) * 100
      };
      
      updatedPortfolio.positions[existingPositionIndex] = updatedPosition;
    } else {
      // Remove position if no shares left
      updatedPortfolio.positions = updatedPortfolio.positions.filter(
        (_, index) => index !== existingPositionIndex
      );
    }
  }
  
  // Update portfolio totals
  updatedPortfolio = recalculatePortfolioTotals(updatedPortfolio, stocks);
  
  // Update order status
  const updatedOrder: Order = {
    ...order,
    status: 'filled',
    executedAt: Date.now(),
    executedPrice: executionPrice
  };
  
  return { updatedOrder, updatedPortfolio };
};

// Process limit orders (check if they can be executed)
export const checkLimitOrders = (
  pendingOrders: Order[], 
  stocks: Stock[], 
  portfolio: Portfolio
): { 
  updatedOrders: Order[]; 
  updatedPortfolio: Portfolio; 
  executedOrders: Order[]; 
} => {
  let updatedPortfolio = { ...portfolio };
  const updatedOrders: Order[] = [];
  const executedOrders: Order[] = [];
  
  // Process orders in FIFO order
  const sortedOrders = [...pendingOrders].sort((a, b) => a.createdAt - b.createdAt);
  
  for (const order of sortedOrders) {
    if (order.status !== 'pending' || order.type !== 'limit') {
      updatedOrders.push(order);
      continue;
    }
    
    const stock = stocks.find(s => s.id === order.stockId);
    if (!stock) {
      updatedOrders.push(order);
      continue;
    }
    
    let shouldExecute = false;
    
    if (order.side === 'buy' && order.limitPrice !== undefined) {
      // For buy orders, execute when the market price is at or below the limit price
      shouldExecute = stock.currentPrice <= order.limitPrice;
    } else if (order.side === 'sell' && order.limitPrice !== undefined) {
      // For sell orders, execute when the market price is at or above the limit price
      shouldExecute = stock.currentPrice >= order.limitPrice;
    }
    
    if (shouldExecute) {
      try {
        const result = executeMarketOrder(
          { ...order, type: 'market' }, 
          stocks, 
          updatedPortfolio
        );
        
        updatedPortfolio = result.updatedPortfolio;
        const executedOrder = result.updatedOrder;
        
        if (executedOrder.status === 'filled') {
          executedOrders.push(executedOrder);
          updatedOrders.push(executedOrder);
        } else {
          // If execution failed, keep the order as pending
          updatedOrders.push(order);
        }
      } catch (error) {
        // If an error occurred, keep the order as pending
        updatedOrders.push(order);
      }
    } else {
      // Keep the order as pending
      updatedOrders.push(order);
    }
  }
  
  return { updatedOrders, updatedPortfolio, executedOrders };
};

// Create a new order
export const createOrder = (
  userId: string,
  stock: Stock,
  type: OrderType,
  side: OrderSide,
  quantity: number,
  limitPrice?: number
): Order => {
  return {
    id: uuidv4(),
    userId,
    stockId: stock.id,
    ticker: stock.ticker,
    type,
    side,
    quantity,
    limitPrice: type === 'limit' ? limitPrice : undefined,
    status: 'pending',
    createdAt: Date.now()
  };
};

// Update portfolio positions based on current stock prices
export const updatePortfolioPositions = (portfolio: Portfolio, stocks: Stock[]): Portfolio => {
  const updatedPositions = portfolio.positions.map(position => {
    const stock = stocks.find(s => s.id === position.stockId);
    if (!stock) return position;
    
    const currentValue = position.quantity * stock.currentPrice;
    const profitLoss = (stock.currentPrice - position.averageCost) * position.quantity;
    const profitLossPercentage = ((stock.currentPrice / position.averageCost) - 1) * 100;
    
    return {
      ...position,
      currentValue,
      profitLoss,
      profitLossPercentage
    };
  });
  
  return recalculatePortfolioTotals({
    ...portfolio,
    positions: updatedPositions
  }, stocks);
};

// Recalculate portfolio totals
export const recalculatePortfolioTotals = (portfolio: Portfolio, stocks: Stock[]): Portfolio => {
  const totalInvestment = portfolio.positions.reduce(
    (sum, position) => sum + (position.averageCost * position.quantity), 
    0
  );
  
  const totalValue = portfolio.positions.reduce((sum, position) => {
    const stock = stocks.find(s => s.id === position.stockId);
    if (!stock) return sum;
    return sum + (position.quantity * stock.currentPrice);
  }, 0);
  
  const totalProfitLoss = totalValue - totalInvestment;
  const totalProfitLossPercentage = totalInvestment > 0 
    ? ((totalValue / totalInvestment) - 1) * 100 
    : 0;
  
  return {
    ...portfolio,
    totalValue: totalValue + portfolio.cash,
    totalInvestment,
    totalProfitLoss,
    totalProfitLossPercentage
  };
};

// Create initial portfolio
export const createInitialPortfolio = (): Portfolio => {
  return {
    cash: 100000, // Starting with ₹100,000
    positions: [],
    totalValue: 100000,
    totalInvestment: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0
  };
};
