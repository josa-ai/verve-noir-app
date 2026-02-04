import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Ready to Ship', href: '/ready-to-ship', icon: Truck },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-500 text-white lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-primary-500 text-white transition-transform duration-300 ease-in-out',
          'w-64 flex flex-col',
          !sidebarOpen && '-translate-x-full lg:translate-x-0 lg:w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-primary-400">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-gold-400" />
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">Verve Noir</h1>
                <p className="text-xs text-primary-200">Order Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-gold-500 text-black font-medium' 
                    : 'text-white hover:bg-primary-400',
                  !sidebarOpen && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-primary-400 p-4">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gold-500 flex items-center justify-center text-black font-medium">
                  {user?.full_name?.[0] || user?.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-primary-200 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-primary-200 hover:text-white transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex justify-center w-full text-primary-200 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Toggle button (desktop only) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center py-2 border-t border-primary-400 text-primary-200 hover:text-white hover:bg-primary-400 transition-colors"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </aside>
    </>
  );
}
