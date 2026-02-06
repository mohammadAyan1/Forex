import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [showResend, setShowResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate(); // ✅ added

  // ⏱️ Timer Logic
  useEffect(() => {
    if (timer <= 0) {
      setShowResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // 📩 Send OTP
  const handleSendOtp = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(30);
      setShowResend(false);
      alert("OTP sent to your email");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // 🔁 Resend OTP
  const handleResendOtp = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/forget-resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to resend OTP");
        return;
      }

      setTimer(30);
      setShowResend(false);
      alert("OTP resent successfully");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // 🔐 Reset Password
  const handleResetPassword = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("Password reset successfully");
      navigate("/login"); // ✅ redirect added
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative px-4">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-crypto-purple mb-2">
          Reset Password
        </h1>

        <p className="text-gray-300 mb-8">
          Enter your email to receive OTP
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/10 text-gray-300 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-crypto-purple"
        />

        {!otpSent && (
          <button
            onClick={handleSendOtp}
            className="w-full mb-5 bg-crypto-purple hover:bg-crypto-dark-purple text-gray-300 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            SEND OTP
          </button>
        )}

        {otpSent && (
          <>
            {/* OTP */}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg bg-white/10 text-gray-300 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-crypto-purple"
            />

            {/* New Password */}
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-lg bg-white/10 text-gray-300 placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-crypto-purple"
            />

            {/* Timer / Resend */}
            {!showResend ? (
              <p className="text-sm text-gray-400 mb-4">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-sm text-crypto-purple mb-4 hover:text-white transition"
              >
                Resend OTP
              </button>
            )}

            {/* Reset */}
            <button
              onClick={handleResetPassword}
              className="w-full bg-crypto-purple hover:bg-crypto-dark-purple text-gray-300 hover:text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              RESET PASSWORD
            </button>
          </>
        )}

        <p className="text-center text-gray-300 mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-crypto-purple hover:text-white transition"
            target="_blank" rel="noopener noreferrer"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
