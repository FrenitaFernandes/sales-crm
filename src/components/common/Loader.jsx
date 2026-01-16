// src/components/common/Loader.jsx
import "./Loader.css";

const Loader = ({
  size = "medium",
  message = "Loading...",
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    small: "loader-small",
    medium: "loader-medium",
    large: "loader-large",
  };

  const loaderClass = fullScreen ? "loader-fullscreen" : "";
  const overlayClass = overlay ? "with-overlay" : "";

  return (
    <div className={`loader-container ${loaderClass} ${overlayClass}`}>
      <div className={`loader ${sizeClasses[size] || sizeClasses.medium}`}>
        <div className="loader-spinner">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;
