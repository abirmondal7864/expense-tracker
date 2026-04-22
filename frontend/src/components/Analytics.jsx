import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Analytics = ({ expenses }) => {
  if (!expenses || expenses.length === 0) return null;

  // 1. Monthly Spending Logic
  const monthlyData = {};

  expenses.forEach((exp) => {
    const d = exp.date ? new Date(exp.date) : new Date();
    const month = d.toLocaleString("default", { month: "short" });
    monthlyData[month] = (monthlyData[month] || 0) + Number(exp.amount || 0);
  });

  const barData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: "Spending",
        data: Object.values(monthlyData),
        backgroundColor: "rgba(42, 137, 106, 0.75)",
        borderColor: "#2a896a",
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: "#1f7a5d",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  // 2. Category Breakdown Logic
  const categoryData = {};

  expenses.forEach((exp) => {
    const cat = exp.category || "General";
    categoryData[cat] = (categoryData[cat] || 0) + Number(exp.amount || 0);
  });

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: "Category Breakdown",
        data: Object.values(categoryData),
        backgroundColor: [
          "#2a896a", 
          "#f2b2b2", 
          "#cfc070", 
          "#1f7a5d", 
          "#d94b4b", 
          "#66726c", 
          "#cad6cf",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  // 3. Render Charts
  return (
    <section className="analytics-section" style={{ marginBottom: "28px" }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Analytics</h2>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="summary-tile" style={{ display: "block", minHeight: "300px" }}>
          <h4 style={{ marginBottom: "16px", color: "#66726c", fontWeight: '700' }}>Monthly Spent</h4>
          <div style={{ height: "230px", position: "relative", width: "100%" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="summary-tile" style={{ display: "block", minHeight: "300px" }}>
          <h4 style={{ marginBottom: "16px", color: "#66726c", fontWeight: '700' }}>By Category</h4>
          <div style={{ height: "230px", position: "relative", width: "100%" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
