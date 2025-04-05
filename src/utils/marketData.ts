import { Stock, StockIndex, PricePoint } from "@/types/market";
import { v4 as uuidv4 } from 'uuid';

// Company name parts for generating fictional companies
const companyPrefixes = [
  "Quantum", "Nexus", "Apex", "Synergy", "Global", "Infinite", "Horizon", "Pioneer", "Elite", 
  "Prime", "Fusion", "Vortex", "Dynamic", "Strategic", "Integrated", "Advanced", "Universal",
  "Precision", "Innovative", "Catalyst", "Summit", "Titan", "Vector", "Stellar", "Olympus"
];

const companySuffixes = [
  "Systems", "Technologies", "Dynamics", "Solutions", "Innovations", "Corp", "Industries", "Enterprises",
  "Networks", "Labs", "Robotics", "Ventures", "Group", "Holdings", "Communications", "Analytics",
  "Micro", "Energy", "Logistics", "Aviation", "Pharmaceuticals", "BioScience", "Manufacturing", "Telecom"
];

const sectors = [
  "Technology", "Finance", "Healthcare", "Energy", "Consumer Goods", "Industrials", 
  "Telecommunications", "Utilities", "Materials", "Real Estate"
];

// Generate a random ticker symbol
const generateTicker = (usedTickers: Set<string>): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ticker: string;
  
  do {
    ticker = '';
    const length = Math.random() > 0.7 ? 4 : 3; // 70% chance for 3 letters, 30% for 4
    for (let i = 0; i < length; i++) {
      ticker += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (usedTickers.has(ticker));
  
  usedTickers.add(ticker);
  return ticker;
};

// Generate a company name
const generateCompanyName = (): string => {
  const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
  const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
  return `${prefix} ${suffix}`;
};

// Generate historical price data with basic trend and volatility
const generatePriceHistory = (
  basePrice: number, 
  days: number,
  pointsPerDay: number,
  volatility: number,
  trend: number
): PricePoint[] => {
  const history: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const millisecondsPerDay = 86400000;
  const millisecondsPerPoint = millisecondsPerDay / pointsPerDay;
  
  for (let day = days; day >= 0; day--) {
    for (let point = 0; point < pointsPerDay; point++) {
      const timestamp = now - (day * millisecondsPerDay) + (point * millisecondsPerPoint);
      
      // Add random noise with trend influence
      const randomFactor = (Math.random() - 0.5) * volatility;
      const trendFactor = (Math.random() * trend);
      const priceChange = currentPrice * (randomFactor + trendFactor);
      currentPrice += priceChange;
      
      // Ensure price doesn't go below a minimum threshold
      if (currentPrice < 10) {
        currentPrice = 10 + (Math.random() * 10);
      }
      
      const dayVolatility = volatility * currentPrice * 0.1;
      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * dayVolatility;
      const high = Math.max(open, close) + (Math.random() * dayVolatility);
      const low = Math.min(open, close) - (Math.random() * dayVolatility);
      const volume = Math.floor(50000 + Math.random() * 950000);
      
      history.push({ timestamp, open, high, low, close, volume });
    }
  }
  
  return history;
};

// Generate a single stock
const generateStock = (usedTickers: Set<string>): Stock => {
  // Generate basic stock info
  const ticker = generateTicker(usedTickers);
  const name = generateCompanyName();
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const initialPrice = 50 + Math.random() * 1950; // ₹50 to ₹2000
  const volatility = 0.01 + (Math.random() * 0.04); // 1-5% volatility
  const trend = (Math.random() * 0.02) - 0.01; // -1% to +1% daily trend
  
  // Generate price history - 30 days with 5 points per day
  const priceHistory = generatePriceHistory(initialPrice, 30, 5, volatility, trend);
  const latestPrice = priceHistory[priceHistory.length - 1].close;
  const previousPrice = priceHistory[priceHistory.length - 2]?.close || initialPrice;
  
  // Calculate day stats
  const today = priceHistory.slice(-5); // Last 5 points represent today
  const dayOpen = today[0].open;
  const dayHigh = Math.max(...today.map(p => p.high));
  const dayLow = Math.min(...today.map(p => p.low));
  
  // Calculate market cap (fictional)
  const outstandingShares = Math.floor(10000000 + Math.random() * 990000000); // 10M to 1B shares
  const marketCap = latestPrice * outstandingShares;
  
  // Calculate daily volume
  const volume = today.reduce((sum, point) => sum + point.volume, 0);
  
  return {
    id: uuidv4(),
    ticker,
    name,
    sector,
    initialPrice,
    currentPrice: latestPrice,
    previousPrice,
    dayOpen,
    dayHigh,
    dayLow,
    marketCap,
    volume,
    priceHistory,
    volatility,
    trend
  };
};

// Generate stock indices
const generateIndices = (stocks: Stock[]): StockIndex[] => {
  const indices: StockIndex[] = [];
  const indexNames = ["MAIN", "TECH", "FIN", "HEALTH", "ENERGY"];
  
  for (let i = 0; i < indexNames.length; i++) {
    const name = `${indexNames[i]} Index`;
    const ticker = indexNames[i];
    
    let components: string[] = [];
    if (ticker === "MAIN") {
      // Main index: top 30 stocks by market cap
      components = [...stocks]
        .sort((a, b) => b.marketCap - a.marketCap)
        .slice(0, 30)
        .map(stock => stock.id);
    } else {
      // Sector indices
      let sector: string;
      switch (ticker) {
        case "TECH": sector = "Technology"; break;
        case "FIN": sector = "Finance"; break;
        case "HEALTH": sector = "Healthcare"; break;
        case "ENERGY": sector = "Energy"; break;
        default: sector = "Technology";
      }
      
      components = stocks
        .filter(stock => stock.sector === sector)
        .slice(0, 20) // Up to 20 stocks per sector index
        .map(stock => stock.id);
    }
    
    // Calculate initial index values from components
    const indexStocks = stocks.filter(stock => components.includes(stock.id));
    const initialValue = indexStocks.reduce((sum, stock) => sum + stock.initialPrice, 0) / indexStocks.length;
    
    // Generate value history based on component stocks
    const timestamps = stocks[0].priceHistory.map(point => point.timestamp);
    const valueHistory = timestamps.map(timestamp => {
      const indexValue = indexStocks.reduce((sum, stock) => {
        const pricePoint = stock.priceHistory.find(p => p.timestamp === timestamp);
        return sum + (pricePoint ? pricePoint.close : 0);
      }, 0) / indexStocks.length;
      
      return {
        timestamp,
        value: indexValue
      };
    });
    
    indices.push({
      id: uuidv4(),
      name,
      ticker,
      components,
      currentValue: valueHistory[valueHistory.length - 1].value,
      previousValue: valueHistory[valueHistory.length - 2]?.value || initialValue,
      dayOpen: valueHistory[valueHistory.length - 5]?.value || initialValue,
      dayHigh: Math.max(...valueHistory.slice(-5).map(v => v.value)),
      dayLow: Math.min(...valueHistory.slice(-5).map(v => v.value)),
      valueHistory
    });
  }
  
  return indices;
};

// Generate initial market data
export const generateMarketData = () => {
  const usedTickers = new Set<string>();
  const stocks: Stock[] = [];
  
  // Generate 100 stocks
  for (let i = 0; i < 100; i++) {
    stocks.push(generateStock(usedTickers));
  }
  
  // Generate indices based on these stocks
  const indices = generateIndices(stocks);
  
  return { stocks, indices };
};

// Update stock prices with random changes influenced by trend and volatility
export const updateStockPrices = (stocks: Stock[]): Stock[] => {
  const now = Date.now();
  
  return stocks.map(stock => {
    const { currentPrice, volatility, trend } = stock;
    
    // Calculate price change with trend bias
    const randomFactor = (Math.random() - 0.5) * volatility;
    const trendFactor = (Math.random() * trend);
    const priceChange = currentPrice * (randomFactor + trendFactor);
    const newPrice = Math.max(currentPrice + priceChange, 10); // Ensure price doesn't go below ₹10
    
    // Update day high/low if needed
    const newDayHigh = newPrice > stock.dayHigh ? newPrice : stock.dayHigh;
    const newDayLow = newPrice < stock.dayLow ? newPrice : stock.dayLow;
    
    // Add new price point to history
    const volume = Math.floor(10000 + Math.random() * 90000);
    const newPricePoint: PricePoint = {
      timestamp: now,
      open: currentPrice,
      high: Math.max(currentPrice, newPrice),
      low: Math.min(currentPrice, newPrice),
      close: newPrice,
      volume
    };
    
    // Keep only the most recent 150 price points
    const updatedHistory = [...stock.priceHistory, newPricePoint].slice(-150);
    
    return {
      ...stock,
      previousPrice: currentPrice,
      currentPrice: newPrice,
      dayHigh: newDayHigh,
      dayLow: newDayLow,
      priceHistory: updatedHistory
    };
  });
};

// Update indices based on their component stocks
export const updateIndices = (indices: StockIndex[], stocks: Stock[]): StockIndex[] => {
  const now = Date.now();
  
  return indices.map(index => {
    const componentStocks = stocks.filter(stock => index.components.includes(stock.id));
    const newValue = componentStocks.reduce((sum, stock) => sum + stock.currentPrice, 0) / componentStocks.length;
    
    // Update day high/low if needed
    const newDayHigh = newValue > index.dayHigh ? newValue : index.dayHigh;
    const newDayLow = newValue < index.dayLow ? newValue : index.dayLow;
    
    // Add new value point to history
    const newValuePoint = {
      timestamp: now,
      value: newValue
    };
    
    // Keep only the most recent 150 value points
    const updatedHistory = [...index.valueHistory, newValuePoint].slice(-150);
    
    return {
      ...index,
      previousValue: index.currentValue,
      currentValue: newValue,
      dayHigh: newDayHigh,
      dayLow: newDayLow,
      valueHistory: updatedHistory
    };
  });
};
