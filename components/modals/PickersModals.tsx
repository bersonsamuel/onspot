'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const allCategoriesList = [
  'Catering Service', 'Event Staff', 'Event Management', 'Event Promotions',
  'Marketing', 'Sales', 'Retail', 'Shop Assistant', 'Cashier', 'Delivery',
  'Food Delivery', 'Warehouse', 'Packing', 'Loading & Unloading', 'Hospitality',
  'Hotel Staff', 'Restaurant Staff', 'Housekeeping', 'Security', 'Reception',
  'Customer Support', 'Office Assistant', 'Data Entry', 'Computer Operator',
  'Photography', 'Videography', 'Social Media', 'Content Creation',
  'Graphic Design', 'Teaching', 'Tuition', 'Babysitting', 'Caretaking',
  'Cleaning', 'Driver', 'Construction', 'Electrician', 'Plumber',
  'Technician', 'Stage & Logistics', 'Setup Crew', 'Pamphlet Distribution',
  'Ushering & VIP Support', 'Promotional Staff', 'Freelancer',
  'Part-Time General Work', 'Other'
];

const allLocationsList = [
  'Chennai, Tamil Nadu', 'Coimbatore, Tamil Nadu', 'Madurai, Tamil Nadu',
  'Trichy, Tamil Nadu', 'Salem, Tamil Nadu', 'Tirunelveli, Tamil Nadu',
  'Erode, Tamil Nadu', 'Vellore, Tamil Nadu', 'Thanjavur, Tamil Nadu',
  'Tiruppur, Tamil Nadu', 'Thoothukudi, Tamil Nadu', 'Dindigul, Tamil Nadu',
  'Kanchipuram, Tamil Nadu', 'Kanyakumari, Tamil Nadu', 'Bengaluru, Karnataka',
  'Mysuru, Karnataka', 'Mangaluru, Karnataka', 'Hubballi, Karnataka',
  'Hyderabad, Telangana', 'Warangal, Telangana', 'Mumbai, Maharashtra',
  'Pune, Maharashtra', 'Nagpur, Maharashtra', 'Nashik, Maharashtra',
  'Delhi, NCR', 'Gurugram, Haryana', 'Noida, Uttar Pradesh',
  'Kolkata, West Bengal', 'Kochi, Kerala', 'Thiruvananthapuram, Kerala',
  'Kozhikode, Kerala', 'Ahmedabad, Gujarat'
];

export default function PickersModals() {
  const { activeModal, closeModal } = useApp();

  // Date Picker State
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  // Time Picker State
  const [activeTimeBox, setActiveTimeBox] = useState<'start' | 'end'>('start');
  const [startTime, setStartTime] = useState('05:30 PM');
  const [endTime, setEndTime] = useState('11:00 PM');
  const [tpHour, setTpHour] = useState('05');
  const [tpMinute, setTpMinute] = useState('30');
  const [tpAmpm, setTpAmpm] = useState('PM');

  // Reporting Time State
  const [reportingTime, setReportingTime] = useState('05:00 PM');
  const [rtpHour, setRtpHour] = useState('05');
  const [rtpMinute, setRtpMinute] = useState('00');
  const [rtpAmpm, setRtpAmpm] = useState('PM');

  // Category & Location Search State
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');

  const dispatchPickerEvent = (name: string, detail: unknown) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  };

  // --- Date Picker Logic ---
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleMonthChange = (delta: number) => {
    setCalendarDate(new Date(currentYear, currentMonth + delta, 1));
  };

  const handleSelectDate = (day: number) => {
    const formatted = `${day} ${months[currentMonth]} ${currentYear}`;
    dispatchPickerEvent('onspot:date-picked', formatted);
    closeModal('date-picker-modal');
  };

  const handleSelectQuickDate = (type: 'today' | 'tomorrow') => {
    const d = new Date();
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    const formatted = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const res = type === 'today' ? `Today, ${formatted}` : `Tomorrow, ${formatted}`;
    dispatchPickerEvent('onspot:date-picked', res);
    closeModal('date-picker-modal');
  };

  // --- Time Picker Logic ---
  const handleTimeChange = (h: string, m: string, a: string) => {
    const formatted = `${h}:${m} ${a}`;
    if (activeTimeBox === 'start') {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
  };

  const handleSetQuickTime = (timeStr: string) => {
    if (activeTimeBox === 'start') {
      setStartTime(timeStr);
      setActiveTimeBox('end');
    } else {
      setEndTime(timeStr);
    }
  };

  const handleSaveTime = () => {
    dispatchPickerEvent('onspot:time-picked', { start: startTime, end: endTime });
    closeModal('time-picker-modal');
  };

  // --- Reporting Time Logic ---
  const handleSaveReportingTime = () => {
    const val = `${rtpHour}:${rtpMinute} ${rtpAmpm}`;
    setReportingTime(val);
    dispatchPickerEvent('onspot:reporting-time-picked', val);
    closeModal('reporting-time-modal');
  };

  // --- Category Picker Logic ---
  const handleSelectCategory = (cat: string) => {
    dispatchPickerEvent('onspot:category-picked', cat);
    closeModal('category-picker-modal');
  };

  // --- Location Picker Logic ---
  const handleSelectLocation = (loc: string) => {
    dispatchPickerEvent('onspot:location-picked', loc);
    closeModal('location-picker-modal');
  };

  return (
    <>
      {/* ==================== DATE PICKER MODAL ==================== */}
      <div
        className={`modal-overlay ${activeModal === 'date-picker-modal' ? 'open' : ''}`}
        id="date-picker-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal('date-picker-modal');
        }}
      >
        <div className="modal-card" style={{ maxWidth: '320px' }}>
          <div className="modal-header">
            <h3>📅 Select Date</h3>
            <button className="close-btn" aria-label="Close" onClick={() => closeModal('date-picker-modal')}>
              ✕
            </button>
          </div>
          <div className="date-picker-container">
            <div className="date-picker-header">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => handleMonthChange(-1)}
                style={{ padding: '4px 8px' }}
              >
                &lt;
              </button>
              <div id="date-picker-month-year" style={{ fontWeight: 700 }}>
                {months[currentMonth]} {currentYear}
              </div>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => handleMonthChange(1)}
                style={{ padding: '4px 8px' }}
              >
                &gt;
              </button>
            </div>
            <div className="date-picker-days-header">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>
            <div className="date-picker-grid" id="date-picker-grid">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="date-picker-day empty" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === currentMonth &&
                  new Date().getFullYear() === currentYear;
                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`date-picker-day ${isToday ? 'today' : ''}`}
                    onClick={() => handleSelectDate(dayNum)}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary-sidebar"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                }}
                onClick={() => handleSelectQuickDate('today')}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-secondary-sidebar"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                }}
                onClick={() => handleSelectQuickDate('tomorrow')}
              >
                Tomorrow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TIME PICKER MODAL ==================== */}
      <div
        className={`modal-overlay ${activeModal === 'time-picker-modal' ? 'open' : ''}`}
        id="time-picker-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal('time-picker-modal');
        }}
      >
        <div className="modal-card" style={{ maxWidth: '340px' }}>
          <div className="modal-header">
            <h3>🕐 Shift Timing</h3>
            <button className="close-btn" aria-label="Close" onClick={() => closeModal('time-picker-modal')}>
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div
              className={`time-picker-box ${activeTimeBox === 'start' ? 'active' : ''}`}
              id="tp-start-box"
              onClick={() => setActiveTimeBox('start')}
            >
              <div className="tp-label">START TIME</div>
              <div className="tp-value" id="tp-start-value">
                {startTime}
              </div>
            </div>
            <div
              className={`time-picker-box ${activeTimeBox === 'end' ? 'active' : ''}`}
              id="tp-end-box"
              onClick={() => setActiveTimeBox('end')}
            >
              <div className="tp-label">END TIME</div>
              <div className="tp-value" id="tp-end-value">
                {endTime}
              </div>
            </div>
          </div>

          <div className="time-wheels-container">
            <select
              id="tp-hour"
              className="tp-wheel"
              size={5}
              value={tpHour}
              onChange={(e) => {
                setTpHour(e.target.value);
                handleTimeChange(e.target.value, tpMinute, tpAmpm);
              }}
            >
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <div className="tp-colon">:</div>
            <select
              id="tp-minute"
              className="tp-wheel"
              size={5}
              value={tpMinute}
              onChange={(e) => {
                setTpMinute(e.target.value);
                handleTimeChange(tpHour, e.target.value, tpAmpm);
              }}
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              id="tp-ampm"
              className="tp-wheel"
              size={2}
              value={tpAmpm}
              onChange={(e) => {
                setTpAmpm(e.target.value);
                handleTimeChange(tpHour, tpMinute, e.target.value);
              }}
              style={{ height: '60px' }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="tp-quick-options" id="tp-quick-options">
            {['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM', '10:00 PM', '11:00 PM'].map(
              (t) => (
                <button key={t} type="button" onClick={() => handleSetQuickTime(t)}>
                  {t.replace('0', '')}
                </button>
              )
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => closeModal('time-picker-modal')}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-action-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleSaveTime}
            >
              Save Time
            </button>
          </div>
        </div>
      </div>

      {/* ==================== REPORTING TIME PICKER MODAL ==================== */}
      <div
        className={`modal-overlay ${activeModal === 'reporting-time-modal' ? 'open' : ''}`}
        id="reporting-time-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal('reporting-time-modal');
        }}
      >
        <div className="modal-card" style={{ maxWidth: '320px' }}>
          <div className="modal-header">
            <h3>🕐 Reporting Time</h3>
            <button className="close-btn" aria-label="Close" onClick={() => closeModal('reporting-time-modal')}>
              ✕
            </button>
          </div>
          <div className="time-picker-box active" style={{ marginBottom: '16px' }}>
            <div className="tp-label">REPORTING TIME</div>
            <div className="tp-value" id="rtp-value">
              {`${rtpHour}:${rtpMinute} ${rtpAmpm}`}
            </div>
          </div>

          <div className="time-wheels-container">
            <select
              id="rtp-hour"
              className="tp-wheel"
              size={5}
              value={rtpHour}
              onChange={(e) => setRtpHour(e.target.value)}
            >
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <div className="tp-colon">:</div>
            <select
              id="rtp-minute"
              className="tp-wheel"
              size={5}
              value={rtpMinute}
              onChange={(e) => setRtpMinute(e.target.value)}
            >
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select
              id="rtp-ampm"
              className="tp-wheel"
              size={2}
              value={rtpAmpm}
              onChange={(e) => setRtpAmpm(e.target.value)}
              style={{ height: '60px' }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-cancel"
              style={{ flex: 1 }}
              onClick={() => closeModal('reporting-time-modal')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-action-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleSaveReportingTime}
            >
              Save Time
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CATEGORY PICKER MODAL ==================== */}
      <div
        className={`modal-overlay ${activeModal === 'category-picker-modal' ? 'open' : ''}`}
        id="category-picker-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal('category-picker-modal');
        }}
      >
        <div
          className="modal-card"
          style={{
            maxWidth: '360px',
            height: '80vh',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="modal-header">
            <h3>🔍 Select Work Category</h3>
            <button className="close-btn" aria-label="Close" onClick={() => closeModal('category-picker-modal')}>
              ✕
            </button>
          </div>
          <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              id="category-search"
              className="form-control"
              placeholder="Search category (e.g. Photo, Event)..."
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
            />
          </div>
          <div
            id="category-list"
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {allCategoriesList
              .filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()))
              .map((c) => (
                <button
                  key={c}
                  type="button"
                  className="btn-secondary-sidebar"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleSelectCategory(c)}
                >
                  {c}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* ==================== LOCATION PICKER MODAL ==================== */}
      <div
        className={`modal-overlay ${activeModal === 'location-picker-modal' ? 'open' : ''}`}
        id="location-picker-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal('location-picker-modal');
        }}
      >
        <div
          className="modal-card"
          style={{
            maxWidth: '360px',
            height: '80vh',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="modal-header">
            <h3>📍 Select Location</h3>
            <button className="close-btn" aria-label="Close" onClick={() => closeModal('location-picker-modal')}>
              ✕
            </button>
          </div>
          <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn-secondary-sidebar"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
              onClick={() => handleSelectLocation('Current Location')}
            >
              📍 Use Current Location
            </button>
            <input
              type="text"
              id="location-search"
              className="form-control"
              placeholder="Search location (e.g. Chennai, Mumbai)..."
              value={locSearch}
              onChange={(e) => setLocSearch(e.target.value)}
            />
          </div>
          <div
            id="location-list"
            style={{
              overflowY: 'auto',
              flex: 1,
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {allLocationsList
              .filter((l) => l.toLowerCase().includes(locSearch.toLowerCase()))
              .map((l) => (
                <button
                  key={l}
                  type="button"
                  className="btn-secondary-sidebar"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleSelectLocation(l)}
                >
                  {l}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
