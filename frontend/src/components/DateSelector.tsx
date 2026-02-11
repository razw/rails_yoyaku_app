"use client";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const getTodayDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getTomorrowDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  };

  const today = getTodayDate();
  const tomorrow = getTomorrowDate();

  const isToday = selectedDate.toDateString() === today.toDateString();
  const isTomorrow = selectedDate.toDateString() === tomorrow.toDateString();

  const handleTodayClick = () => {
    onDateChange(getTodayDate());
  };

  const handleTomorrowClick = () => {
    onDateChange(getTomorrowDate());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTodayClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          isToday
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        今日
      </button>

      <button
        onClick={handleTomorrowClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
          isTomorrow
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        明日
      </button>

      <input
        type="date"
        value={formatDateForInput(selectedDate)}
        onChange={handleDateInputChange}
        className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
