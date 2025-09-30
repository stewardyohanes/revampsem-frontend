import "./App.css";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminPage from "./pages/admin";
import { RootLayout } from "./components/layouts/root-layout.tsx";
import LoginPage from "./pages/auth/login";
import SuperAdminPage from "./pages/superadmin";
import QRCheckInPage from "./pages/qr-checkin";
import { useIsAuth } from "./services/auth/hooks/use-is-auth.ts";
import { Loader2 } from "lucide-react";

function App() {
  const { data: isAuth, isLoading } = useIsAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <Loader2 className="w-14 h-14 animate-spin text-orange-500" />
      </div>
    );
  }

  const PrivateRoute = () => (isAuth ? <Outlet /> : <LoginPage />);

  const PublicRoute = () => (!isAuth ? <Outlet /> : <Navigate to="/" />);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>
      {/* Public QR Check-in Route - accessible without authentication */}
      <Route path="/qr-checkin/:token" element={<QRCheckInPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<RootLayout />}>
          {isAuth?.user?.level === 0 ? (
            <Route index element={<SuperAdminPage />} />
          ) : (
            <Route index element={<AdminPage />} />
          )}
        </Route>
        <Route path="/admin" element={<RootLayout />}>
          <Route index element={<AdminPage />} />
        </Route>
        <Route path="/superadmin" element={<RootLayout />}>
          <Route index element={<SuperAdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
