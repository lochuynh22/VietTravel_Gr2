import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardBookingCard from '../../components/DashboardBookingCard.jsx';
import { fetchBookings, cancelBooking } from '../../apis/bookingApi.js';
import { clearBookings } from '../../slices/bookingSlice.js';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading } = useSelector((state) => state.booking);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Clear bookings cũ trước khi fetch bookings mới của user hiện tại
      const userId = user.id || user._id;
      if (userId) {
        dispatch(clearBookings());
        dispatch(fetchBookings({ userId }));
      }
    } else {
      // Clear bookings khi không có user (đã logout hoặc chưa đăng nhập)
      dispatch(clearBookings());
    }
  }, [dispatch, user?.id || user?._id]); // Chỉ re-fetch khi user.id thay đổi

  if (!user) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="card text-center">
          <p className="text-gray-600">Bạn cần đăng nhập để xem lịch sử đặt tour.</p>
        </div>
      </section>
    );
  }

  const handleCancel = async (booking) => {
    setMessage('');
    try {
      await dispatch(cancelBooking({ id: booking.id, note: 'Khách yêu cầu hủy' })).unwrap();
      const successMsg = 'Đã gửi yêu cầu hủy tour. Vietravelasia sẽ xác nhận.';
      setMessage(successMsg);
      toast.success(successMsg);
      const userId = user.id || user._id;
      dispatch(fetchBookings({ userId }));
    } catch (err) {
      const errorMsg = err.message || 'Không thể hủy.';
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <section className="container mx-auto px-4 py-12">
      {message && (
        <div className={`info-box ${message.includes('thành công') || message.includes('Đã gửi') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <div className="mb-8">
        <p className="text-primary-600 text-sm font-medium mb-2">Xin chào {user.name}</p>
        <h2 className="text-3xl font-bold text-gray-900">Đơn của bạn</h2>
      </div>
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải đơn...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <DashboardBookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">Chưa có đơn nào. Bắt đầu đặt tour ngay!</p>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
