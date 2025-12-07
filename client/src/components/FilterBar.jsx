const durations = [
  { label: 'Tất cả', value: '' },
  { label: '2 - 4 ngày', value: '2-4' },
  { label: '5 - 7 ngày', value: '5-7' },
  { label: '8+ ngày', value: '8-14' },
];

const priceSteps = [
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 40 triệu', min: 20000000, max: 40000000 },
  { label: 'Trên 40 triệu', min: 40000000, max: 100000000 },
];

const FilterBar = ({ filters, onChange, destinations }) => {
  const handleInput = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
          <select
            className="input-field"
            value={filters.destination}
            onChange={(e) => handleInput('destination', e.target.value)}
          >
            <option value="">Tất cả</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
          <select
            className="input-field"
            value={filters.priceKey}
            onChange={(e) => {
              const selected = priceSteps.find(
                (step) => step.label === e.target.value,
              );
              onChange({
                ...filters,
                priceKey: e.target.value,
                minPrice: selected?.min ?? '',
                maxPrice: selected?.max ?? '',
              });
            }}
          >
            <option value="">Tất cả</option>
            {priceSteps.map((step) => (
              <option key={step.label} value={step.label}>
                {step.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng</label>
          <select
            className="input-field"
            value={filters.duration}
            onChange={(e) => handleInput('duration', e.target.value)}
          >
            {durations.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa</label>
          <input
            className="input-field"
            placeholder="Tên tour, khu vực..."
            value={filters.search}
            onChange={(e) => handleInput('search', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
