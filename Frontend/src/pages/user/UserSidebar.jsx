// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Eye,
//   User,
//   Wallet,
//   ArrowDownCircle,
//   List,
//   Lock,
// } from "lucide-react";

// const menuItems = [
//   { name: "Watchlist", icon: <Eye size={18} />, path: "/user/watchlist" },
//   { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/user/dashboard" },
//   { name: "Edit Profile", icon: <User size={18} />, path: "/user/account-setting" },
//   { name: "Invest Money", icon: <Wallet size={18} />, path: "/user/invest" },
//   { name: "Withdraw Money", icon: <ArrowDownCircle size={18} />, path: "/user/withdraw" },
//   { name: "Transaction", icon: <List size={18} />, path: "/user/transaction" },
//   { name: "Order History", icon: <List size={18} />, path: "/user/order-history" },
// //   { name: "Change Password", icon: <Lock size={18} />, path: "/user/change-password" },
// ];

// const UserSidebar = ({ isOpen }) => {
//   return (
//     <aside
//       className={`fixed lg:static top-0 left-0 min-h-screen w-64 bg-black text-white z-40
//       transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
//       lg:translate-x-0 transition-transform duration-300`}
//     >
//       <div className="p-4 font-bold text-lg border-b border-white/10">
//         Forex Trading
//       </div>

//       <nav className="p-4 space-y-2">
//         {menuItems.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-3 rounded-lg transition
//               ${
//                 isActive
//                   ? "bg-orange-500 text-white"
//                   : "text-gray-300 hover:bg-white/10"
//               }`
//             }
//           >
//             {item.icon}
//             {item.name}
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default UserSidebar;


import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Eye,
  User,
  Wallet,
  ArrowDownCircle,
  List,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";

const menuItems = [
  { name: "Watchlist", icon: <Eye size={18} />, path: "/user/watchlist", newTab: true, },
  { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/user/dashboard", newTab: true, },
  { name: "Edit Profile", icon: <User size={18} />, path: "/user/account-setting", newTab: true, },
  { name: "Invest Money", icon: <Wallet size={18} />, path: "/user/invest", newTab: true, },
  { name: "Withdraw Money", icon: <ArrowDownCircle size={18} />, path: "/user/withdraw", newTab: true, },
  { name: "Transaction", icon: <List size={18} />, path: "/user/transaction", newTab: true, },
  { name: "Order History", icon: <List size={18} />, path: "/user/order-history", newTab: true, },
];

const UserSidebar = ({ isOpen }) => {
  const navigate = useNavigate();

  
  const [loadingLogout, setLoadingLogout] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include", // 🔴 required for httpOnly cookie
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Logout failed");
        return;
      }

      // Clear client-side auth data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      toast.success("Logged out successfully");
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Network error while logging out");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 min-h-screen w-64 bg-black text-white z-40
      transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      lg:translate-x-0 transition-transform duration-300`}
    >
      <div className="p-4 font-bold text-lg border-b border-white/10 text-center">
        Welcome !
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
              target={item.newTab ? "_blank" : undefined}
  rel={item.newTab ? "noopener noreferrer" : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          disabled={loadingLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition
            ${
              loadingLogout
                ? "bg-red-400 cursor-wait"
                : "bg-red-600 hover:bg-red-700"
            }`}
        >
          <LogOut size={18} />
          {loadingLogout ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};

export default UserSidebar;
