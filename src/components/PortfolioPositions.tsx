
import { useNavigate } from 'react-router-dom';
import { useMarket } from '@/contexts/MarketContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PortfolioPositions = () => {
  const { portfolio, getStockById } = useMarket();
  const navigate = useNavigate();
  
  const handleRowClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };
  
  if (portfolio.positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>You don't have any positions yet.</p>
            <p>Start trading to build your portfolio!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.positions.map((position) => {
              const stock = getStockById(position.stockId);
              if (!stock) return null;
              
              const isProfitable = position.profitLoss >= 0;
              const profitClass = isProfitable ? 'text-success' : 'text-danger';
              
              return (
                <TableRow 
                  key={position.stockId}
                  onClick={() => handleRowClick(position.stockId)}
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  <TableCell className="font-medium">{position.ticker}</TableCell>
                  <TableCell>{position.quantity}</TableCell>
                  <TableCell className="text-right">₹{position.averageCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{stock.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{position.currentValue.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${profitClass}`}>
                    {isProfitable ? '+' : ''}
                    {position.profitLoss.toFixed(2)} ({isProfitable ? '+' : ''}
                    {position.profitLossPercentage.toFixed(2)}%)
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PortfolioPositions;
