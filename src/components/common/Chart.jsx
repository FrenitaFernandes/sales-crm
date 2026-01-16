// src/components/common/Chart.jsx
import { useState } from "react";
import { MdRefresh } from "react-icons/md";

const Chart = ({
  title,
  type = "bar",
  data = null,
  height = 300,
  onRefresh,
  loading = false,
  stats = null,
  description,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Generate simple bar/line chart representation
  const renderChartPreview = () => {
    if (data && Array.isArray(data) && data.length > 0) {
      return (
        <div className="chart-preview">
          {data.map((item, idx) => (
            <div key={idx} className="chart-bar-item">
              <div className="chart-bar-label">{item.label}</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px`,
                    backgroundColor: item.color || "#2563eb",
                  }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="chart-bar-value">{item.value}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <div className="chart-title-section">
          <h5 className="chart-title">{title}</h5>
          {description && <p className="chart-description">{description}</p>}
        </div>
        {onRefresh && (
          <button
            className="chart-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh chart"
          >
            <MdRefresh size={18} className={refreshing ? "spinning" : ""} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <div className="chart-container" style={{ height: `${height}px` }}>
            {renderChartPreview()}
            {!data && (
              <div className="chart-placeholder">
                <p>No chart data available</p>
                <small>Configure chart data to display visualization</small>
              </div>
            )}
          </div>

          {stats && (
            <div className="chart-stats">
              {Object.entries(stats).map(([label, value]) => (
                <div key={label} className="chart-stat-item">
                  <span className="chart-stat-label">{label}</span>
                  <span className="chart-stat-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Chart;
