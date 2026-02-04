import { Search, Bell } from 'lucide-react';
import { Input } from '../ui/Input';
import { useOrderStore } from '../../store/orderStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { filters, setFilters } = useOrderStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="w-64">
            <Input
              type="text"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-gold-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
