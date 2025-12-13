import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Wallet, Menu, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = authService.getSession();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    window.history.replaceState(null, '', '/login');
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ...(session?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Shield }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 xl:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden xl:inline-block">Finance Tracker</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Welcome, </span>
                <span className="font-medium">{session?.username}</span>
              </div>
              {session?.role === 'admin' && (
                <Badge variant="default" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </Badge>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{session?.username}</div>
                    {session?.role === 'admin' && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </Badge>
                    )}
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            location.pathname === item.path
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <Button onClick={handleLogout} variant="outline" className="gap-2 w-full">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
