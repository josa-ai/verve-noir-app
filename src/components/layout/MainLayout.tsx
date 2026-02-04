import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';
import { Toaster } from 'react-hot-toast';

export function MainLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main 
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:ml-64',
          !sidebarOpen && 'lg:ml-20'
        )}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </div>
  );
}
