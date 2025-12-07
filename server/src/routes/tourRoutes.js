import express from 'express';
import {
    getTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
} from '../controllers/tourController.js';

const router = express.Router();

router.get('/', getTours);
router.get('/:id', getTourById);
router.post('/', createTour);
router.patch('/:id', updateTour);
router.delete('/:id', deleteTour);

export default router;

