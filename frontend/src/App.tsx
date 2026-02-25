import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { SmoothScroll } from '@/components/common/SmoothScroll';
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
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Messages from '@/pages/Messages';
import { SafetyTips, PostingGuidelines, TermsOfService, PrivacyPolicy } from '@/pages/StaticPage';
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
                <SmoothScroll>
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
                                <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                                <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

                                {/* Protected Routes */}
                                <Route path="/listings/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                                <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
                                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

                                {/* Admin Routes */}
                                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                                {/* Static & Help Routes */}
                                <Route path="/safety" element={<SafetyTips />} />
                                <Route path="/guidelines" element={<PostingGuidelines />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />

                                {/* Utilities */}
                                <Route path="/404" element={<NotFound />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Routes>
                        </main>

                        <FloatingChat />
                        <Footer />
                    </div>
                </SmoothScroll>
            </BrowserRouter>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
