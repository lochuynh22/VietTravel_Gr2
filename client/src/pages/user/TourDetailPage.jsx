import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import BookingForm from '../../components/BookingForm.jsx';
import { fetchTourDetail } from '../../apis/tourApi.js';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTour, isLoading, isError } = useSelector((state) => state.tour);

  useEffect(() => {
    dispatch(fetchTourDetail(id));
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Đang tải thông tin tour...</p>
        </div>
      </section>
    );
  }

  if (isError || !currentTour) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy tour.</p>
          <button className="btn-primary" onClick={() => navigate('/tours')}>
            Quay lại danh sách
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <img
            className="w-full h-96 object-cover rounded-xl"
            src={currentTour.images?.[0] || currentTour.thumbnail || 'https://via.placeholder.com/800x400'}
            alt={currentTour.name}
          />
          <div>
            <p className="text-primary-600 text-sm font-medium mb-2">{currentTour.destination}</p>
            <h1 className="text-3xl font-bold mb-3">{currentTour.name}</h1>
            {currentTour.highlights && currentTour.highlights.length > 0 && (
              <p className="text-gray-600 mb-4">{currentTour.highlights.join(' • ')}</p>
            )}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-primary-600">
                {currentTour.salePrice?.toLocaleString() || currentTour.price?.toLocaleString()} đ
              </span>
              {currentTour.salePrice && currentTour.salePrice !== currentTour.price && (
                <span className="text-gray-400 line-through">
                  {currentTour.price.toLocaleString()} đ
                </span>
              )}
              <span className="text-gray-500">• {currentTour.durationDays} ngày</span>
            </div>
          </div>

          {currentTour.itinerary && currentTour.itinerary.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Lịch trình chi tiết</h3>
              <div className="space-y-4">
                {currentTour.itinerary.map((day) => (
                  <article key={day.day} className="card">
                    <h4 className="text-lg font-semibold mb-2">
                      Ngày {day.day}: {day.title}
                    </h4>
                    <p className="text-gray-600">{day.description}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {currentTour.policies && (
            <div>
              <h3 className="text-xl font-bold mb-4">Chính sách & lưu ý</h3>
              <ul className="card space-y-2">
                {currentTour.policies.deposit && (
                  <li className="flex gap-2">
                    <span className="font-medium">Đặt cọc:</span>
                    <span className="text-gray-600">{currentTour.policies.deposit}</span>
                  </li>
                )}
                {currentTour.policies.cancellation && (
                  <li className="flex gap-2">
                    <span className="font-medium">Hủy tour:</span>
                    <span className="text-gray-600">{currentTour.policies.cancellation}</span>
                  </li>
                )}
                {currentTour.policies.notes && (
                  <li className="flex gap-2">
                    <span className="font-medium">Ghi chú:</span>
                    <span className="text-gray-600">{currentTour.policies.notes}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <aside className="lg:sticky lg:top-20 h-fit">
          <BookingForm tour={currentTour} />
        </aside>
      </div>
    </section>
  );
};

export default TourDetailPage;
