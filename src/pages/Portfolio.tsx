
import { useMarket } from '@/contexts/MarketContext';
import PortfolioSummary from '@/components/PortfolioSummary';
import PortfolioPositions from '@/components/PortfolioPositions';
import OrderHistory from '@/components/OrderHistory';

const Portfolio = () => {
  const { isMarketLoading } = useMarket();

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Track your investments and trading performance
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <PortfolioSummary />
        
        {/* Positions */}
        <PortfolioPositions />
        
        {/* Recent Orders */}
        <OrderHistory />
      </div>
    </div>
  );
};

export default Portfolio;
