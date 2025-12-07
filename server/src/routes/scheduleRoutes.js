import express from 'express';
import {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/', getSchedules);
router.post('/', createSchedule);
router.patch('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;

