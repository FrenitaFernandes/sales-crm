import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ProjectConversationChart = () => {
  const data = useMemo(
    () => [
      { month: "Aug", calls: 14, emails: 28, meetings: 5 },
      { month: "Sep", calls: 18, emails: 34, meetings: 7 },
      { month: "Oct", calls: 22, emails: 30, meetings: 9 },
      { month: "Nov", calls: 16, emails: 26, meetings: 6 },
      { month: "Dec", calls: 20, emails: 38, meetings: 8 },
      { month: "Jan", calls: 24, emails: 42, meetings: 10 },
    ],
    []
  );

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => ({
          calls: acc.calls + item.calls,
          emails: acc.emails + item.emails,
          meetings: acc.meetings + item.meetings,
        }),
        { calls: 0, emails: 0, meetings: 0 }
      ),
    [data]
  );

  return (
    <div className="container-fluid px-4">
      <h2 className="mt-4 mb-3">Project Conversation Chart</h2>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Calls</div>
              <div className="h4 mb-0">{totals.calls}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Emails</div>
              <div className="h4 mb-0">{totals.emails}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Meetings</div>
              <div className="h4 mb-0">{totals.meetings}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-3" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="calls" stroke="#0d6efd" strokeWidth={2} />
            <Line type="monotone" dataKey="emails" stroke="#198754" strokeWidth={2} />
            <Line type="monotone" dataKey="meetings" stroke="#fd7e14" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProjectConversationChart;
