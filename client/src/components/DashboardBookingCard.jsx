const statusMap = {
  pending: 'Chờ duyệt',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const DashboardBookingCard = ({ booking, onCancel }) => (
  <article className="card flex items-center justify-between">
    <div className="flex-1">
      <p className="text-primary-600 text-xs font-medium mb-1">{booking.tour?.destination}</p>
      <h4 className="text-lg font-semibold mb-2">{booking.tour?.name}</h4>
      <p className="text-gray-600 text-sm mb-2">
        Khởi hành {booking.startDate} • {booking.travelers} khách
      </p>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[booking.status] || booking.status}
      </span>
    </div>
    <div className="flex flex-col items-end gap-3">
      <p className="text-xl font-bold text-primary-600">
        {booking.totalAmount?.toLocaleString()} đ
      </p>
      {booking.status === 'pending' && (
        <button className="btn-ghost text-sm" onClick={() => onCancel?.(booking)}>
          Hủy đơn
        </button>
      )}
    </div>
  </article>
);

export default DashboardBookingCard;
