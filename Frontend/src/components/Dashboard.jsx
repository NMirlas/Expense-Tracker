import { useEffect, useState } from "react";
import { getOverall, getMonthly } from "../api/expensesApi.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/*
 * helper function - builds chart data for "who spent per month"
 * takes monthly breakdown and returns:
 * chartData = [{ month: '2025-10', Noam: 300, Dana: 200 }, ...]
 * users = ['Noam', 'Dana', ...]
 */
function buildMonthlyByUser(monthlyRaw) {
  if (!monthlyRaw) return { chartData: [], users: [] };

  const usersSet = new Set();
  monthlyRaw.forEach((m) => (m.by_user || []).forEach((r) => usersSet.add(r.user)));

  const chartData = (monthlyRaw || []).map((m) => {
    const row = { month: m.month };
    (m.by_user || []).forEach((u) => {
      row[u.user] = u.total;
    });
    return row;
  });

  return { chartData, users: Array.from(usersSet) };
}

export default function Dashboard() {
  // overall stats (total, per month, per user, per type)
  const [stats, setStats] = useState(null);
  // detailed monthly breakdown for charts
  const [monthly, setMonthly] = useState(null);

  // fetch both overall and monthly stats on load
  useEffect(() => {
    (async () => {
      try {
        const [overallData, monthlyData] = await Promise.all([getOverall(), getMonthly()]);
        setStats(overallData);
        setMonthly(monthlyData);
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      }
    })();
  }, []);

  if (!stats) return <div style={{ padding: "24px" }}>Loading…</div>;

  // transform monthly breakdown to chart-friendly format
  const { chartData: monthlyByUserData, users: monthlyUsers } =
    buildMonthlyByUser(monthly || []);

  // different datasets for each chart
  const pieData = stats.expenses_per_type || [];
  const perUserData = stats.expenses_per_user || [];
  const perMonthData = stats.monthly_expenses || [];

  // color palette for charts
  const COLORS = [
    "#4e79a7",
    "#f28e2c",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
    "#ff9da7",
  ];

  // reusable card style for each chart box
  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
    minHeight: 360,
    display: "flex",
    flexDirection: "column",
  };

  // wrapper for charts to keep consistent height
  const chartWrap = { flex: 1, height: 300 };

  return (
    <div style={{ width: "100%", padding: "24px" }}>
      {/* header section with total spent card */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Analytics Dashboard</h2>
        <div style={{ ...card, minHeight: "auto", padding: "8px 12px" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Total Spent</span>
          <strong style={{ fontSize: 18 }}>
            ₪{Number(stats.total_expenses || 0).toFixed(2)}
          </strong>
        </div>
      </div>

      {/* grid layout - two charts per row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          width: "100%",
        }}
      >
        {/* pie chart: spending by category */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Spending by Category</h3>
          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="total"
                  nameKey="type"
                  outerRadius="80%"
                  label={({ name, value }) =>
                    `${name}: ₪${Number(value).toFixed(0)}`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₪${Number(v).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* bar chart: spending by user */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Spending by User</h3>
          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perUserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" name="Total Spent (₪)" fill="#4e79a7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* bar chart: spending by month */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Spending by Month</h3>
          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" name="Total Spent (₪)" fill="#59a14f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* stacked bar chart: who spent how much per month */}
        <div style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Who Spent per Month</h3>
          <div style={chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyByUserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toFixed(2)}`} />
                <Legend />
                {monthlyUsers.map((u, i) => (
                  <Bar
                    key={u}
                    dataKey={u}
                    name={`${u} (₪)`}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
