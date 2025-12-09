import User from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                ER: 1,
                EM: 'Email đã được sử dụng',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'customer',
        });

        return res.status(201).json({
            ER: 0,
            EM: 'Đăng ký tài khoản thành công',
            user: user.toJSON(),
        });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                ER: 1,
                EM: 'Tài khoản hoặc mật khẩu không chính xác',
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                ER: 1,
                EM: 'Tài khoản hoặc mật khẩu không chính xác',
            });
        }

        return res.json({
            ER: 0,
            EM: 'Đăng nhập thành công',
            user: user.toJSON(),
        });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy người dùng',
            });
        }

        return res.json({
            ER: 0,
            user: user.toJSON(),
        });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

