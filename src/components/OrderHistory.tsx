
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '@/contexts/MarketContext';
import { Order } from '@/types/market';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const OrderHistory = () => {
  const { orders, cancelOrder } = useMarket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'filled' | 'canceled'>('all');
  
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => b.createdAt - a.createdAt);
  
  const handleRowClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };
  
  const handleCancelOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    cancelOrder(orderId);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const renderOrderStatus = (order: Order) => {
    switch (order.status) {
      case 'filled':
        return <span className="text-success">Filled</span>;
      case 'pending':
        return <span className="text-market-neutral">Pending</span>;
      case 'canceled':
        return <span className="text-market-neutral">Canceled</span>;
      default:
        return <span>{order.status}</span>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeTab === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All
          </Button>
          <Button 
            variant={activeTab === 'pending' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={activeTab === 'filled' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('filled')}
          >
            Filled
          </Button>
          <Button 
            variant={activeTab === 'canceled' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('canceled')}
          >
            Canceled
          </Button>
        </div>
        
        {sortedOrders.length > 0 ? (
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => {
                  const isPending = order.status === 'pending';
                  const sideClass = order.side === 'buy' ? 'text-success' : 'text-danger';
                  
                  return (
                    <TableRow 
                      key={order.id}
                      onClick={() => handleRowClick(order.stockId)}
                      className="cursor-pointer hover:bg-accent transition-colors"
                    >
                      <TableCell className="whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.ticker}</TableCell>
                      <TableCell className="capitalize">{order.type}</TableCell>
                      <TableCell className={`capitalize ${sideClass}`}>{order.side}</TableCell>
                      <TableCell className="text-right">
                        {order.executedPrice 
                          ? `₹${order.executedPrice.toFixed(2)}` 
                          : order.limitPrice 
                            ? `₹${order.limitPrice.toFixed(2)}` 
                            : 'Market'
                        }
                      </TableCell>
                      <TableCell className="text-right">{order.quantity}</TableCell>
                      <TableCell>{renderOrderStatus(order)}</TableCell>
                      <TableCell>
                        {isPending && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleCancelOrder(e, order.id)}
                            className="h-7 w-7"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {activeTab === 'all' ? (
              <p>No orders placed yet.</p>
            ) : (
              <p>No {activeTab} orders.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
