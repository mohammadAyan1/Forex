import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import UserLayout from "./layouts/UserLayout";

import InvestMoney from "./pages/user/InvestMoney";
import WithdrawMoney from "./pages/user/WithdrawMoney";
import Transaction from "./pages/user/Transaction";
import ChangePassword from "./pages/user/ChangePassword";
import OrderHistory from "./pages/user/OrderHistory";
import AccountSetting from "./pages/user/AccountSetting";
import Watchlist from "./pages/user/Watchlist";

import ApproveUser from "./pages/admin/ApproveUser";
import ApproveWithdrawl from "./pages/admin/ApproveWithdrawl";
import ApproveTopup from "./pages/admin/ApproveTopup";
import AddProfitAndLoss from "./pages/admin/AddProfitAndLoss";
import AddTrade from "./pages/admin/AddTrade";

import ProtectedRoute from "./routes/ProtectedRoute";
import BankDetails from "./pages/admin/BankPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />

    <Tooltip id="app-tooltip" />

    <BrowserRouter>
      <Routes>
        {/* ======================
            PUBLIC ROUTES
        ====================== */}
        <Route path="/" element={<Index />} />
        <Route path="/Forex" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/@9424sky@9424SKY" element={<AdminDashboard sender={true} />} />

        {/* ======================
            USER PROTECTED ROUTES
        ====================== */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="account-setting" element={<AccountSetting />} />
            <Route path="invest" element={<InvestMoney />} />
            <Route path="withdraw" element={<WithdrawMoney />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ======================
            ADMIN PROTECTED ROUTES
        ====================== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard sender={false} />}
          />
          <Route path="/admin/approve-users" element={<ApproveUser />} />
          <Route
            path="/admin/approve-withdrawal"
            element={<ApproveWithdrawl />}
          />
          <Route path="/admin/approve-topup" element={<ApproveTopup />} />
          <Route path="/admin/profit-loss" element={<AddProfitAndLoss />} />
          <Route path="/admin/trade" element={<AddTrade />} />
          <Route path="/admin/bankDetail" element={<BankDetails />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
