
import { useState, useEffect } from 'react';
import { PricePoint, Stock, TimeRange } from '@/types/market';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  CandlestickChart,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';

interface StockChartProps {
  stock: Stock;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const timeRanges: TimeRange[] = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' }
];

const ChartTypes = ['Line', 'Area', 'Candlestick', 'Volume'] as const;
type ChartType = typeof ChartTypes[number];

const StockChart = ({ 
  stock, 
  selectedTimeRange,
  onTimeRangeChange
}: StockChartProps) => {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [chartType, setChartType] = useState<ChartType>('Line');
  const change = stock.currentPrice - stock.dayOpen;
  const changePercent = (change / stock.dayOpen) * 100;
  const isPositive = change >= 0;

  useEffect(() => {
    const filterDataByTimeRange = () => {
      const now = Date.now();
      let timeFilterMs = 0;
      
      switch (selectedTimeRange.value) {
        case '1D':
          timeFilterMs = 24 * 60 * 60 * 1000; // 1 day
          break;
        case '1W':
          timeFilterMs = 7 * 24 * 60 * 60 * 1000; // 1 week
          break;
        case '1M':
          timeFilterMs = 30 * 24 * 60 * 60 * 1000; // 1 month
          break;
        case '3M':
          timeFilterMs = 90 * 24 * 60 * 60 * 1000; // 3 months
          break;
        case '1Y':
          timeFilterMs = 365 * 24 * 60 * 60 * 1000; // 1 year
          break;
        case 'ALL':
        default:
          // Return all data
          setChartData(stock.priceHistory);
          return;
      }
      
      const cutoffTime = now - timeFilterMs;
      const filteredData = stock.priceHistory.filter(point => point.timestamp >= cutoffTime);
      setChartData(filteredData);
    };
    
    filterDataByTimeRange();
  }, [stock.priceHistory, selectedTimeRange]);
  
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch(selectedTimeRange.value) {
      case '1D':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString([], { weekday: 'short' });
      case '1M':
      case '3M':
        return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };

  const formatTooltipDate = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch(selectedTimeRange.value) {
      case '1D':
        return date.toLocaleString([], {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short'
        });
      default:
        return date.toLocaleString([], {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
          tickFormatter={(value) => `₹${value.toFixed(0)}`}
        />
        <Tooltip
          labelFormatter={formatTooltipDate}
          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none' }}
          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
        />
        <ReferenceLine y={stock.dayOpen} stroke="#94a3b8" strokeDasharray="3 3" />
        <Line 
          type="monotone" 
          dataKey="close" 
          stroke={isPositive ? '#38A169' : '#E53E3E'} 
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
          tickFormatter={(value) => `₹${value.toFixed(0)}`}
        />
        <Tooltip
          labelFormatter={formatTooltipDate}
          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none' }}
          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
        />
        <ReferenceLine y={stock.dayOpen} stroke="#94a3b8" strokeDasharray="3 3" />
        <Area 
          type="monotone" 
          dataKey="close" 
          stroke={isPositive ? '#38A169' : '#E53E3E'} 
          fill={isPositive ? 'rgba(56, 161, 105, 0.2)' : 'rgba(229, 62, 62, 0.2)'} 
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderCandlestickChart = () => {
    // Custom candle rendering
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip
            labelFormatter={formatTooltipDate}
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none' }}
            formatter={(value: number, name: string) => {
              const label = name === 'candle' ? 'OHLC' : name.charAt(0).toUpperCase() + name.slice(1);
              return [`₹${value.toFixed(2)}`, label];
            }}
          />
          <ReferenceLine y={stock.dayOpen} stroke="#94a3b8" strokeDasharray="3 3" />
          {chartData.map((entry, index) => {
            const isPositive = entry.close >= entry.open;
            const color = isPositive ? '#38A169' : '#E53E3E';
            return (
              <Line
                key={`candle-${index}`}
                data={[{ x: entry.timestamp, low: entry.low, high: entry.high }]}
                stroke={color}
                strokeWidth={1}
                dot={false}
                type="monotone"
                dataKey="candle"
                legendType="none"
              />
            );
          })}
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="transparent"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="transparent"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderVolumeChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#334155' }}
          tickLine={{ stroke: '#334155' }}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          }}
        />
        <Tooltip
          labelFormatter={formatTooltipDate}
          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: 'none' }}
          formatter={(value: number) => [`${value.toLocaleString()}`, 'Volume']}
        />
        <Bar 
          dataKey="volume" 
          fill="#3B82F6" 
          opacity={0.8} 
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'Line':
        return renderLineChart();
      case 'Area':
        return renderAreaChart();
      case 'Candlestick':
        return renderCandlestickChart();
      case 'Volume':
        return renderVolumeChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">{stock.ticker}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">₹{stock.currentPrice.toFixed(2)}</div>
            <div className={`text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
            </div>
          </div>
        </div>

        <Tabs defaultValue="Chart" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Chart">Chart</TabsTrigger>
            <TabsTrigger value="Stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="Chart" className="space-y-4">
            <div className="flex items-center justify-between my-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartType('Line')}
                  className={chartType === 'Line' ? 'bg-secondary' : ''}
                >
                  <LineChartIcon size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartType('Area')}
                  className={chartType === 'Area' ? 'bg-secondary' : ''}
                >
                  <LineChartIcon size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartType('Candlestick')}
                  className={chartType === 'Candlestick' ? 'bg-secondary' : ''}
                >
                  <CandlestickChart size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setChartType('Volume')}
                  className={chartType === 'Volume' ? 'bg-secondary' : ''}
                >
                  <BarChartIcon size={16} />
                </Button>
              </div>
              
              <div className="flex gap-1">
                {timeRanges.map((range) => (
                  <Button 
                    key={range.value}
                    variant="outline" 
                    size="sm"
                    onClick={() => onTimeRangeChange(range)}
                    className={selectedTimeRange.value === range.value ? 'bg-secondary' : ''}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {chartData.length > 0 ? (
              renderChart()
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p>No chart data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="Stats">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="font-medium">₹{stock.dayOpen.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High</p>
                <p className="font-medium">₹{stock.dayHigh.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low</p>
                <p className="font-medium">₹{stock.dayLow.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-medium">{stock.volume.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="font-medium">₹{(stock.marketCap / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sector</p>
                <p className="font-medium">{stock.sector}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockChart;
