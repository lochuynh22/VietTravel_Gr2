const StatCard = ({ label, value, trend }) => (
  <div className="card text-center">
    <p className="text-gray-500 text-sm mb-2">{label}</p>
    <strong className="block text-3xl font-bold text-gray-900 mb-1">{value}</strong>
    {trend && <span className="text-gray-400 text-xs">{trend}</span>}
  </div>
);

export default StatCard;
