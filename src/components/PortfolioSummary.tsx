
import { useMarket } from '@/contexts/MarketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

const PortfolioSummary = () => {
  const { portfolio } = useMarket();
  const { cash, totalValue, totalInvestment, totalProfitLoss, totalProfitLossPercentage } = portfolio;
  
  const isProfitable = totalProfitLoss >= 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{totalValue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total value of your investments and cash
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{cash.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ready to invest in new opportunities
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Invested Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{totalInvestment.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total cost basis of your positions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold flex items-center gap-1 ${isProfitable ? 'text-success' : 'text-danger'}`}>
            {isProfitable ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            ₹{totalProfitLoss.toFixed(2)} ({totalProfitLossPercentage.toFixed(2)}%)
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isProfitable ? 'Unrealized gain' : 'Unrealized loss'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
