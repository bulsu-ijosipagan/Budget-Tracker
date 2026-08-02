import { useMemo, useState } from "react";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthCells(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export default function CalendarPanel({ open, onClose }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const todayKey = toMonthKey(new Date());
  const monthCells = useMemo(() => buildMonthCells(viewDate), [viewDate]);

  if (!open) return null;

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToToday = () => setViewDate(new Date());

  return (
    <div className="calendar-overlay" role="presentation" onClick={onClose}>
      <div
        className="calendar-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Calendar"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="calendar-header">
          <div>
            <div className="calendar-title">Calendar</div>
            <div className="muted small">Quick month view</div>
          </div>
          <button className="btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="calendar-toolbar">
          <button
            className="btn-secondary"
            onClick={() => setViewDate((current) => shiftMonth(current, -1))}
            type="button"
          >
            Prev
          </button>
          <strong>{monthLabel}</strong>
          <button
            className="btn-secondary"
            onClick={() => setViewDate((current) => shiftMonth(current, 1))}
            type="button"
          >
            Next
          </button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {monthCells.map((date, index) => {
            if (!date) {
              return (
                <div key={`empty-${index}`} className="calendar-cell empty" />
              );
            }

            const isToday =
              toMonthKey(date) === todayKey &&
              date.getDate() === new Date().getDate();

            return (
              <div
                key={date.toISOString()}
                className={`calendar-cell ${isToday ? "today" : ""}`}
              >
                <span>{date.getDate()}</span>
              </div>
            );
          })}
        </div>

        <div className="calendar-footer">
          <button className="btn-secondary" onClick={goToToday} type="button">
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
