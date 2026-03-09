/*

import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );

      alert("OTP verified");
      navigate("/reset-password");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Verify OTP
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 mb-4 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Verify OTP
        </button>

        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 text-sm">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default VerifyOTP;
*/

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // if user navigated here without going through forgot-password
  if (!email) {
    // send them back to start
    navigate("/forgot-password");
    return null; // prevent rendering
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );

      setMessage("OTP verified successfully.");

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1200);

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Verify OTP
        </h2>

        {message && (
          <p className="text-center text-sm text-red-600 mb-3">
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 mb-4 border rounded"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Verify OTP
        </button>

        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-600 text-sm">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default VerifyOTP;