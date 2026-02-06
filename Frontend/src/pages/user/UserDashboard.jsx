// import { useEffect, useState } from "react";
// import RecentMovement from "./RecentMovement";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// const StatCard = ({ title, amount, color, }) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     const target = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
//     const duration = 1500;
//     const steps = 60;
//     const increment = target / steps;
//     let current = 0;
//     let step = 0;

//     const timer = setInterval(() => {
//       step++;
//       current += increment;
//       if (step >= steps) {
//         setCount(target);
//         clearInterval(timer);
//       } else {
//         setCount(Math.floor(current));
//       }
//     }, duration / steps);

//     return () => clearInterval(timer);
//   }, [amount]);

//   return (
//     <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
//       <div className="flex items-start justify-between">
//         <div>
          
//           <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
//           <p className={`text-2xl font-bold ${color}`}>
//             ₹ {count.toLocaleString('en-IN')}
//           </p>
//         </div>
       
//       </div>
//     </div>
//   );
// };

// const BarChart = ({ data }) => {
//   const maxValue = Math.max(...data.map(d => d.value));
  
//   return (
//     <div className="w-full h-full">
//       <div className="flex items-end justify-between h-48 px-6 pb-4">
//         {data.map((item, index) => (
//           <div key={index} className="flex flex-col items-center flex-1 px-2">
//             <div className="relative flex flex-col items-center group">
//               <div 
//                 className="w-12 rounded-t-lg transition-all duration-500 hover:w-16"
//                 style={{
//                   height: `${(item.value / maxValue) * 80}%`,
//                   backgroundColor: item.color,
//                   minHeight: '20px'
//                 }}
//               >
//                 <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
//                   {item.label}: ₹{item.value.toLocaleString('en-IN')}
//                 </div>
//               </div>
//               <span className="mt-3 text-sm font-medium text-gray-600">
//                 {item.label}
//               </span>
//               <span className="text-xs text-gray-500">
//                 {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const UserDashboard = () => {
//   const [summary, setSummary] = useState({
//     total_profit: 0,
//     total_loss: 0,
//     total_withdrawal: 0,
//     final_balance: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLedger = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `${API_BASE_URL}/wallet/wallet/ledger`,
//           {
//             method: "GET",
//             credentials: "include",
//           }
//         );

//         const data = await res.json();

//         if (data.success && data.summary) {
//           setSummary(data.summary);
//         }
//       } catch (error) {
//         console.error("Failed to fetch dashboard wallet data", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLedger();
//   }, []);


//   if (loading) {
//     return (
//       <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {[1,2,3,4].map(i => (
//               <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
//             ))}
//           </div>
//           <div className="bg-white rounded-2xl p-6 h-[300px]"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview</p>
//         </div>
//         <div className="text-sm text-gray-500">
//           Last updated: {new Date().toLocaleDateString('en-IN', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric'
//           })}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Total Profit"
//           amount={summary.total_profit}
//           color="text-green-600"
          
//         />
//         <StatCard
//           title="Total Loss"
//           amount={summary.total_loss}
//           color="text-red-600"
         
//         />
//         <StatCard
//           title="Total Withdraw"
//           amount={summary.total_withdrawal}
//           color="text-gray-700"
          
//         />
//         <StatCard
//           title="Wallet Balance"
//           amount={summary.final_balance}
//           color="text-blue-600"
          
//         />
//       </div>


//       <RecentMovement/>

    

//     </div>
//   );
// };

// export default UserDashboard;


import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
} from "lucide-react";
import RecentMovement from "./RecentMovement";
import WelcomeModal from "../WelcomeModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================= STAT CARD ================= */
const StatCard = ({ title, amount, icon: Icon, gradient, textColor }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;

    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg bg-gradient-to-br ${gradient}
      hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10"></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>
            ₹ {count.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white/20">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

/* ================= DASHBOARD ================= */
const UserDashboard = () => {
  const [summary, setSummary] = useState({
    total_profit: 0,
    total_loss: 0,
    total_withdrawal: 0,
    final_balance: 0,
  });
  const [loading, setLoading] = useState(true);

    /* 🔹 WELCOME DIALOG STATE */
  const [showWelcome, setShowWelcome] = useState(false);

  /* 🔹 SHOW WELCOME ONLY AFTER LOGIN */
  useEffect(() => {
    const seen = sessionStorage.getItem("welcome_seen");
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeContinue = () => {
    sessionStorage.setItem("welcome_seen", "1");
    setShowWelcome(false);
  };


  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/wallet/wallet/ledger`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success && data.summary) {
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, []);

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse">
        <div className="h-8 w-48 bg-gray-300 rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-300"></div>
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-300"></div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Your wallet performance at a glance
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Updated on{" "}
          <span className="font-medium">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Profit"
          amount={summary.total_profit}
          icon={TrendingUp}
          gradient="from-emerald-500 to-green-600"
          textColor="text-white"
        />

        <StatCard
          title="Total Loss"
          amount={summary.total_loss}
          icon={TrendingDown}
          gradient="from-rose-500 to-red-600"
          textColor="text-white"
        />

        <StatCard
          title="Total Withdrawal"
          amount={summary.total_withdrawal}
          icon={Download}
          gradient="from-slate-600 to-gray-700"
          textColor="text-white"
        />

        <StatCard
          title="Wallet Balance"
          amount={summary.final_balance}
          icon={Wallet}
          gradient="from-indigo-500 to-blue-600"
          textColor="text-white"
        />
      </div>

      {/* RECENT MOVEMENTS */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <RecentMovement />
      </div>
    </div>
         {/* ================= WELCOME DIALOG ================= */}
      <WelcomeModal
        open={showWelcome}
        onContinue={handleWelcomeContinue}
      />
      </>
  );
};

export default UserDashboard;
