import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard.jsx';
import {
    fetchBookings,
    updateBookingStatus,
} from '../../apis/bookingApi.js';
import { createSchedule } from '../../apis/scheduleApi.js';
import { createTour, deleteTour, fetchTours, updateTour } from '../../apis/tourApi.js';
import { fetchReportSummary, fetchTopTours } from '../../apis/reportApi.js';

const AdminPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { tours } = useSelector((state) => state.tour);
    const { bookings } = useSelector((state) => state.booking);
    const { summary: reports, topTours } = useSelector((state) => state.report);
    const [period, setPeriod] = useState('monthly');
    const [tourForm, setTourForm] = useState({
        name: '',
        destination: '',
        region: '',
        price: '',
        salePrice: '',
        durationDays: 4,
        thumbnail: '',
        images: [],
        highlights: [],
        itinerary: [],
        policies: {
            deposit: '',
            cancellation: '',
            notes: '',
        },
    });
    const [newImage, setNewImage] = useState('');
    const [newHighlight, setNewHighlight] = useState('');
    const [itineraryDay, setItineraryDay] = useState({ day: 1, title: '', description: '' });
    const [scheduleForm, setScheduleForm] = useState({
        tourId: '',
        date: '',
        seatsTotal: 20,
    });
    const [message, setMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const isAdmin = user?.role === 'admin';

    const loadDashboard = useCallback(async () => {
        await Promise.all([
            dispatch(fetchTours()),
            dispatch(fetchBookings()),
        ]);
    }, [dispatch]);

    const loadReports = useCallback(async () => {
        await Promise.all([
            dispatch(fetchReportSummary(period)),
            dispatch(fetchTopTours()),
        ]);
    }, [dispatch, period]);

    useEffect(() => {
        if (isAdmin) {
            loadDashboard();
        }
    }, [isAdmin, loadDashboard]);

    useEffect(() => {
        if (isAdmin) {
            loadReports();
        }
    }, [isAdmin, loadReports]);

    useEffect(() => {
        if (tours.length && !scheduleForm.tourId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setScheduleForm((prev) => ({ ...prev, tourId: tours[0].id }));
        }
    }, [tours, scheduleForm.tourId]);

    const totalRevenue = useMemo(
        () =>
            bookings
                .filter((booking) => booking.status !== 'cancelled')
                .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
        [bookings]
    );

    if (!isAdmin) {
        return (
            <section className="container mx-auto px-4 py-12">
                <div className="card text-center">
                    <p className="text-gray-600">Chỉ admin mới truy cập trang này.</p>
                </div>
            </section>
        );
    }

    const handleAddImage = () => {
        if (newImage.trim()) {
            setTourForm((prev) => ({
                ...prev,
                images: [...prev.images, newImage.trim()],
            }));
            setNewImage('');
        }
    };

    const handleRemoveImage = (index) => {
        setTourForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleAddHighlight = () => {
        if (newHighlight.trim()) {
            setTourForm((prev) => ({
                ...prev,
                highlights: [...prev.highlights, newHighlight.trim()],
            }));
            setNewHighlight('');
        }
    };

    const handleRemoveHighlight = (index) => {
        setTourForm((prev) => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index),
        }));
    };

    const handleAddItineraryDay = () => {
        if (itineraryDay.title.trim() && itineraryDay.description.trim()) {
            setTourForm((prev) => ({
                ...prev,
                itinerary: [...prev.itinerary, { ...itineraryDay }],
            }));
            setItineraryDay({
                day: tourForm.itinerary.length + 1,
                title: '',
                description: '',
            });
        }
    };

    const handleRemoveItineraryDay = (index) => {
        setTourForm((prev) => ({
            ...prev,
            itinerary: prev.itinerary.filter((_, i) => i !== index).map((item, idx) => ({
                ...item,
                day: idx + 1,
            })),
        }));
    };

    const handleEditTour = (tour) => {
        setEditingTour(tour);
        setIsEditMode(true);
        setTourForm({
            name: tour.name || '',
            destination: tour.destination || '',
            region: tour.region || '',
            price: tour.price || '',
            salePrice: tour.salePrice || '',
            durationDays: tour.durationDays || 4,
            thumbnail: tour.thumbnail || '',
            images: tour.images || [],
            highlights: tour.highlights || [],
            itinerary: tour.itinerary || [],
            policies: tour.policies || {
                deposit: '',
                cancellation: '',
                notes: '',
            },
        });
        setNewImage('');
        setNewHighlight('');
        setItineraryDay({ day: 1, title: '', description: '' });
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingTour(null);
        setTourForm({
            name: '',
            destination: '',
            region: '',
            price: '',
            salePrice: '',
            durationDays: 4,
            thumbnail: '',
            images: [],
            highlights: [],
            itinerary: [],
            policies: {
                deposit: '',
                cancellation: '',
                notes: '',
            },
        });
        setNewImage('');
        setNewHighlight('');
        setItineraryDay({ day: 1, title: '', description: '' });
    };

    const handleCreateTour = async (e) => {
        e.preventDefault();
        try {
            const tourData = {
                name: tourForm.name,
                destination: tourForm.destination,
                region: tourForm.region || tourForm.destination,
                price: Number(tourForm.price) || 0,
                salePrice: Number(tourForm.salePrice) || Number(tourForm.price) || 0,
                durationDays: Number(tourForm.durationDays) || 3,
                thumbnail: tourForm.thumbnail || tourForm.images[0] || '',
                images: tourForm.images.length > 0 ? tourForm.images : tourForm.thumbnail ? [tourForm.thumbnail] : [],
                highlights: tourForm.highlights,
                itinerary: tourForm.itinerary,
                policies: tourForm.policies,
                slug: tourForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            };

            if (isEditMode && editingTour) {
                // Update tour
                await dispatch(updateTour({ id: editingTour.id, ...tourData })).unwrap();
                setMessage('Đã cập nhật tour thành công!');
                toast.success('Đã cập nhật tour thành công!');
                handleCancelEdit();
            } else {
                // Create tour
                await dispatch(createTour(tourData)).unwrap();
                setMessage('Đã thêm tour mới thành công!');
                toast.success('Đã thêm tour mới thành công!');
                setTourForm({
                    name: '',
                    destination: '',
                    region: '',
                    price: '',
                    salePrice: '',
                    durationDays: 4,
                    thumbnail: '',
                    images: [],
                    highlights: [],
                    itinerary: [],
                    policies: {
                        deposit: '',
                        cancellation: '',
                        notes: '',
                    },
                });
                setNewImage('');
                setNewHighlight('');
                setItineraryDay({ day: 1, title: '', description: '' });
            }
            dispatch(fetchTours());
        } catch (err) {
            const errorMsg = err.message || (isEditMode ? 'Không thể cập nhật tour.' : 'Không thể tạo tour.');
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleDeleteTour = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa tour này?')) return;
        try {
            await dispatch(deleteTour(id)).unwrap();
            setMessage('Đã xóa tour thành công!');
            toast.success('Đã xóa tour thành công!');
            dispatch(fetchTours());
        } catch (err) {
            const errorMsg = err.message || 'Không thể xóa tour.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        try {
            await dispatch(
                createSchedule({
                    tourId: scheduleForm.tourId,
                    date: scheduleForm.date,
                    seatsTotal: Number(scheduleForm.seatsTotal),
                })
            ).unwrap();
            setMessage('Đã thêm lịch khởi hành thành công!');
            toast.success('Đã thêm lịch khởi hành thành công!');
            setScheduleForm({ ...scheduleForm, date: '', seatsTotal: 20 });
            dispatch(fetchTours());
        } catch (err) {
            const errorMsg = err.message || 'Không thể thêm lịch.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            await dispatch(updateBookingStatus({ id: bookingId, status })).unwrap();
            setMessage('Đã cập nhật trạng thái đơn thành công!');
            toast.success('Đã cập nhật trạng thái đơn thành công!');
            dispatch(fetchBookings());
        } catch (err) {
            const errorMsg = err.message || 'Không thể cập nhật.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <section className="container mx-auto px-4 py-12">
            {message && (
                <div className={`info-box ${message.includes('thành công') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
            <div className="mb-8">
                <p className="text-primary-600 text-sm font-medium mb-2">Admin console</p>
                <h2 className="text-3xl font-bold text-gray-900">Tổng quan kinh doanh</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Tour đang mở" value={tours.length} />
                <StatCard label="Đơn đặt" value={bookings.length} />
                <StatCard label="Doanh thu tạm tính" value={`${totalRevenue.toLocaleString()} đ`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">
                        {isEditMode ? 'Sửa tour' : 'Thêm tour mới'}
                        {isEditMode && (
                            <button
                                type="button"
                                className="ml-4 text-sm text-gray-500 hover:text-gray-700"
                                onClick={handleCancelEdit}>
                                (Hủy)
                            </button>
                        )}
                    </h3>
                    <form className="space-y-4" onSubmit={handleCreateTour}>
                        <input
                            className="input-field"
                            placeholder="Tên tour *"
                            value={tourForm.name}
                            onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                            required
                        />
                        <input
                            className="input-field"
                            placeholder="Điểm đến *"
                            value={tourForm.destination}
                            onChange={(e) =>
                                setTourForm({ ...tourForm, destination: e.target.value })
                            }
                            required
                        />
                        <input
                            className="input-field"
                            placeholder="Khu vực"
                            value={tourForm.region}
                            onChange={(e) =>
                                setTourForm({ ...tourForm, region: e.target.value })
                            }
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="input-field"
                                placeholder="Giá gốc *"
                                type="number"
                                value={tourForm.price}
                                onChange={(e) =>
                                    setTourForm({ ...tourForm, price: e.target.value })
                                }
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Giá khuyến mãi"
                                type="number"
                                value={tourForm.salePrice}
                                onChange={(e) =>
                                    setTourForm({ ...tourForm, salePrice: e.target.value })
                                }
                            />
                        </div>
                        <input
                            className="input-field"
                            placeholder="Thời lượng (ngày)"
                            type="number"
                            min="1"
                            value={tourForm.durationDays}
                            onChange={(e) =>
                                setTourForm({ ...tourForm, durationDays: e.target.value })
                            }
                        />
                        <input
                            className="input-field"
                            placeholder="Ảnh thumbnail (URL)"
                            value={tourForm.thumbnail}
                            onChange={(e) =>
                                setTourForm({ ...tourForm, thumbnail: e.target.value })
                            }
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách ảnh</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    className="input-field flex-1"
                                    placeholder="URL ảnh"
                                    value={newImage}
                                    onChange={(e) => setNewImage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddImage();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleAddImage}>
                                    Thêm
                                </button>
                            </div>
                            {tourForm.images.length > 0 && (
                                <div className="space-y-2">
                                    {tourForm.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <span className="flex-1 text-xs truncate">{img}</span>
                                            <button
                                                type="button"
                                                className="btn-ghost text-xs"
                                                onClick={() => handleRemoveImage(idx)}>
                                                Xóa
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Điểm nổi bật</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    className="input-field flex-1"
                                    placeholder="Điểm nổi bật"
                                    value={newHighlight}
                                    onChange={(e) => setNewHighlight(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddHighlight();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleAddHighlight}>
                                    Thêm
                                </button>
                            </div>
                            {tourForm.highlights.length > 0 && (
                                <ul className="list-disc list-inside space-y-1">
                                    {tourForm.highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-center justify-between">
                                            <span className="flex-1">{highlight}</span>
                                            <button
                                                type="button"
                                                className="btn-ghost text-xs ml-2"
                                                onClick={() => handleRemoveHighlight(idx)}>
                                                Xóa
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lịch trình</label>
                            <div className="flex gap-2 mb-2">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-600 mb-1">Ngày</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        placeholder="1"
                                        min="1"
                                        value={itineraryDay.day}
                                        onChange={(e) =>
                                            setItineraryDay({
                                                ...itineraryDay,
                                                day: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex-[3]">
                                    <label className="block text-xs text-gray-600 mb-1">Tiêu đề</label>
                                    <input
                                        className="input-field"
                                        placeholder="Ví dụ: Hà Nội - Lào Cai - Sapa"
                                        value={itineraryDay.title}
                                        onChange={(e) =>
                                            setItineraryDay({ ...itineraryDay, title: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <textarea
                                className="input-field mb-2"
                                placeholder="Mô tả"
                                value={itineraryDay.description}
                                onChange={(e) =>
                                    setItineraryDay({
                                        ...itineraryDay,
                                        description: e.target.value,
                                    })
                                }
                                rows="3"
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleAddItineraryDay}>
                                Thêm ngày
                            </button>
                            {tourForm.itinerary.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {tourForm.itinerary.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <strong className="text-sm">Ngày {day.day}: {day.title}</strong>
                                                <button
                                                    type="button"
                                                    className="btn-ghost text-xs"
                                                    onClick={() => handleRemoveItineraryDay(idx)}>
                                                    Xóa
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600">{day.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chính sách</label>
                            <input
                                className="input-field mb-2"
                                placeholder="Đặt cọc"
                                value={tourForm.policies.deposit}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        policies: { ...tourForm.policies, deposit: e.target.value },
                                    })
                                }
                            />
                            <input
                                className="input-field mb-2"
                                placeholder="Hủy tour"
                                value={tourForm.policies.cancellation}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        policies: {
                                            ...tourForm.policies,
                                            cancellation: e.target.value,
                                        },
                                    })
                                }
                            />
                            <textarea
                                className="input-field"
                                placeholder="Ghi chú"
                                value={tourForm.policies.notes}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        policies: { ...tourForm.policies, notes: e.target.value },
                                    })
                                }
                                rows="2"
                            />
                        </div>
                        <button className="btn-primary w-full" type="submit">
                            {isEditMode ? 'Cập nhật tour' : 'Tạo tour'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">Lịch khởi hành</h3>
                    <form className="space-y-4" onSubmit={handleAddSchedule}>
                        <select
                            className="input-field"
                            value={scheduleForm.tourId}
                            onChange={(e) =>
                                setScheduleForm({ ...scheduleForm, tourId: e.target.value })
                            }>
                            {tours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.name}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input-field"
                            type="date"
                            value={scheduleForm.date}
                            onChange={(e) =>
                                setScheduleForm({ ...scheduleForm, date: e.target.value })
                            }
                            required
                        />
                        <input
                            className="input-field"
                            type="number"
                            min="10"
                            placeholder="Số ghế"
                            value={scheduleForm.seatsTotal}
                            onChange={(e) =>
                                setScheduleForm({ ...scheduleForm, seatsTotal: e.target.value })
                            }
                            required
                        />
                        <button className="btn-secondary w-full" type="submit">Thêm lịch</button>
                    </form>
                </div>
            </div>

            <div className="card mb-8">
                <h3 className="text-2xl font-bold mb-6">Quản lý tour</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên tour</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Giá</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tours.map((tour) => (
                                <tr key={tour.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{tour.name}</td>
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {tour.salePrice?.toLocaleString()} đ
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                className="btn-ghost text-sm text-blue-600 hover:text-blue-700"
                                                onClick={() => handleEditTour(tour)}>
                                                Sửa
                                            </button>
                                            <button
                                                className="btn-ghost text-sm text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteTour(tour.id)}>
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card mb-8">
                <h3 className="text-2xl font-bold mb-6">Đơn đặt tour</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tour</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{booking.tour?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {booking.user?.name || booking.contact?.fullName || 'Khách hàng'} • {booking.travelers} khách
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                                booking.status === 'cancelled' ? 'Đã hủy' :
                                                    'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn-ghost text-sm text-green-600 hover:text-green-700"
                                                        onClick={() => handleBookingStatus(booking.id, 'confirmed')}>
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        className="btn-ghost text-sm text-red-600 hover:text-red-700"
                                                        onClick={() => handleBookingStatus(booking.id, 'cancelled')}>
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    className="btn-ghost text-sm text-red-600 hover:text-red-700"
                                                    onClick={() => handleBookingStatus(booking.id, 'cancelled')}>
                                                    Hủy
                                                </button>
                                            )}
                                            {booking.status === 'cancelled' && (
                                                <span className="text-sm text-gray-400">Không thể thao tác</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Báo cáo doanh thu</h3>
                    <select
                        className="input-field w-auto"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}>
                        <option value="monthly">Theo tháng</option>
                        <option value="quarterly">Theo quý</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kỳ</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Doanh thu</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đơn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(reports).map(([key, value]) => (
                                <tr key={key} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{key}</td>
                                    <td className="px-4 py-3 text-sm">{value.revenue.toLocaleString()} đ</td>
                                    <td className="px-4 py-3 text-sm">{value.bookings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h3 className="text-2xl font-bold mb-6">Top tour bán chạy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topTours.slice(0, 4).map((item) => (
                        <div className="card bg-gray-50" key={item.tourId}>
                            <p className="text-sm text-gray-600 mb-1">{item.name}</p>
                            <strong className="block text-lg font-bold text-primary-600 mb-1">
                                {item.revenue.toLocaleString()} đ
                            </strong>
                            <span className="text-xs text-gray-500">{item.seatsSold} khách</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AdminPage;
