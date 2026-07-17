export default function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card" style={{ borderColor: accent }}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
