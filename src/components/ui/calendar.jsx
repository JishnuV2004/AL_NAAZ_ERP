import React, { useState, useEffect } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline, IoChevronDownOutline, IoCloseOutline, IoRefreshOutline } from 'react-icons/io5';

const monthNamesFull = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthNamesShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const dayHeadingsFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Helper to convert various date representations to ISO YYYY-MM-DD string
 */
const toDateString = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === 'string') return dateVal;
  if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
  if (typeof dateVal === 'object' && dateVal.year && dateVal.month && dateVal.day) {
    const y = dateVal.year;
    const m = String(dateVal.month).padStart(2, '0');
    const d = String(dateVal.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
};

/**
 * Helper to format date string YYYY-MM-DD into "MMM D, YYYY" format (e.g. "Sep 3, 2026")
 */
const formatFormattedDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${monthNamesShort[m]} ${d}, ${y}`;
};

export function RangeCalendar({
  value,
  onChange,
  startDate: propStartDate,
  endDate: propEndDate,
  onSelectRange,
  onClose,
  numberOfMonths = 2,
  className = ''
}) {
  const initStart = toDateString(value?.start) || toDateString(propStartDate) || '2026-08-25';
  const initEnd = toDateString(value?.end) || toDateString(propEndDate) || '2026-09-09';

  const [rangeStart, setRangeStart] = useState(initStart);
  const [rangeEnd, setRangeEnd] = useState(initEnd);
  const [hoverDate, setHoverDate] = useState(null);

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(7); // August (0-indexed: 7 = Aug)

  useEffect(() => {
    if (value?.start) setRangeStart(toDateString(value.start));
    if (value?.end) setRangeEnd(toDateString(value.end));
  }, [value]);

  useEffect(() => {
    if (propStartDate) setRangeStart(toDateString(propStartDate));
    if (propEndDate) setRangeEnd(toDateString(propEndDate));
  }, [propStartDate, propEndDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (dateStr) => {
    let newStart = rangeStart;
    let newEnd = rangeEnd;

    if (!rangeStart || (rangeStart && rangeEnd)) {
      newStart = dateStr;
      newEnd = null;
    } else if (rangeStart && !rangeEnd) {
      if (dateStr >= rangeStart) {
        newEnd = dateStr;
      } else {
        newEnd = rangeStart;
        newStart = dateStr;
      }
    }

    setRangeStart(newStart);
    setRangeEnd(newEnd);

    if (onChange) {
      onChange({ start: newStart, end: newEnd });
    }
    if (onSelectRange) {
      onSelectRange(newStart, newEnd);
    }
  };

  const dayHeadingsSingle = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const renderMonthGrid = (y, m) => {
    const firstDayIndex = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const cells = [];

    // 1. Previous Month Trailing Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      let prevM = m - 1;
      let prevY = y;
      if (prevM < 0) {
        prevM = 11;
        prevY = y - 1;
      }
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      cells.push({ day: prevDay, dateStr, isCurrentMonth: false });
    }

    // 2. Current Month Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    // 3. Next Month Leading Days
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        let nextM = m + 1;
        let nextY = y;
        if (nextM > 11) {
          nextM = 0;
          nextY = y + 1;
        }
        const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({ day: d, dateStr, isCurrentMonth: false });
      }
    }

    return (
      <div className="w-full select-none">
        {/* Month Title Header */}
        <div className="font-bold text-slate-800 text-sm mb-3 text-center sm:hidden">
          {monthNamesFull[m]} {y}
        </div>

        {/* Day of Week Headers (S M T W T F S) */}
        <div className="grid grid-cols-7 text-center mb-2">
          {dayHeadingsSingle.map((h, i) => (
            <span key={i} className="text-[12px] font-semibold text-slate-400 py-0.5">
              {h}
            </span>
          ))}
        </div>

        {/* Days Grid with Continuous Track Highlight */}
        <div className="grid grid-cols-7 text-center gap-y-1 font-sans">
          {cells.map((cell, idx) => {
            const { day, dateStr, isCurrentMonth } = cell;

            const isStart = rangeStart === dateStr;
            const isEnd = rangeEnd === dateStr;

            let isInRange = false;
            if (rangeStart && rangeEnd) {
              isInRange = dateStr >= rangeStart && dateStr <= rangeEnd;
            } else if (rangeStart && hoverDate) {
              const low = rangeStart < hoverDate ? rangeStart : hoverDate;
              const high = rangeStart < hoverDate ? hoverDate : rangeStart;
              isInRange = dateStr >= low && dateStr <= high;
            }

            const dayOfWeek = idx % 7;

            // Compute background track styling
            let trackClass = '';
            if (isInRange && isCurrentMonth) {
              trackClass = 'bg-slate-100';
              if (isStart || dayOfWeek === 0) {
                trackClass += ' rounded-l-xl';
              }
              if (isEnd || dayOfWeek === 6) {
                trackClass += ' rounded-r-xl';
              }
            }

            // Compute button styling
            let btnClass = 'text-slate-800 font-semibold hover:bg-slate-100 rounded-xl';

            if (!isCurrentMonth) {
              btnClass = 'text-slate-300 pointer-events-none font-normal';
            }

            if (isStart || isEnd) {
              btnClass = 'bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800';
            } else if (isInRange && isCurrentMonth) {
              btnClass = 'text-slate-900 font-bold';
            }

            return (
              <div
                key={`${dateStr}-${idx}`}
                className={`h-9 w-full flex items-center justify-center ${trackClass}`}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => setHoverDate(dateStr)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`h-9 w-9 text-xs flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  let nextY = viewYear;
  let nextM = viewMonth + 1;
  if (nextM > 11) {
    nextM = 0;
    nextY = viewYear + 1;
  }

  const yearsList = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <div
      className={`bg-white text-slate-900 border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden font-sans max-w-full ${className}`}
    >
      {/* Navigation Header with Chevrons and Month & Year Dropdown Pills */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Previous Month"
          >
            <IoChevronBackOutline size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Month Select Dropdown Pill */}
            <div className="relative flex items-center bg-[#f0f4f8] hover:bg-[#e2eaf4] border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-900 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="appearance-none bg-transparent pr-5 text-slate-900 font-extrabold text-xs cursor-pointer focus:outline-none"
              >
                {monthNamesShort.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline size={13} className="absolute right-2.5 pointer-events-none text-slate-600" />
            </div>

            {/* Year Select Dropdown Pill */}
            <div className="relative flex items-center bg-[#f0f4f8] hover:bg-[#e2eaf4] border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-900 font-extrabold text-xs transition-colors cursor-pointer shadow-xs">
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="appearance-none bg-transparent pr-5 text-slate-900 font-extrabold text-xs cursor-pointer focus:outline-none"
              >
                {yearsList.map((yVal) => (
                  <option key={yVal} value={yVal}>
                    {yVal}
                  </option>
                ))}
              </select>
              <IoChevronDownOutline size={13} className="absolute right-2.5 pointer-events-none text-slate-600" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Next Month"
          >
            <IoChevronForwardOutline size={16} />
          </button>
        </div>

        {/* Dual Month Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {renderMonthGrid(viewYear, viewMonth)}
          {numberOfMonths > 1 && renderMonthGrid(nextY, nextM)}
        </div>
      </div>

      {/* Integrated Action Footer */}
      <div className="bg-slate-50 p-3.5 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Selected Range:</span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
            {formatFormattedDisplayDate(rangeStart) || 'Start Date'} → {formatFormattedDisplayDate(rangeEnd) || 'End Date'}
          </span>
        </div>
        
        {onClose && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Apply Range
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Calendar({
  value,
  onChange,
  className = '',
  captionLayout = 'dropdown',
  onClose
}) {
  const currentDateStr = toDateString(value) || '2026-09-10';
  const initialYear = currentDateStr ? parseInt(currentDateStr.split('-')[0], 10) : 2026;
  const initialMonth = currentDateStr ? parseInt(currentDateStr.split('-')[1], 10) - 1 : 8; // Sep = 8

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    if (value) {
      const dateStr = toDateString(value);
      if (dateStr && dateStr.includes('-')) {
        const [y, m] = dateStr.split('-').map(Number);
        if (y && !isNaN(y)) setViewYear(y);
        if (m && !isNaN(m)) setViewMonth(m - 1);
      }
    }
  }, [value]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDaySelect = (dateStr) => {
    if (onChange) {
      onChange(dateStr);
    }
  };

  const dayHeadingsSingle = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];

  // Trailing previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    let prevM = viewMonth - 1;
    let prevY = viewYear;
    if (prevM < 0) {
      prevM = 11;
      prevY = viewYear - 1;
    }
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    cells.push({ day: prevDay, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Leading next month days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      let nextM = viewMonth + 1;
      let nextY = viewYear;
      if (nextM > 11) {
        nextM = 0;
        nextY = viewYear + 1;
      }
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, isCurrentMonth: false });
    }
  }

  const yearsList = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const selectedDateStr = toDateString(value);

  return (
    <div className={`bg-white text-slate-900 border border-slate-200/90 rounded-2xl p-4 shadow-xl select-none font-sans w-[280px] sm:w-[300px] ${className}`}>
      {/* Header: Chevrons + Month Select Pill + Year Select Pill */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Previous Month"
        >
          <IoChevronBackOutline size={15} />
        </button>

        <div className="flex items-center gap-2">
          {/* Month Dropdown Pill */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg px-2.5 py-1 text-slate-800 font-bold text-xs transition-colors cursor-pointer">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="appearance-none bg-transparent pr-4 text-slate-800 font-bold text-xs cursor-pointer focus:outline-none"
            >
              {monthNamesShort.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {mName}
                </option>
              ))}
            </select>
            <IoChevronDownOutline size={12} className="absolute right-2 pointer-events-none text-slate-500" />
          </div>

          {/* Year Dropdown Pill */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-lg px-2.5 py-1 text-slate-800 font-bold text-xs transition-colors cursor-pointer">
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="appearance-none bg-transparent pr-4 text-slate-800 font-bold text-xs cursor-pointer focus:outline-none"
            >
              {yearsList.map((yVal) => (
                <option key={yVal} value={yVal}>
                  {yVal}
                </option>
              ))}
            </select>
            <IoChevronDownOutline size={12} className="absolute right-2 pointer-events-none text-slate-500" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Next Month"
        >
          <IoChevronForwardOutline size={15} />
        </button>
      </div>

      {/* Weekday Headings S M T W T F S */}
      <div className="grid grid-cols-7 text-center mb-2">
        {dayHeadingsSingle.map((h, i) => (
          <span key={i} className="text-[12px] font-semibold text-slate-400 py-1">
            {h}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1.5 gap-x-1 font-sans">
        {cells.map((cell, idx) => {
          const { day, dateStr, isCurrentMonth } = cell;
          const isSelected = selectedDateStr === dateStr;

          let btnClass = 'text-slate-800 hover:bg-slate-100 rounded-xl font-semibold';

          if (!isCurrentMonth) {
            btnClass = 'text-slate-300 hover:bg-slate-50 rounded-xl font-normal';
          }

          if (isSelected) {
            btnClass = 'bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800';
          }

          return (
            <button
              key={`${dateStr}-${idx}`}
              type="button"
              onClick={() => handleDaySelect(dateStr)}
              className={`h-9 w-9 mx-auto text-xs flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarRange() {
  const [dateRange, setDateRange] = useState({
    start: '2026-09-03',
    end: '2026-09-09'
  });

  return (
    <RangeCalendar
      value={dateRange}
      onChange={setDateRange}
      numberOfMonths={2}
      className="rounded-2xl border"
    />
  );
}

export default Calendar;
