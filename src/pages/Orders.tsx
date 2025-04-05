
import { useMarket } from '@/contexts/MarketContext';
import OrderHistory from '@/components/OrderHistory';

const Orders = () => {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">
          View and manage your placed orders
        </p>
      </div>
      
      <OrderHistory />
    </div>
  );
};

export default Orders;
