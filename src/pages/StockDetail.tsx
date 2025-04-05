
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMarket } from '@/contexts/MarketContext';
import { Stock, TimeRange } from '@/types/market';
import StockChart from '@/components/StockChart';
import TradeForm from '@/components/TradeForm';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const StockDetail = () => {
  const { stockId } = useParams();
  const { getStockById, selectedTimeRange, setSelectedTimeRange } = useMarket();
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (stockId) {
      const stockData = getStockById(stockId);
      setStock(stockData);
      setLoading(false);
    }
  }, [stockId, getStockById]);
  
  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedTimeRange(range);
  };
  
  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (!stock) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold mb-2">Stock Not Found</h1>
              <p className="text-muted-foreground">
                The stock you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight flex items-center">
          {stock.ticker} <span className="text-muted-foreground ml-2 text-xl">{stock.name}</span>
        </h1>
        <p className="text-muted-foreground">
          {stock.sector} • Market Cap: ₹{(stock.marketCap / 1000000).toFixed(2)}M
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StockChart 
            stock={stock} 
            selectedTimeRange={selectedTimeRange} 
            onTimeRangeChange={handleTimeRangeChange} 
          />
        </div>
        <div>
          <Tabs defaultValue="trade">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="trade">
              <TradeForm stock={stock} />
            </TabsContent>
            <TabsContent value="about">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Company Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      {stock.name} is a fictional company in the {stock.sector} sector with a market capitalization of ₹{(stock.marketCap / 1000000).toFixed(2)}M.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Key Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Day Range</span>
                        <span>₹{stock.dayLow.toFixed(2)} - ₹{stock.dayHigh.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume</span>
                        <span>{stock.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open</span>
                        <span>₹{stock.dayOpen.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current</span>
                        <span>₹{stock.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs italic text-muted-foreground mt-6">
                      Note: All data shown is simulated for educational purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
