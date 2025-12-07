import express from 'express';
import {
    getBookings,
    createBooking,
    cancelBooking,
    updateBookingStatus,
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/status', updateBookingStatus);

export default router;

