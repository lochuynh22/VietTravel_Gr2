import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

const policiesSchema = new mongoose.Schema({
    deposit: String,
    cancellation: String,
    notes: String,
});

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên tour là bắt buộc'],
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
        },
        destination: {
            type: String,
            required: [true, 'Điểm đến là bắt buộc'],
            trim: true,
        },
        region: {
            type: String,
            required: [true, 'Khu vực là bắt buộc'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Giá tour là bắt buộc'],
            min: [0, 'Giá phải lớn hơn hoặc bằng 0'],
        },
        salePrice: {
            type: Number,
            min: [0, 'Giá khuyến mãi phải lớn hơn hoặc bằng 0'],
        },
        durationDays: {
            type: Number,
            required: [true, 'Số ngày là bắt buộc'],
            min: [1, 'Số ngày phải lớn hơn 0'],
        },
        thumbnail: {
            type: String,
            trim: true,
        },
        images: [String],
        highlights: [String],
        itinerary: [itineraryItemSchema],
        policies: policiesSchema,
    },
    {
        timestamps: true,
    }
);

// Auto-update updatedAt
tourSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Tour', tourSchema);

