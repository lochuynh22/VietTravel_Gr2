import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-2">Vietravelasia Signature</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Khám phá châu Á theo cách tinh tế nhất
            </h1>
            <p className="text-primary-100 text-lg mb-6">
              Combo du lịch trọn gói, lịch trình chuẩn Vietravelasia, tư vấn 1-1 và
              dịch vụ chăm sóc khách hàng trọn hành trình.
            </p>
            <div className="flex gap-4 mb-8">
              <button className="btn-primary bg-white text-primary-600 hover:bg-gray-100" onClick={() => navigate('/tours')}>
                Xem tour hot
              </button>
              <button className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white/10" onClick={() => navigate('/admin')}>
                Dành cho Admin
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <strong className="block text-2xl font-bold">5000+</strong>
                <span className="text-sm text-primary-200">khách mỗi tháng</span>
              </div>
              <div>
                <strong className="block text-2xl font-bold">4.9/5</strong>
                <span className="text-sm text-primary-200">đánh giá trải nghiệm</span>
              </div>
              <div>
                <strong className="block text-2xl font-bold">28</strong>
                <span className="text-sm text-primary-200">điểm đến độc quyền</span>
              </div>
            </div>
          </div>
          <div className="card bg-white/10 backdrop-blur-sm border-white/20">
            <p className="text-primary-200 text-sm font-medium mb-2">Luxury pick</p>
            <h3 className="text-2xl font-bold mb-2">Bali Symphony 5N4Đ</h3>
            <p className="text-primary-100 mb-4">Mở bán tháng 12 - Ưu đãi 15%</p>
            <ul className="space-y-2 mb-6 text-primary-100">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-300 rounded-full"></span>
                Resort 5* Seminyak beachfront
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-300 rounded-full"></span>
                Private photographer 2 buổi
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-300 rounded-full"></span>
                Chăm sóc khách VIP 24/7
              </li>
            </ul>
            <button className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 w-full" onClick={() => navigate('/tours')}>
              Đặt chỗ ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
