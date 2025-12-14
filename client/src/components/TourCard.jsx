import { Link } from 'react-router-dom';

const TourCard = ({ tour }) => {
    const tourId = tour.id || tour._id;
    return (
    <article className="card overflow-hidden hover:shadow-lg transition-shadow">
        <img
            src={tour.thumbnail || tour.images?.[0] || 'https://via.placeholder.com/400x250'}
            alt={tour.name}
            className="w-full h-48 object-cover"
        />
        <div className="p-4">
            <p className="text-primary-600 text-xs font-medium mb-1">{tour.destination}</p>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{tour.name}</h3>
            <p className="text-gray-500 text-sm mb-2">
                {tour.durationDays} ngày • {tour.region || tour.destination}
            </p>
            {tour.highlights?.[0] && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tour.highlights[0]}</p>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xl font-bold text-primary-600">
                        {tour.salePrice?.toLocaleString() || tour.price?.toLocaleString()} đ
                    </span>
                    {tour.salePrice && tour.salePrice !== tour.price && (
                        <span className="text-gray-400 line-through text-sm ml-2">
                            {tour.price.toLocaleString()} đ
                        </span>
                    )}
                </div>
                <Link
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    to={`/tours/${tourId}`}
                >
                    Chi tiết →
                </Link>
            </div>
        </div>
    </article>
    );
};

export default TourCard;
