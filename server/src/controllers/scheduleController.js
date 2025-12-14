import Schedule from '../models/Schedule.js';
import Tour from '../models/Tour.js';
import { calculateScheduleAvailableSeats } from '../services/tourService.js';

export const getSchedules = async (req, res) => {
    try {
        const { tourId } = req.query;
        let query = {};

        if (tourId) {
            query.tourId = tourId;
        }

        const schedules = await Schedule.find(query).populate('tourId', 'name');
        
        // Calculate available seats for each schedule
        const schedulesWithSeats = await Promise.all(
            schedules.map(async (schedule) => {
                const seatsAvailable = await calculateScheduleAvailableSeats(schedule._id);
                return {
                    id: schedule._id,
                    _id: schedule._id,
                    tourId: schedule.tourId,
                    date: schedule.date,
                    seatsTotal: schedule.seatsTotal,
                    seatsAvailable,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                };
            })
        );

        return res.json(schedulesWithSeats);
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const { tourId, date, seatsTotal } = req.body;

        // Validate tour exists
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                ER: 1,
                EM: 'Tour không tồn tại',
            });
        }

        const schedule = await Schedule.create({
            tourId,
            date,
            seatsTotal,
        });

        // Return with calculated seatsAvailable
        const seatsAvailable = await calculateScheduleAvailableSeats(schedule._id);
        return res.status(201).json({
            id: schedule._id,
            _id: schedule._id,
            tourId: schedule.tourId,
            date: schedule.date,
            seatsTotal: schedule.seatsTotal,
            seatsAvailable,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
        });
    } catch (error) {
        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi tạo lịch khởi hành',
        });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('tourId', 'name');

        if (!schedule) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy lịch khởi hành',
            });
        }

        // Return with calculated seatsAvailable
        const seatsAvailable = await calculateScheduleAvailableSeats(schedule._id);
        return res.json({
            id: schedule._id,
            _id: schedule._id,
            tourId: schedule.tourId,
            date: schedule.date,
            seatsTotal: schedule.seatsTotal,
            seatsAvailable,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
        });
    } catch (error) {
        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi cập nhật lịch khởi hành',
        });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy lịch khởi hành',
            });
        }

        return res.json({ message: 'Xóa lịch khởi hành thành công' });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

