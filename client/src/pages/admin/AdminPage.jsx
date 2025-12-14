import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard.jsx';
import {
    fetchBookings,
    updateBookingStatus,
} from '../../apis/bookingApi.js';
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../apis/scheduleApi.js';
import { createTour, deleteTour, fetchTours, updateTour } from '../../apis/tourApi.js';
import { fetchReportSummary, fetchTopTours } from '../../apis/reportApi.js';

const AdminPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { tours } = useSelector((state) => state.tour);
    const { bookings } = useSelector((state) => state.booking);
    const { summary: reports, topTours } = useSelector((state) => state.report);
    const { schedules } = useSelector((state) => state.schedule);
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
        date: '', // ISO format yyyy-mm-dd để gửi API
        dateInput: '', // Hiển thị dd/mm/yyyy cho admin nhập
        seatsTotal: 20,
    });
    const [message, setMessage] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [isEditScheduleMode, setIsEditScheduleMode] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [tourErrors, setTourErrors] = useState({});
    const [scheduleErrors, setScheduleErrors] = useState({});
    const isAdmin = user?.role === 'admin';

    const loadDashboard = useCallback(async () => {
        await Promise.all([
            dispatch(fetchTours()),
            dispatch(fetchBookings()),
            dispatch(fetchSchedules()),
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

    const parseDateInput = (value) => {
        // Hỗ trợ dd/mm/yyyy
        const parts = value.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts.map((p) => p.trim());
            if (day.length === 2 && month.length === 2 && year.length >= 2) {
                const fullYear = year.length === 2 ? `20${year}` : year;
                const iso = `${fullYear}-${month}-${day}`;
                const d = new Date(iso);
                if (!Number.isNaN(d.getTime())) return iso;
            }
        }
        // Fallback: nếu người dùng dán yyyy-mm-dd thì giữ nguyên khi hợp lệ
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }
        return '';
    };

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
        setTourErrors({});
    };

    const validateTourForm = () => {
        const newErrors = {};
        
        if (!tourForm.name || tourForm.name.trim() === '') {
            newErrors.name = 'Vui lòng nhập tên tour';
        }
        
        if (!tourForm.destination || tourForm.destination.trim() === '') {
            newErrors.destination = 'Vui lòng nhập điểm đến';
        }
        
        if (!tourForm.price || Number(tourForm.price) <= 0) {
            newErrors.price = 'Vui lòng nhập giá gốc (phải lớn hơn 0)';
        }
        
        setTourErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const validateScheduleForm = () => {
        const newErrors = {};
        
        if (!scheduleForm.tourId || scheduleForm.tourId === '') {
            newErrors.tourId = 'Vui lòng chọn tour';
        }
        
        if (!scheduleForm.date || scheduleForm.date === '') {
            newErrors.date = 'Vui lòng nhập ngày khởi hành';
        } else {
            const scheduleDate = new Date(scheduleForm.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            scheduleDate.setHours(0, 0, 0, 0);
            if (scheduleDate < today) {
                newErrors.date = 'Ngày khởi hành phải là ngày trong tương lai';
            }
        }
        
        if (!scheduleForm.seatsTotal || Number(scheduleForm.seatsTotal) < 10) {
            newErrors.seatsTotal = 'Số ghế phải ít nhất 10';
        } else if (Number(scheduleForm.seatsTotal) > 100) {
            newErrors.seatsTotal = 'Số ghế không được vượt quá 100';
        }
        
        setScheduleErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleCreateTour = async (e) => {
        e.preventDefault();
        
        // Validate form
        const { isValid, errors: validationErrors } = validateTourForm();
        if (!isValid) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }
        
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
                setTourErrors({});
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
        
        // Validate form
        const { isValid, errors: validationErrors } = validateScheduleForm();
        if (!isValid) {
            const firstError = Object.values(validationErrors)[0];
            if (firstError) {
                toast.error(firstError);
            }
            return;
        }
        
        try {
            if (isEditScheduleMode && editingSchedule) {
                // Update schedule
                await dispatch(
                    updateSchedule({
                        id: editingSchedule.id || editingSchedule._id,
                        tourId: scheduleForm.tourId,
                        date: scheduleForm.date,
                        seatsTotal: Number(scheduleForm.seatsTotal),
                    })
                ).unwrap();
                setMessage('Đã cập nhật lịch khởi hành thành công!');
                toast.success('Đã cập nhật lịch khởi hành thành công!');
            } else {
                // Create schedule
                await dispatch(
                    createSchedule({
                        tourId: scheduleForm.tourId,
                        date: scheduleForm.date,
                        seatsTotal: Number(scheduleForm.seatsTotal),
                    })
                ).unwrap();
                setMessage('Đã thêm lịch khởi hành thành công!');
                toast.success('Đã thêm lịch khởi hành thành công!');
            }
            // Reset form
            setScheduleForm({ tourId: tours[0]?.id || '', date: '', dateInput: '', seatsTotal: 20 });
            setIsEditScheduleMode(false);
            setEditingSchedule(null);
            setScheduleErrors({});
            dispatch(fetchSchedules());
            dispatch(fetchTours());
        } catch (err) {
            const errorMsg = err.message || (isEditScheduleMode ? 'Không thể cập nhật lịch.' : 'Không thể thêm lịch.');
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleEditSchedule = (schedule) => {
        const scheduleDate = new Date(schedule.date);
        const day = String(scheduleDate.getDate()).padStart(2, '0');
        const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const year = String(scheduleDate.getFullYear()).slice(-2);
        const dateInput = `${day}/${month}/${year}`;
        
        // Get tourId - handle both populated and non-populated cases
        let tourId = schedule.tourId;
        if (typeof tourId === 'object' && tourId !== null) {
            tourId = tourId._id || tourId.id;
        }
        
        setScheduleForm({
            tourId: tourId || '',
            date: schedule.date,
            dateInput,
            seatsTotal: schedule.seatsTotal,
        });
        setIsEditScheduleMode(true);
        setEditingSchedule(schedule);
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa lịch khởi hành này?')) return;
        try {
            await dispatch(deleteSchedule(id)).unwrap();
            setMessage('Đã xóa lịch khởi hành thành công!');
            toast.success('Đã xóa lịch khởi hành thành công!');
            dispatch(fetchSchedules());
            dispatch(fetchTours());
        } catch (err) {
            const errorMsg = err.message || 'Không thể xóa lịch.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleCancelScheduleEdit = () => {
        setScheduleForm({ tourId: tours[0]?.id || '', date: '', dateInput: '', seatsTotal: 20 });
        setIsEditScheduleMode(false);
        setEditingSchedule(null);
        setScheduleErrors({});
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
                        <div>
                            <input
                                className={`input-field ${tourErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Tên tour *"
                                value={tourForm.name}
                                onChange={(e) => {
                                    setTourForm({ ...tourForm, name: e.target.value });
                                    if (tourErrors.name) {
                                        setTourErrors((prev) => ({ ...prev, name: '' }));
                                    }
                                }}
                            />
                            {tourErrors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {tourErrors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`input-field ${tourErrors.destination ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Điểm đến *"
                                value={tourForm.destination}
                                onChange={(e) => {
                                    setTourForm({ ...tourForm, destination: e.target.value });
                                    if (tourErrors.destination) {
                                        setTourErrors((prev) => ({ ...prev, destination: '' }));
                                    }
                                }}
                            />
                            {tourErrors.destination && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {tourErrors.destination}
                                </p>
                            )}
                        </div>
                        <input
                            className="input-field"
                            placeholder="Khu vực"
                            value={tourForm.region}
                            onChange={(e) =>
                                setTourForm({ ...tourForm, region: e.target.value })
                            }
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    className={`input-field ${tourErrors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Giá gốc *"
                                    type="number"
                                    value={tourForm.price}
                                    onChange={(e) => {
                                        setTourForm({ ...tourForm, price: e.target.value });
                                        if (tourErrors.price) {
                                            setTourErrors((prev) => ({ ...prev, price: '' }));
                                        }
                                    }}
                                />
                                {tourErrors.price && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <span>⚠</span>
                                        {tourErrors.price}
                                    </p>
                                )}
                            </div>
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
                    <h3 className="text-2xl font-bold mb-6">
                        {isEditScheduleMode ? 'Sửa lịch khởi hành' : 'Thêm lịch khởi hành'}
                    </h3>
                    <form className="space-y-4" onSubmit={handleAddSchedule}>
                        <div>
                            <select
                                className={`input-field ${scheduleErrors.tourId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                value={scheduleForm.tourId}
                                onChange={(e) => {
                                    setScheduleForm({ ...scheduleForm, tourId: e.target.value });
                                    if (scheduleErrors.tourId) {
                                        setScheduleErrors((prev) => ({ ...prev, tourId: '' }));
                                    }
                                }}
                                disabled={isEditScheduleMode}>
                                <option value="">-- Chọn tour --</option>
                                {tours.map((tour) => (
                                    <option key={tour.id} value={tour.id}>
                                        {tour.name}
                                    </option>
                                ))}
                            </select>
                            {scheduleErrors.tourId && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {scheduleErrors.tourId}
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`input-field ${scheduleErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                type="text"
                                inputMode="numeric"
                                placeholder="dd/mm/yyyy *"
                                value={scheduleForm.dateInput}
                                onChange={(e) => {
                                    const input = e.target.value;
                                    const iso = parseDateInput(input);
                                    setScheduleForm({
                                        ...scheduleForm,
                                        dateInput: input,
                                        date: iso,
                                    });
                                    if (scheduleErrors.date) {
                                        setScheduleErrors((prev) => ({ ...prev, date: '' }));
                                    }
                                }}
                            />
                            {scheduleErrors.date && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {scheduleErrors.date}
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`input-field ${scheduleErrors.seatsTotal ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                type="number"
                                min="10"
                                placeholder="Số ghế *"
                                value={scheduleForm.seatsTotal}
                                onChange={(e) => {
                                    setScheduleForm({ ...scheduleForm, seatsTotal: e.target.value });
                                    if (scheduleErrors.seatsTotal) {
                                        setScheduleErrors((prev) => ({ ...prev, seatsTotal: '' }));
                                    }
                                }}
                            />
                            {scheduleErrors.seatsTotal && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠</span>
                                    {scheduleErrors.seatsTotal}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button className="btn-secondary flex-1" type="submit">
                                {isEditScheduleMode ? 'Cập nhật' : 'Thêm lịch'}
                            </button>
                            {isEditScheduleMode && (
                                <button
                                    className="btn-ghost"
                                    type="button"
                                    onClick={handleCancelScheduleEdit}>
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">Danh sách lịch khởi hành</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tour</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày khởi hành</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tổng ghế</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ghế trống</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            Chưa có lịch khởi hành nào
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => {
                                        const scheduleDate = new Date(schedule.date);
                                        const formattedDate = scheduleDate.toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        });
                                        const tour = tours.find((t) => t.id === schedule.tourId?._id || t.id === schedule.tourId || t._id === schedule.tourId?._id || t._id === schedule.tourId);
                                        
                                        return (
                                            <tr key={schedule.id || schedule._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{tour?.name || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{formattedDate}</td>
                                                <td className="px-4 py-3 text-sm">{schedule.seatsTotal}</td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {schedule.seatsAvailable !== undefined ? schedule.seatsAvailable : schedule.seatsTotal}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="btn-ghost text-sm text-blue-600 hover:text-blue-700"
                                                            onClick={() => handleEditSchedule(schedule)}>
                                                            Sửa
                                                        </button>
                                                        <button
                                                            className="btn-ghost text-sm text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteSchedule(schedule.id || schedule._id)}>
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
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
