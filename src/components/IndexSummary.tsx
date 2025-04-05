
import { StockIndex } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IndexSummaryProps {
  indices: StockIndex[];
}

const IndexSummary = ({ indices }: IndexSummaryProps) => {
  const navigate = useNavigate();
  
  if (indices.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="h-6 bg-secondary rounded-md w-24"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-secondary rounded-md w-32 mb-2"></div>
              <div className="h-5 bg-secondary rounded-md w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const handleIndexClick = (indexId: string) => {
    navigate(`/index/${indexId}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {indices.slice(0, 3).map((index) => {
        const change = index.currentValue - index.previousValue;
        const percentChange = (change / index.previousValue) * 100;
        const isPositive = change >= 0;
        
        return (
          <Card 
            key={index.id}
            onClick={() => handleIndexClick(index.id)}
            className="cursor-pointer hover:border-primary transition-colors"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex justify-between">
                <span>{index.name}</span>
                <span className="text-muted-foreground">{index.ticker}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                ₹{index.currentValue.toFixed(2)}
              </div>
              <div className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? (
                  <ArrowUp className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowDown className="mr-1 h-4 w-4" />
                )}
                <span>
                  {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IndexSummary;
