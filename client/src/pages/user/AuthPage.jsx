import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginAccount, registerAccount } from '../../apis/authApi.js';
import { clearError, logout } from '../../slices/authSlice.js';

const AuthPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isLoading, isError, errorMessage } = useSelector((state) => state.auth);
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        dispatch(clearError());
        setMessage('');
    }, [dispatch, mode]);

    useEffect(() => {
        if (isError && errorMessage) {
            setMessage(errorMessage);
            toast.error(errorMessage);
        }
    }, [isError, errorMessage]);

    if (user) {
        return (
            <section className="container mx-auto px-4 py-12">
                <div className="card max-w-md mx-auto text-center">
                    <p className="mb-4 text-gray-600">Bạn đã đăng nhập. Truy cập dashboard để xem đơn.</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        Vào lịch sử đặt
                    </button>
                </div>
            </section>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (mode === 'login') {
                await dispatch(loginAccount({ email: form.email, password: form.password })).unwrap();
                const successMsg = 'Đăng nhập thành công!';
                setMessage(successMsg);
                toast.success(successMsg);
                setTimeout(() => navigate('/tours'), 1000);
            } else {
                await dispatch(registerAccount({ name: form.name, email: form.email, password: form.password })).unwrap();
                // Xóa user khỏi state và localStorage sau khi đăng ký để yêu cầu đăng nhập
                dispatch(logout());
                localStorage.removeItem('currentAccount');
                const successMsg = 'Đăng ký thành công! Vui lòng đăng nhập.';
                setMessage(successMsg);
                toast.success(successMsg);
                // Chuyển sang chế độ đăng nhập sau khi đăng ký thành công
                setForm({ ...form, name: '', password: '' }); // Xóa name và password, giữ lại email
                setTimeout(() => setMode('login'), 1000);
            }
        } catch (err) {
            // Error handled by message in useEffect
            const errorMsg = err?.message || errorMessage || 'Đã xảy ra lỗi.';
            toast.error(errorMsg);
        }
    };

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="card max-w-md mx-auto">
                {message && (
                    <div className={`info-box ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
                <div className="mb-6">
                    <p className="text-primary-600 text-sm font-medium mb-2">Tài khoản Vietravelasia</p>
                    <h2 className="text-2xl font-bold mb-2">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
                    <p className="text-gray-600 text-sm">
                        Nhận ưu đãi riêng, theo dõi đơn và gợi ý tour tùy chỉnh.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                            <input
                                className="input-field"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            className="input-field"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            className="input-field"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                    <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 font-medium bg-transparent border-none cursor-pointer"
                        onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
                    >
                        {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                </p>
            </div>
        </section>
    );
};

export default AuthPage;
