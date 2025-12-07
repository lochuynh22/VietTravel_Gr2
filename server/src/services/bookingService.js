import Booking from '../models/Booking.js';
import Schedule from '../models/Schedule.js';
import Tour from '../models/Tour.js';

/**
 * Calculate available seats for a schedule
 * seatsAvailable = seatsTotal - sum(confirmed bookings travelers)
 */
export const calculateAvailableSeats = async (scheduleId) => {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return null;

    const confirmedBookings = await Booking.find({
        scheduleId,
        status: 'confirmed',
    });

    const confirmedTravelers = confirmedBookings.reduce(
        (sum, booking) => sum + (booking.travelers || 0),
        0
    );

    return schedule.seatsTotal - confirmedTravelers;
};

/**
 * Validate booking creation
 */
export const validateBookingCreation = async (tourId, scheduleId, travelers) => {
    // Check if schedule exists and belongs to tour
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
        throw new Error('Lịch khởi hành không hợp lệ');
    }

    if (schedule.tourId.toString() !== tourId.toString()) {
        throw new Error('Lịch khởi hành không thuộc tour này');
    }

    // Check if schedule date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
        throw new Error('Không thể đặt tour với lịch khởi hành đã qua ngày');
    }

    // Check available seats
    const availableSeats = await calculateAvailableSeats(scheduleId);
    if (availableSeats < travelers) {
        throw new Error('Số ghế không đủ');
    }

    return schedule;
};

/**
 * Calculate total amount for booking
 */
export const calculateTotalAmount = async (tourId, travelers) => {
    const tour = await Tour.findById(tourId);
    if (!tour) {
        throw new Error('Tour không tồn tại');
    }

    const price = tour.salePrice || tour.price;
    return price * travelers;
};

/**
 * Handle booking status change and seat management
 */
export const handleBookingStatusChange = async (bookingId, newStatus, oldStatus) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new Error('Booking không tồn tại');
    }

    // pending -> confirmed: Subtract seats
    if (oldStatus === 'pending' && newStatus === 'confirmed') {
        const availableSeats = await calculateAvailableSeats(booking.scheduleId);
        if (availableSeats < booking.travelers) {
            throw new Error('Số ghế không đủ để duyệt đơn này');
        }
        // Seats are managed by calculation, no need to update schedule
    }

    // confirmed -> cancelled: Return seats (handled by calculation)
    // pending -> cancelled: Do nothing (seats were never subtracted)
    // The seatsAvailable is always calculated from confirmed bookings,
    // so we don't need to manually update schedule

    return booking;
};

