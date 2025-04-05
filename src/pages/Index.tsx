
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '@/contexts/MarketContext';
import StockList from '@/components/StockList';
import IndexSummary from '@/components/IndexSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { stocks, indices, isMarketLoading } = useMarket();
  const navigate = useNavigate();
  const [topGainers, setTopGainers] = useState<typeof stocks>([]);
  const [topLosers, setTopLosers] = useState<typeof stocks>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (stocks.length > 0) {
      // Calculate percentage change for each stock
      const stocksWithChange = stocks.map(stock => {
        const percentChange = ((stock.currentPrice - stock.dayOpen) / stock.dayOpen) * 100;
        return { ...stock, percentChange };
      });
      
      // Sort to get top gainers and losers
      const sortedByGain = [...stocksWithChange].sort((a, b) => b.percentChange - a.percentChange);
      const sortedByLoss = [...stocksWithChange].sort((a, b) => a.percentChange - b.percentChange);
      
      setTopGainers(sortedByGain.slice(0, 5));
      setTopLosers(sortedByLoss.slice(0, 5));
      setIsLoading(false);
    }
  }, [stocks]);

  const handleStockClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };
  
  const formatChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change >= 0;
    return `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground">
          Track market movements and discover trading opportunities
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Market Indices */}
        {isMarketLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <IndexSummary indices={indices} />
        )}
        
        {/* Top Movers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="text-success mr-2">▲</span> Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between py-2 animate-pulse">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {topGainers.map(stock => (
                    <Button
                      key={stock.id}
                      variant="ghost"
                      className="w-full justify-between font-normal h-auto py-2"
                      onClick={() => handleStockClick(stock.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{stock.ticker}</span>
                        <span className="text-xs text-muted-foreground">{stock.name}</span>
                      </div>
                      <span className="text-success font-medium">
                        {formatChange(stock.currentPrice, stock.dayOpen)}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <span className="text-danger mr-2">▼</span> Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between py-2 animate-pulse">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {topLosers.map(stock => (
                    <Button
                      key={stock.id}
                      variant="ghost"
                      className="w-full justify-between font-normal h-auto py-2"
                      onClick={() => handleStockClick(stock.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{stock.ticker}</span>
                        <span className="text-xs text-muted-foreground">{stock.name}</span>
                      </div>
                      <span className="text-danger font-medium">
                        {formatChange(stock.currentPrice, stock.dayOpen)}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* All Stocks */}
        <Card>
          <CardHeader>
            <CardTitle>All Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <StockList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
