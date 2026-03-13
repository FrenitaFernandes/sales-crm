import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/auth-pages.css";

const phoneLength = {
  "+91": 10,
  "+1": 10,
  "+44": 10,
  "+971": 9,
  "+61": 9,
  "+49": 11,
  "+33": 9,
  "+39": 10,
  "+34": 9,
  "+81": 10,
  "+65": 8,
  "+60": 9,
  "+27": 9,
  "+966": 9,
};

const phoneExample = {
  "+91": "7365727988",
  "+1": "4155552671",
  "+44": "7700900123",
  "+971": "501234567",
  "+61": "412345678",
  "+49": "15123456789",
  "+33": "612345678",
  "+39": "3123456789",
  "+34": "612345678",
  "+81": "9012345678",
  "+65": "81234567",
  "+60": "123456789",
  "+27": "821234567",
  "+966": "512345678",
};

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const requiredLength = phoneLength[countryCode];
  const formattedPhoneValue = `${countryCode} ${phone}`;

  const handlePhoneChange = (e) => {
    const raw = String(e.target.value || "");
    const escapedCode = countryCode.replace("+", "\\+");
    const withoutCode = raw.replace(new RegExp(`^\\s*${escapedCode}\\s*`), "");
    const digitsOnly = withoutCode.replace(/\D/g, "").slice(0, requiredLength);
    setPhone(digitsOnly);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (password !== confirmPassword) {
      setIsSuccess(false);
      setMessage("Passwords do not match!");
      return;
    }
    if (phone.length !== requiredLength) {
      setIsSuccess(false);
      setMessage(
        `Phone number must be exactly ${requiredLength} digits for ${countryCode}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await registerUser({
        name,
        email,
        phone: countryCode + phone,
        password,
      });

      setIsSuccess(true);
      setMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      setIsSuccess(false);
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <form
        onSubmit={handleRegister}
        className="auth-card"
      >
        <Link
          to="/"
          className="auth-back-link"
        >
          <FaArrowLeft size={12} /> Home
        </Link>

        <span className="auth-kicker">Create Account</span>

        <h2 className="auth-title">Customer Registration</h2>

        <p className="auth-subtitle">
          Set up your account to track projects, invoices, and support updates in one place.
        </p>

        {message && (
          <p className={`auth-message ${isSuccess ? "auth-message--success" : "auth-message--error"}`}>
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="auth-input auth-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="auth-input auth-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Phone */}
        <div className="auth-row">
          <select
            className="auth-select"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+91">India +91</option>
            <option value="+1">United States +1</option>
            <option value="+44">United Kingdom +44</option>
            <option value="+971">United Arab Emirates +971</option>
            <option value="+61">Australia +61</option>
            <option value="+49">Germany +49</option>
            <option value="+33">France +33</option>
            <option value="+39">Italy +39</option>
            <option value="+34">Spain +34</option>
            <option value="+81">Japan +81</option>
            <option value="+65">Singapore +65</option>
            <option value="+60">Malaysia +60</option>
            <option value="+27">South Africa +27</option>
            <option value="+966">Saudi Arabia +966</option>
          </select>

          <input
            type="text"
            placeholder={`${countryCode} ${phoneExample[countryCode]}`}
            className="auth-input"
            value={formattedPhoneValue}
            onChange={handlePhoneChange}
            maxLength={countryCode.length + 1 + requiredLength}
            required
          />
        </div>

        {/* Password */}
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
            {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="auth-input-wrap">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="auth-visibility-toggle"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit auth-submit--register disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
