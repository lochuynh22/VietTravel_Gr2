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
    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(clearError());
        setMessage('');
        setErrors({});
        // Clear form when switching modes
        setForm({ name: '', email: '', password: '' });
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

    const validateForm = () => {
        const newErrors = {};
        
        if (mode === 'register') {
            if (!form.name || form.name.trim() === '') {
                newErrors.name = 'Vui lòng nhập họ tên';
            } else if (form.name.trim().length < 2) {
                newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
            }
        }
        
        if (!form.email || form.email.trim() === '') {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        if (!form.password || form.password === '') {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (form.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        setErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        // Clear error when user starts typing
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrors({});
        
        // Validate form
        const { isValid, errors: validationErrors } = validateForm();
        if (!isValid) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }
        
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
                setErrors({});
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {errors.name}
                                </p>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠</span>
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                            className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠</span>
                                {errors.password}
                            </p>
                        )}
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
