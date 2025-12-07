import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { logout } from '../slices/authSlice.js';

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/tours', label: 'Tour' },
  { path: '/dashboard', label: 'Lịch sử' },
  { path: '/admin', label: 'Quản trị' },
];

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      dispatch(logout());
      toast.success('Đã đăng xuất thành công!');
      return;
    }
    navigate('/auth');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-xl font-bold text-primary-600">Vietravelasia</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`
                }>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:block text-sm text-gray-600">
                Xin chào, {user.name}
              </span>
            )}
            <button className="btn-primary text-sm" onClick={handleAuthClick}>
              {user ? 'Đăng xuất' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
