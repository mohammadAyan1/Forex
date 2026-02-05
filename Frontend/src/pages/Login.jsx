import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ for cookies
      });

      const result = await response.json();

      // ❌ Login failed
      if (!result.success) {
        alert(result.message || "Invalid credentials");
        return;
      }

      // ✅ Correct role access
      const { role } = result.data;

        // ✅ SAVE AUTH DATA (IMPORTANT)
    localStorage.setItem("user", JSON.stringify(result.data));
    localStorage.setItem("isLoggedIn", "true");

    
      // ✅ Role-based navigation
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/user/dashboard");
      } else {
        alert("Unauthorized role");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative px-4">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-crypto-purple mb-2">
          Get Started Now
        </h1>

        <p className="text-gray-300 mb-8">
          Enter Your Credentials To Login Your Account
        </p>

        <input
          type="email"
          placeholder="Enter Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-crypto-purple"
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-gray-300 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-crypto-purple"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* <div className="text-left mb-6">
          <Link
            to="/forgot-password"
            className="text-crypto-purple text-sm hover:text-white transition"
          >
            Forgot Password ?
          </Link>
        </div> */}

        <button
          onClick={handleLogin}
          className="w-full bg-crypto-purple hover:bg-crypto-dark-purple text-gray-300 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300"
        >
          LOGIN
        </button>

        <p className="text-center text-gray-300 mt-6">
          Don&apos;t have an account yet?{" "}
          <Link
            to="/signup"
            className="text-crypto-purple hover:text-white transition"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
