import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const conversationData = [
  { day: "Mon", messages: 12 },
  { day: "Tue", messages: 18 },
  { day: "Wed", messages: 10 },
  { day: "Thu", messages: 22 },
  { day: "Fri", messages: 30 },
  { day: "Sat", messages: 15 },
];

const ProjectConversationChart = () => {
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">
        Project Conversation Chart
      </h1>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={conversationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="messages"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectConversationChart;
