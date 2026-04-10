import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
