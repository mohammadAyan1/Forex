import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
    password: "",
    pan_number: "",
    aadhaar_number: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_branch: "",
    account_holder_name: "",
  });

  const [panImage, setPanImage] = useState(null);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [bankPassbookImage, setBankPassbookImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      payload.append("pan_image", panImage);
      payload.append("aadhaar_image", aadhaarImage);
      payload.append("bank_passbook_image", bankPassbookImage);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!data.success) {
        alert("Registration failed");
        return;
      }

      // ✅ store email for verification
      localStorage.setItem("verify_email", formData.email);

      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex py-4 items-center justify-center bg-gradient-hero relative px-4">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full max-w-lg bg-black/60 backdrop-blur-xl rounded-2xl p-7 shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-crypto-purple mb-2">
          New Here? Create an Account
        </h1>
        <p className="text-gray-300 mb-8">
          Enter Your Credentials To Create Your Account
        </p>

        <input name="name" placeholder="Full Name" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="email" placeholder="Email" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="mobile" placeholder="Mobile Number" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="username" placeholder="User Name" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="pan_number" placeholder="PAN Number" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="aadhaar_number" placeholder="Aadhaar Number" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="bank_account_number" placeholder="Bank Account Number" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="bank_ifsc_code" placeholder="IFSC Code" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="bank_branch" placeholder="Bank Branch" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <input name="account_holder_name" placeholder="Account Holder Name" onChange={handleChange}
          className="w-full mb-5 px-4 py-3 rounded-lg bg-white/10 text-gray-300" />

        <div className="relative mb-5">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 text-gray-300"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="space-y-5">
          {/* PAN Card */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload PAN Card
            </label>
            <input
              type="file"
              onChange={(e) => setPanImage(e.target.files[0])}
              className="w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-purple-50 file:text-purple-700
                 hover:file:bg-purple-100"
            />
          </div>

          {/* Aadhaar Card */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload Aadhaar Card
            </label>
            <input
              type="file"
              onChange={(e) => setAadhaarImage(e.target.files[0])}
              className="w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-purple-50 file:text-purple-700
                 hover:file:bg-purple-100"
            />
          </div>

          {/* Bank Passbook */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload Bank Passbook / Cancelled Cheque
            </label>
            <input
              type="file"
              onChange={(e) => setBankPassbookImage(e.target.files[0])}
              className="w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-lg file:border-0
                 file:text-sm file:font-semibold
                 file:bg-purple-50 file:text-purple-700
                 hover:file:bg-purple-100"
            />
          </div>
        </div>


        <button onClick={handleRegister}
          className="w-full mt-4 bg-crypto-purple hover:bg-crypto-dark-purple text-gray-300 hover:text-white font-semibold py-3 rounded-lg">
          REGISTER
        </button>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-crypto-purple hover:text-white">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
