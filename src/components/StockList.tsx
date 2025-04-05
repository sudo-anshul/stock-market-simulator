
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '@/contexts/MarketContext';
import { Stock } from '@/types/market';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Search } from 'lucide-react';

const StockList = () => {
  const { stocks } = useMarket();
  const navigate = useNavigate();
  const [displayStocks, setDisplayStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'ticker' | 'name' | 'price' | 'change'>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique sectors
    const uniqueSectors = Array.from(new Set(stocks.map(stock => stock.sector)));
    setSectors(uniqueSectors);

    // Filter and sort stocks
    let filtered = [...stocks];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        stock => 
          stock.ticker.toLowerCase().includes(query) || 
          stock.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(stock => stock.sector === sectorFilter);
    }
    
    // Sort stocks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'change':
          const changeA = ((a.currentPrice - a.previousPrice) / a.previousPrice) * 100;
          const changeB = ((b.currentPrice - b.previousPrice) / b.previousPrice) * 100;
          comparison = changeA - changeB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setDisplayStocks(filtered);
  }, [stocks, searchQuery, sortField, sortDirection, sectorFilter]);

  const handleSort = (field: 'ticker' | 'name' | 'price' | 'change') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleRowClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };
  
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };
  
  const formatChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percentChange.toFixed(2)}%)`;
  };
  
  const getChangeClass = (current: number, previous: number) => {
    if (current > previous) return 'text-market-green';
    if (current < previous) return 'text-market-red';
    return 'text-market-neutral';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={sectorFilter} 
            onValueChange={(value) => setSectorFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('ticker')}
                  className="flex items-center gap-1 p-0 h-auto font-medium"
                >
                  Ticker
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 p-0 h-auto font-medium text-left"
                >
                  Company
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 p-0 h-auto font-medium ml-auto"
                >
                  Price
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('change')}
                  className="flex items-center gap-1 p-0 h-auto font-medium ml-auto"
                >
                  Change
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStocks.map((stock) => {
              const changeClass = getChangeClass(stock.currentPrice, stock.previousPrice);
              
              return (
                <TableRow 
                  key={stock.id} 
                  onClick={() => handleRowClick(stock.id)}
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  <TableCell className="font-medium">{stock.ticker}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.sector}</TableCell>
                  <TableCell className="text-right">{formatPrice(stock.currentPrice)}</TableCell>
                  <TableCell className={`text-right ${changeClass}`}>
                    {formatChange(stock.currentPrice, stock.dayOpen)}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {displayStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {searchQuery || sectorFilter !== 'all' ? 
                    "No matching stocks found" : 
                    "Loading stocks..."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockList;
