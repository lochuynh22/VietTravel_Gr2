import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createBooking } from '../apis/bookingApi.js';

const BookingForm = ({ tour, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.booking);
  const [message, setMessage] = useState('');

  // Format date to dd/mm/yy
  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Filter out past schedules
  const getValidSchedules = () => {
    if (!tour?.schedules || tour.schedules.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tour.schedules.filter((schedule) => {
      if (!schedule.date) return false;
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    });
  };

  const validSchedules = getValidSchedules();
  const firstValidScheduleId = validSchedules[0]?.id || validSchedules[0]?._id || '';

  const [form, setForm] = useState({
    scheduleId: firstValidScheduleId,
    travelers: 2,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  useEffect(() => {
    if (tour || user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({
        ...prev,
        scheduleId: firstValidScheduleId || prev.scheduleId,
        fullName: user?.name || prev.fullName,
        email: user?.email || prev.email,
      }));
    }
  }, [tour, user, firstValidScheduleId]);

  if (!user) {
    return (
      <div className="card bg-primary-50 border-primary-200">
        <p className="text-primary-700">Đăng nhập để đặt tour và giữ chỗ nhanh.</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validate IDs
    const tourId = tour?.id || tour?._id;
    const userId = user?.id || user?._id;
    const scheduleId = form.scheduleId;
    
    if (!tourId) {
      const errorMsg = 'Không tìm thấy thông tin tour. Vui lòng thử lại.';
      setMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!userId) {
      const errorMsg = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      setMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!scheduleId) {
      const errorMsg = 'Vui lòng chọn lịch khởi hành.';
      setMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (!form.fullName || !form.email || !form.phone) {
      const errorMsg = 'Vui lòng điền đầy đủ thông tin liên hệ.';
      setMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    try {
      await dispatch(
        createBooking({
          tourId,
          scheduleId,
          userId,
          travelers: Number(form.travelers),
          contact: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
        })
      ).unwrap();
      const successMsg = 'Đặt tour thành công! Chúng tôi sẽ liên hệ trong 1h.';
      setMessage(successMsg);
      toast.success(successMsg);
      onSuccess?.();
    } catch (err) {
      const errorMsg = err?.message || err || 'Không thể đặt tour.';
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h4 className="text-xl font-bold mb-4">Giữ chỗ ngay</h4>
      {message && (
        <div className={`info-box ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lịch khởi hành
          </label>
          {validSchedules.length === 0 ? (
            <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed">
              {tour.schedules && tour.schedules.length > 0
                ? 'Không còn lịch khởi hành nào trong tương lai'
                : 'Chưa có lịch khởi hành cho tour này'}
            </div>
          ) : (
            <select
              className="input-field"
              value={form.scheduleId}
              onChange={(e) => handleChange('scheduleId', e.target.value)}
              required
            >
              <option value="">-- Chọn lịch khởi hành --</option>
              {validSchedules.map((schedule) => {
                const scheduleId = schedule.id || schedule._id;
                return (
                  <option key={scheduleId} value={scheduleId}>
                    {formatDate(schedule.date)} • Còn {schedule.seatsAvailable} chỗ
                  </option>
                );
              })}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số khách</label>
          <input
            className="input-field"
            type="number"
            min="1"
            max="40"
            value={form.travelers}
            onChange={(e) => handleChange('travelers', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input
            className="input-field"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            className="input-field"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            className="input-field"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>
        <button
          className="btn-primary w-full"
          disabled={isLoading || validSchedules.length === 0 || !form.scheduleId}>
          {isLoading ? 'Đang giữ chỗ...' : 'Đặt tour'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
