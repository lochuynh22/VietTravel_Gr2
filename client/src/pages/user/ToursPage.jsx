import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FilterBar from '../../components/FilterBar.jsx';
import TourCard from '../../components/TourCard.jsx';
import { fetchTours } from '../../apis/tourApi.js';

const ToursPage = () => {
    const dispatch = useDispatch();
    const { tours, isLoading } = useSelector((state) => state.tour);
    const [filters, setFilters] = useState({
        destination: '',
        priceKey: '',
        minPrice: '',
        maxPrice: '',
        duration: '',
        search: '',
    });
    const [allTours, setAllTours] = useState([]);

    // Fetch all tours once on mount to get all destinations
    useEffect(() => {
        dispatch(fetchTours({})).then((result) => {
            if (result.payload) {
                setAllTours(result.payload);
            }
        });
    }, [dispatch]);

    // Get destinations from all tours (not filtered), limit to top 8 most common
    const destinations = useMemo(() => {
        const destCounts = {};
        allTours.forEach((tour) => {
            if (tour.destination) {
                destCounts[tour.destination] = (destCounts[tour.destination] || 0) + 1;
            }
        });
        
        // Sort by count and take top 8
        const sorted = Object.entries(destCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([dest]) => dest);
        
        return sorted;
    }, [allTours]);

    useEffect(() => {
        const params = {};
        if (filters.destination) params.destination = filters.destination;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.duration) params.duration = filters.duration;
        if (filters.search) params.search = filters.search;

        dispatch(fetchTours(params));
    }, [dispatch, filters]);

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <p className="text-primary-600 text-sm font-medium mb-2">Danh sách tour</p>
                <h2 className="text-3xl font-bold text-gray-900">Chọn hành trình phù hợp</h2>
            </div>

            <FilterBar filters={filters} onChange={setFilters} destinations={destinations} />

            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Đang tải tour...</p>
                </div>
            ) : tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour) => {
                        const tourId = tour.id || tour._id;
                        return <TourCard key={tourId} tour={tour} />;
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy tour nào.</p>
                </div>
            )}
        </section>
    );
};

export default ToursPage;
