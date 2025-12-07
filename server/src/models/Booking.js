import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
});

const bookingSchema = new mongoose.Schema(
    {
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Tour ID là bắt buộc'],
        },
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
            required: [true, 'Schedule ID là bắt buộc'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID là bắt buộc'],
        },
        travelers: {
            type: Number,
            required: [true, 'Số lượng khách là bắt buộc'],
            min: [1, 'Số lượng khách phải lớn hơn 0'],
        },
        startDate: {
            type: Date,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: [true, 'Tổng tiền là bắt buộc'],
            min: [0, 'Tổng tiền phải lớn hơn hoặc bằng 0'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
        note: {
            type: String,
            default: '',
            trim: true,
        },
        contact: {
            type: contactSchema,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-update updatedAt
bookingSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Booking', bookingSchema);

