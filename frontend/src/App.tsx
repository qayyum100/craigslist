import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/common/ProtectedRoute';

// Pages
import Home from '@/pages/Home';
import Listings from '@/pages/Listings';
import ListingDetail from '@/pages/ListingDetail';
import CreateListing from '@/pages/CreateListing';
import EditListing from '@/pages/EditListing';
import Dashboard from '@/pages/Dashboard';
import AdminPanel from '@/pages/AdminPanel';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60_000,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-slate-950">
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            className: 'glass text-white border-slate-700',
                            duration: 4000,
                            style: {
                                background: '#0f172a',
                                color: '#fff',
                                border: '1px solid #1e293b',
                            },
                        }}
                    />

                    <Navbar />

                    <main className="flex-1">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/listings" element={<Listings />} />
                            <Route path="/listings/:id" element={<ListingDetail />} />

                            {/* Guest Only Routes */}
                            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                            {/* Protected Routes */}
                            <Route path="/listings/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                            <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                            {/* Utilities */}
                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </BrowserRouter>
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
