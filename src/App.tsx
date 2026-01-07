import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useStore } from './lib/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CaseManagement } from './pages/CaseManagement';
import { PartnerPortal } from './pages/PartnerPortal';
import { Login } from './pages/Login';
import { Analytics } from './pages/Analytics';
import { AdminPanel } from './pages/AdminPanel';

// Guard for protected routes
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { currentUser } = useStore();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(currentUser.role)) {
        // Redirect based on role if they try to access unauthorized page
        if (currentUser.role === 'DCA_PARTNER') return <Navigate to="/portal" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/cases" element={<Layout><CaseManagement /></Layout>} />
                    <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                    <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
                </Route>

                {/* DCA Partner Routes */}
                <Route element={<ProtectedRoute allowedRoles={['DCA_PARTNER']} />}>
                    <Route path="/portal" element={<PartnerPortal />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
