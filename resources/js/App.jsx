import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contacts from './pages/Contacts';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Reservation from './pages/Reservation';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeads from './pages/admin/AdminLeads';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPromocodes from './pages/admin/AdminPromocodes';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReviews from './pages/admin/AdminReviews';
import AdminTables from './pages/admin/AdminTables';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="tables" element={<AdminTables />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="promocodes" element={<AdminPromocodes />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="leads" element={<AdminLeads />} />
            </Route>
        </Routes>
    );
}
