import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth-pages.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser({ email, password });

      setMessage("Login successful!");

      // SAVE TOKEN
      localStorage.setItem("token", data.token);

      // SAVE USER ROLE
      const role = data.user.role;
      localStorage.setItem("userRole", role);

      // SAVE USER DATA (IMPORTANT FOR PROFILE PAGE)
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin/sales/dashboard");
        } else if (role === "customer") {
          navigate("/customer/dashboard");
        }
      }, 800);

    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page auth-page--login">
      
      <form
        onSubmit={handleLogin}
        className="auth-card"
      >

        {/* BACK BUTTON */}
        <Link
          to="/"
          className="auth-back-link"
        >
          <FaArrowLeft size={12} /> Home
        </Link>

        <span className="auth-kicker">Welcome Back</span>

        <h2 className="auth-title">Login</h2>

        <p className="auth-subtitle">
          Access your sales and CRM workspace with your registered account.
        </p>

        {/* MESSAGE */}
        {message && (
          <p
            className={`auth-message ${
              message.includes("failed")
                ? "auth-message--error"
                : "auth-message--success"
            }`}
          >
            {message}
          </p>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="auth-input auth-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <div className="auth-input-wrap">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="auth-visibility-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEye size={18} />
            ) : (
              <FaEyeSlash size={18} />
            )}
          </button>

        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="auth-submit auth-submit--login"
        >
          Login
        </button>

        {/* FORGOT PASSWORD */}
        <div className="auth-links">
          <Link
            to="/forgot-password"
            className="auth-inline-link"
          >
            Forgot Password?
          </Link>
        </div>

        {/* REGISTER */}
        <p className="auth-footer">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="auth-footer-link"
          >
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}

export default Login;