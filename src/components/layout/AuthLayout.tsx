import { Outlet } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Crown className="h-12 w-12 text-gold-400" />
          <div className="text-white">
            <h1 className="text-3xl font-bold">Verve Noir</h1>
            <p className="text-primary-200 text-sm">Order Management System</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-6">
          © {new Date().getFullYear()} Verve Noir. All rights reserved.
        </p>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
