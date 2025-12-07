import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Hero from '../../components/Hero.jsx';
import TourCard from '../../components/TourCard.jsx';
import StatCard from '../../components/StatCard.jsx';
import { fetchTours } from '../../apis/tourApi.js';

const HomePage = () => {
  const dispatch = useDispatch();
  const { tours, isLoading } = useSelector((state) => state.tour);

  useEffect(() => {
    dispatch(fetchTours());
  }, [dispatch]);

  return (
    <>
      <Hero />
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-primary-600 text-sm font-medium mb-2">Gợi ý cho bạn</p>
          <h2 className="text-3xl font-bold text-gray-900">Top tour Vietravelasia</h2>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.slice(0, 3).map((tour) => (
              <TourCard tour={tour} key={tour.id} />
            ))}
          </div>
        )}
      </section>
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="text-primary-600 text-sm font-medium mb-2">Ưu điểm</p>
            <h2 className="text-3xl font-bold text-gray-900">Lý do khách chọn Vietravelasia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="CSKH 24/7" value="Care+ Team" trend="Theo sát từng khách" />
            <StatCard label="99% lịch chạy" value="Đúng cam kết" trend="Không ghép đoàn" />
            <StatCard label="Bảo hiểm" value="1 tỷ VNĐ" trend="Chuẩn quốc tế" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
