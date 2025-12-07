import Tour from '../models/Tour.js';
import Schedule from '../models/Schedule.js';
import Booking from '../models/Booking.js';

/**
 * Filter out past schedules
 */
export const filterValidSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedules.filter((schedule) => {
        if (!schedule.date) return false;
        const scheduleDate = new Date(schedule.date);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
    });
};

/**
 * Calculate available seats for a schedule
 */
export const calculateScheduleAvailableSeats = async (scheduleId) => {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return 0;

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
 * Enrich tour with schedules and calculate available seats
 */
export const enrichTourWithSchedules = async (tour) => {
    const schedules = await Schedule.find({ tourId: tour._id });
    const validSchedules = filterValidSchedules(schedules);

    const schedulesWithSeats = await Promise.all(
        validSchedules.map(async (schedule) => {
            const seatsAvailable = await calculateScheduleAvailableSeats(schedule._id);
            return {
                id: schedule._id,
                _id: schedule._id,
                date: schedule.date,
                seatsTotal: schedule.seatsTotal,
                seatsAvailable,
                tourId: schedule.tourId,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            };
        })
    );

    return {
        ...tour.toObject(),
        id: tour._id,
        schedules: schedulesWithSeats,
    };
};

/**
 * Filter tours by search keyword
 */
export const filterToursBySearch = (tours, searchKeyword) => {
    if (!searchKeyword || !searchKeyword.trim()) return tours;

    const searchLower = searchKeyword.toLowerCase().trim();
    return tours.filter((tour) => {
        const nameMatch = tour.name?.toLowerCase().includes(searchLower);
        const destinationMatch = tour.destination?.toLowerCase().includes(searchLower);
        const regionMatch = tour.region?.toLowerCase().includes(searchLower);
        const highlightsMatch = tour.highlights?.some((h) =>
            h.toLowerCase().includes(searchLower)
        );
        return nameMatch || destinationMatch || regionMatch || highlightsMatch;
    });
};

/**
 * Filter tours by duration
 */
export const filterToursByDuration = (tours, durationFilter) => {
    if (!durationFilter) return tours;

    const [minDuration, maxDuration] = durationFilter.split('-').map(Number);
    return tours.filter(
        (tour) =>
            tour.durationDays >= minDuration && tour.durationDays <= maxDuration
    );
};

