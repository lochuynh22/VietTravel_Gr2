import Booking from '../models/Booking.js';
import Schedule from '../models/Schedule.js';
import {
    validateBookingCreation,
    calculateTotalAmount,
    handleBookingStatusChange,
    calculateAvailableSeats,
} from '../services/bookingService.js';

export const getBookings = async (req, res) => {
    try {
        const { userId, status } = req.query;
        let query = {};

        if (userId) {
            query.userId = userId;
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('tourId')
            .populate('userId', 'name email')
            .populate('scheduleId', 'date seatsTotal')
            .sort({ createdAt: -1 });

        // Transform to match frontend format
        const transformedBookings = bookings.map((booking) => ({
            id: booking._id,
            _id: booking._id,
            tourId: booking.tourId?._id || booking.tourId,
            scheduleId: booking.scheduleId?._id || booking.scheduleId,
            userId: booking.userId?._id || booking.userId,
            travelers: booking.travelers,
            startDate: booking.startDate,
            totalAmount: booking.totalAmount,
            status: booking.status,
            note: booking.note,
            contact: booking.contact,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            tour: booking.tourId,
            user: booking.userId,
            schedule: booking.scheduleId,
        }));

        return res.json(transformedBookings);
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const createBooking = async (req, res) => {
    try {
        const { tourId, scheduleId, userId, travelers, contact } = req.body;

        // Validate required fields
        if (!tourId || !scheduleId || !userId || !travelers || !contact) {
            return res.status(400).json({
                ER: 1,
                EM: 'Thiếu thông tin bắt buộc: tourId, scheduleId, userId, travelers, contact',
            });
        }

        // Validate contact object
        if (!contact.fullName || !contact.email || !contact.phone) {
            return res.status(400).json({
                ER: 1,
                EM: 'Thiếu thông tin liên hệ: fullName, email, phone',
            });
        }

        // Validate travelers
        if (typeof travelers !== 'number' || travelers < 1) {
            return res.status(400).json({
                ER: 1,
                EM: 'Số lượng khách phải lớn hơn 0',
            });
        }

        // Validate booking creation (date, seats, schedule belongs to tour)
        await validateBookingCreation(tourId, scheduleId, travelers);

        // Calculate total amount
        const totalAmount = await calculateTotalAmount(tourId, travelers);

        // Get schedule for startDate
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({
                ER: 1,
                EM: 'Lịch khởi hành không tồn tại',
            });
        }

        // Create booking with status pending
        const booking = await Booking.create({
            tourId,
            scheduleId,
            userId,
            travelers,
            startDate: schedule.date,
            contact,
            totalAmount,
            status: 'pending',
            note: '',
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('tourId')
            .populate('userId', 'name email')
            .populate('scheduleId', 'date seatsTotal');

        return res.status(201).json({
            id: populatedBooking._id,
            _id: populatedBooking._id,
            ...populatedBooking.toObject(),
        });
    } catch (error) {
        // Handle validation errors from mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                ER: 1,
                EM: messages.join(', '),
            });
        }

        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                ER: 1,
                EM: `ID không hợp lệ: ${error.path}`,
            });
        }

        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi tạo booking',
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy booking',
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                ER: 1,
                EM: 'Đơn đã hủy trước đó',
            });
        }

        const oldStatus = booking.status;

        // Update booking status to cancelled
        booking.status = 'cancelled';
        if (note) booking.note = note;
        await booking.save();

        // Handle seat management (if confirmed -> cancelled, seats are returned automatically via calculation)
        // No manual seat update needed as seatsAvailable is calculated from confirmed bookings

        const populatedBooking = await Booking.findById(booking._id)
            .populate('tourId')
            .populate('userId', 'name email')
            .populate('scheduleId', 'date seatsTotal');

        return res.json({
            id: populatedBooking._id,
            _id: populatedBooking._id,
            ...populatedBooking.toObject(),
        });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy booking',
            });
        }

        const oldStatus = booking.status;

        // Validate status change
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                ER: 1,
                EM: 'Trạng thái không hợp lệ',
            });
        }

        // Handle booking status change and seat management
        await handleBookingStatusChange(booking._id, status, oldStatus);

        // Update booking
        booking.status = status;
        if (note !== undefined) booking.note = note;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('tourId')
            .populate('userId', 'name email')
            .populate('scheduleId', 'date seatsTotal');

        return res.json({
            id: populatedBooking._id,
            _id: populatedBooking._id,
            ...populatedBooking.toObject(),
        });
    } catch (error) {
        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi cập nhật booking',
        });
    }
};

