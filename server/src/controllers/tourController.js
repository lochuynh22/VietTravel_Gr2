import Tour from '../models/Tour.js';
import {
    enrichTourWithSchedules,
    filterToursBySearch,
    filterToursByDuration,
} from '../services/tourService.js';

export const getTours = async (req, res) => {
    try {
        const { destination, minPrice, maxPrice, duration, search } = req.query;

        // Build query
        let query = {};

        if (destination) {
            query.destination = { $regex: destination, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Get all tours
        let tours = await Tour.find(query);

        // Filter by search keyword
        if (search) {
            tours = filterToursBySearch(tours, search);
        }

        // Filter by duration
        if (duration) {
            tours = filterToursByDuration(tours, duration);
        }

        // Enrich with schedules and calculate available seats
        const enrichedTours = await Promise.all(
            tours.map((tour) => enrichTourWithSchedules(tour))
        );

        return res.json(enrichedTours);
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy tour',
            });
        }

        const enrichedTour = await enrichTourWithSchedules(tour);
        return res.json(enrichedTour);
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

export const createTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        const enrichedTour = await enrichTourWithSchedules(tour);
        return res.status(201).json(enrichedTour);
    } catch (error) {
        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi tạo tour',
        });
    }
};

export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!tour) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy tour',
            });
        }

        const enrichedTour = await enrichTourWithSchedules(tour);
        return res.json(enrichedTour);
    } catch (error) {
        return res.status(400).json({
            ER: 1,
            EM: error.message || 'Lỗi cập nhật tour',
        });
    }
};

export const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            return res.status(404).json({
                ER: 1,
                EM: 'Không tìm thấy tour',
            });
        }

        return res.json({ message: 'Xóa tour thành công' });
    } catch (error) {
        return res.status(500).json({
            ER: 1,
            EM: error.message || 'Lỗi server',
        });
    }
};

