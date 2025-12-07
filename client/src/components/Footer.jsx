const Footer = () => (
  <footer className="bg-gray-900 text-white mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-bold mb-4">Vietravelasia</h4>
          <p className="text-gray-400 text-sm">
            Chuyên gia du lịch trải nghiệm cao cấp khắp châu Á. Được tin tưởng bởi
            hơn 1 triệu khách hàng.
          </p>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Dịch vụ</h5>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Tour trọn gói</li>
            <li>Combo nghỉ dưỡng</li>
            <li>Team building doanh nghiệp</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Hỗ trợ</h5>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Hotline: 1900 1868</li>
            <li>Email: care@vietravelasia.com</li>
            <li>24/7 WhatsApp</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold mb-4">Chi nhánh</h5>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Hà Nội</li>
            <li>TP.HCM</li>
            <li>Đà Nẵng</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Vietravelasia. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
