import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { ChevronDown, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-5">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

const AdminDashboard = ({ sender }) => {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(sender);
  console.log(users);



  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/wallet/admin/wallet/${sender?"superadmin":"overview"}`,
          { credentials: "include" },
        );

        if (!res?.ok) throw new Error("Failed to fetch dashboard data");

        const data = await res.json();
        setSummary(data?.overall_summary);
        setUsers(data?.users);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {!sender && (<AdminSidebar />)}

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <h2 className="text-xl font-semibold">Admin Wallet Overview</h2>

        {/* 🔹 STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={summary?.total_users} />
          <StatCard title="Total Topup" value={`₹ ${summary?.total_topup}`} />
          <StatCard
            title="Total Withdrawal"
            value={`₹ ${summary?.total_withdrawal}`}
          />
        </div>

        {/* 🔹 USERS TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3">Topup</th>
                <th className="p-3">Withdraw</th>
                <th className="p-3">Profit</th>
                <th className="p-3">Loss</th>
                <th className="p-3">Balance</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user?.user_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium">Username = {user?.name}</p>
                    <p className="font-medium">Password = {user?.password}</p>
                    <p className="text-xs text-gray-500">
                      Email = {user?.email}
                    </p>
                    {sender && (
                      <p className="text-xs text-gray-500">
                        role = {user?.role}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Mobile No. = {user?.mobile}
                    </p>
                  </td>
                  <td className="p-3 text-center">₹{user?.totals?.topup}</td>
                  <td className="p-3 text-center">₹{user?.totals?.withdrawal}</td>
                  <td className="p-3 text-center text-green-600">
                    ₹{user?.totals?.profit}
                  </td>
                  <td className="p-3 text-center text-red-600">
                    ₹{user?.totals?.loss}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    ₹{user?.totals?.balance}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setActiveUser(user)}
                      className="text-purple-600 bg-gray-200 rounded-2xl p-2 hover:underline flex items-center gap-1 mx-auto"
                    >
                      View More
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 TRANSACTION MODAL */}
      {activeUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg relative">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">
                  {activeUser?.name}'s Transactions
                </h3>
                <p className="text-xs text-gray-500">{activeUser?.email}</p>
              </div>
              <button
                onClick={() => setActiveUser(null)}
                className="text-gray-500 hover:text-black"
              >
                <X />
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
              {activeUser?.transactions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  No transactions found
                </p>
              ) : (
                activeUser?.transactions.map((tx) => (
                  <div
                    key={tx?.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
                  >
                    <span className="capitalize font-medium">{tx?.type}</span>
                    <span>₹ {tx?.amount}</span>
                    <span className="text-gray-500">
                      {new Date(tx?.date).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
