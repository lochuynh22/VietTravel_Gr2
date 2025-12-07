import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
    {
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Tour ID là bắt buộc'],
        },
        date: {
            type: Date,
            required: [true, 'Ngày khởi hành là bắt buộc'],
        },
        seatsTotal: {
            type: Number,
            required: [true, 'Tổng số ghế là bắt buộc'],
            min: [1, 'Tổng số ghế phải lớn hơn 0'],
        },
    },
    {
        timestamps: true,
    }
);

// Auto-update updatedAt
scheduleSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for seatsAvailable (calculated from bookings)
scheduleSchema.virtual('seatsAvailable', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'scheduleId',
    justOne: false,
});

export default mongoose.model('Schedule', scheduleSchema);

