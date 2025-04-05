import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMarket } from "@/contexts/MarketContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Search,
  BarChart2,
  UserRound,
  Clock,
  Menu,
  X,
} from "lucide-react";

const NavBar = () => {
  const { stocks, portfolio, isMarketLoading } = useMarket();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; ticker: string; name: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    const filteredStocks = stocks
      .filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map((stock) => ({
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
      }));

    setSearchResults(filteredStocks);
  };

  const handleSearchItemClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="px-4 md:container flex h-14 items-center">
        <Link to="/" className="flex items-center mr-6">
          <LineChart className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold">Market Simulator</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Button variant={isActive("/") ? "secondary" : "ghost"} asChild>
            <Link to="/">Dashboard</Link>
          </Button>
          <Button
            variant={isActive("/portfolio") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/portfolio">Portfolio</Link>
          </Button>
          <Button variant={isActive("/orders") ? "secondary" : "ghost"} asChild>
            <Link to="/orders">Orders</Link>
          </Button>
        </nav>

        {/* Responsive search bar and account info */}
        <div className="hidden md:flex items-center ml-auto space-x-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stocks..."
                className="w-[200px] lg:w-[300px] pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => {
                  // Delay hiding results to allow for clicks
                  setTimeout(() => setIsSearching(false), 200);
                }}
              />
            </div>

            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-50">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between"
                    onMouseDown={() => handleSearchItemClick(result.id)}
                  >
                    <span className="font-medium">{result.ticker}</span>
                    <span className="text-muted-foreground text-sm">
                      {result.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>
                  ₹{!isMarketLoading ? portfolio.totalValue.toFixed(0) : "---"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/portfolio")}>
                <UserRound className="mr-2 h-4 w-4" />
                <span>Portfolio</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/orders")}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Order History</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="p-4 space-y-3">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stocks..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => {
                  // Delay hiding results to allow for clicks
                  setTimeout(() => setIsSearching(false), 200);
                }}
              />

              {isSearching && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-50">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between"
                      onMouseDown={() => handleSearchItemClick(result.id)}
                    >
                      <span className="font-medium">{result.ticker}</span>
                      <span className="text-muted-foreground text-sm">
                        {result.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link to="/">
                <BarChart2 className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>

            <Button
              variant={isActive("/portfolio") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link to="/portfolio">
                <UserRound className="mr-2 h-4 w-4" />
                Portfolio (₹
                {!isMarketLoading ? portfolio.totalValue.toFixed(0) : "---"})
              </Link>
            </Button>

            <Button
              variant={isActive("/orders") ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link to="/orders">
                <Clock className="mr-2 h-4 w-4" />
                Orders
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
