
import { useState } from 'react';
import { useMarket } from '@/contexts/MarketContext';
import { Stock } from '@/types/market';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface TradeFormProps {
  stock: Stock;
}

const TradeForm = ({ stock }: TradeFormProps) => {
  const { placeMarketOrder, placeLimitOrder, portfolio } = useMarket();
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number>(stock.currentPrice);
  
  // Find if user owns this stock
  const position = portfolio.positions.find(pos => pos.stockId === stock.id);
  const ownedQuantity = position ? position.quantity : 0;
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLimitPrice(value);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    if (orderType === 'limit' && limitPrice <= 0) {
      toast.error('Limit price must be greater than 0');
      return;
    }

    // Check if selling more than owned
    if (side === 'sell') {
      if (quantity > ownedQuantity) {
        toast.error(`Cannot sell ${quantity} shares. You only own ${ownedQuantity} shares.`);
        return;
      }
    }
    
    try {
      if (orderType === 'market') {
        placeMarketOrder(stock.id, side, quantity);
      } else {
        placeLimitOrder(stock.id, side, quantity, limitPrice);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };
  
  const totalOrderValue = orderType === 'market' 
    ? quantity * stock.currentPrice 
    : quantity * limitPrice;

  const formattedOrderValue = `₹${totalOrderValue.toFixed(2)}`;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Tabs defaultValue={side} onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="buy"
                  className={side === 'buy' ? 'bg-green-600 text-white data-[state=active]:bg-green-600 data-[state=active]:text-white' : ''}
                >
                  Buy
                </TabsTrigger>
                <TabsTrigger
                  value="sell"
                  className={side === 'sell' ? 'bg-red-600 text-white data-[state=active]:bg-red-600 data-[state=active]:text-white' : ''}
                >
                  Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mb-4">
            <Label>Order Type</Label>
            <Select 
              value={orderType} 
              onValueChange={(value: 'market' | 'limit') => setOrderType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
          
          {orderType === 'limit' && (
            <div className="mb-4">
              <Label htmlFor="limitPrice">Limit Price (₹)</Label>
              <Input
                id="limitPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={limitPrice}
                onChange={handleLimitPriceChange}
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Order Value:</span>
              <span className="font-medium">{formattedOrderValue}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Available Cash:</span>
              <span className="font-medium">₹{portfolio.cash.toFixed(2)}</span>
            </div>
            
            {side === 'sell' && position && (
              <div className="flex justify-between text-sm bg-red-50 p-2 rounded">
                <span>Shares Available to Sell:</span>
                <span className="font-medium">{ownedQuantity}</span>
              </div>
            )}
            
            {position && side === 'buy' && (
              <div className="flex justify-between text-sm">
                <span>Shares Owned:</span>
                <span className="font-medium">{position.quantity}</span>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            variant={side === 'buy' ? 'default' : 'destructive'}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {orderType === 'market' ? 'at Market' : 'at Limit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeForm;