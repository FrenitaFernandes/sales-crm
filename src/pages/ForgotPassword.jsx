import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgot = (e) => {
    e.preventDefault();
    alert("Password reset email/OTP will be added later");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleForgot}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Send OTP / Reset Link
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You will receive an email with instructions.
        </p>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
