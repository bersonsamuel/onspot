'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Job } from '@/types';

export const categoryToTitles: Record<string, string[]> = {
  'Catering & Food Service': ['Catering Service', 'Kitchen Helper', 'Cook', 'Waiter', 'Food Server', 'Dishwasher', 'Restaurant Helper', 'Bartender'],
  'Events & Functions': ['Event Staff', 'Wedding Staff', 'Event Coordinator', 'Decoration Worker', 'Usher', 'Ticketing Staff', 'Stage Setup'],
  'Hotel & Hospitality': ['Hotel Staff', 'Housekeeping', 'Receptionist', 'Bellboy', 'Room Service', 'Guest Relations'],
  'Retail & Sales': ['Retail Staff', 'Sales Promoter', 'Cashier', 'Store Helper', 'Inventory Clerk'],
  'Delivery & Logistics': ['Delivery', 'Packing', 'Warehouse Worker', 'Loader/Unloader', 'Driver'],
  'Marketing & Promotion': ['Brand Promoter', 'Pamphlet Distribution', 'Telecaller', 'Field Marketing'],
  'Office & Administration': ['Office Assistant', 'Data Entry', 'Receptionist', 'Clerk', 'Admin Assistant'],
  'Security': ['Security Guard', 'Bouncer', 'Watchman'],
  'Cleaning & Housekeeping': ['Cleaning', 'Housekeeping', 'Janitor', 'Sweeper'],
  'Construction': ['Helper', 'Laborer', 'Mason', 'Painter', 'Carpenter'],
  'Electrical & Plumbing': ['Electrician', 'Plumber', 'Technician', 'AC Mechanic'],
  'Driving & Transport': ['Driver', 'Valet Parking', 'Chauffeur', 'Truck Driver'],
  'Education': ['Tutor', 'Teaching Assistant', 'Librarian'],
  'Healthcare Support': ['Ward Boy', 'Nurse Assistant', 'Caregiver', 'Pharmacy Assistant'],
  'Photography & Videography': ['Photographer', 'Videographer', 'Photo Editor'],
  'IT & Computer': ['Computer Operator', 'IT Support', 'Data Entry'],
  'Design & Creative': ['Graphic Designer', 'Video Editor', 'Content Creator'],
  'Customer Service': ['Customer Support', 'Telecaller', 'Helpdesk'],
  'Manufacturing': ['Assembly Worker', 'Machine Operator', 'Factory Helper'],
  'Warehouse': ['Warehouse Worker', 'Picker', 'Packer', 'Loader'],
  'Agriculture': ['Farm Worker', 'Gardener', 'Harvest Helper'],
  'Beauty & Personal Care': ['Beautician', 'Makeup Artist', 'Hair Stylist'],
  'Other': ['Other Work'],
};

export default function PostWorkModal() {
  const {
    isModalOpen,
    closeModal,
    addNewJob,
    userProfile,
    showToast,
    openModal,
  } = useApp();

  const [category, setCategory] = useState('');
  const [categoryOther, setCategoryOther] = useState('');
  const [title, setTitle] = useState('');
  const [slots, setSlots] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payType, setPayType] = useState('Per Shift');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [genderReq, setGenderReq] = useState('any');
  const [phone, setPhone] = useState('+91 98401 23456');

  React.useEffect(() => {
    const handleDate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setDate(customEvent.detail);
    };
    const handleTime = (e: Event) => {
      const customEvent = e as CustomEvent<{ start: string; end: string }>;
      if (customEvent.detail) {
        setStartTime(customEvent.detail.start);
        setEndTime(customEvent.detail.end);
      }
    };
    const handleReportingTime = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setReportingTime(customEvent.detail);
    };
    const handleCategory = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCategory(customEvent.detail);
        setTitle('');
      }
    };
    const handleLocation = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setLocation(customEvent.detail);
    };

    window.addEventListener('onspot:date-picked', handleDate);
    window.addEventListener('onspot:time-picked', handleTime);
    window.addEventListener('onspot:reporting-time-picked', handleReportingTime);
    window.addEventListener('onspot:category-picked', handleCategory);
    window.addEventListener('onspot:location-picked', handleLocation);

    return () => {
      window.removeEventListener('onspot:date-picked', handleDate);
      window.removeEventListener('onspot:time-picked', handleTime);
      window.removeEventListener('onspot:reporting-time-picked', handleReportingTime);
      window.removeEventListener('onspot:category-picked', handleCategory);
      window.removeEventListener('onspot:location-picked', handleLocation);
    };
  }, []);

  if (!isModalOpen('post-modal')) return null;

  const titleOptions = category ? categoryToTitles[category] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = category === 'Other' ? categoryOther : category;
    if (!finalCategory) {
      showToast('⚠️ Please select a work category.');
      return;
    }
    if (!title) {
      showToast('⚠️ Work Title is required.');
      return;
    }
    if (!slots || parseInt(slots, 10) < 1) {
      showToast('⚠️ Please enter number of workers.');
      return;
    }
    if (!payAmount) {
      showToast('⚠️ Please enter payment amount.');
      return;
    }
    if (!date) {
      showToast('⚠️ Please select the work date.');
      openModal('date-picker-modal');
      return;
    }
    if (!startTime || !endTime) {
      showToast('⚠️ Please select shift timing.');
      openModal('time-picker-modal');
      return;
    }
    if (!venueName) {
      showToast('⚠️ Please enter the venue name.');
      return;
    }
    if (!location) {
      showToast('⚠️ Please select work location.');
      openModal('location-picker-modal');
      return;
    }

    const newOpening: Job = {
      id: `shift-custom-${Date.now()}`,
      category: finalCategory,
      categoryDisplay: finalCategory,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
      title: title,
      dealerName: userProfile.name,
      dealerRating: 5.0,
      pay: `₹${payAmount} ${payType.replace('Per ', '/ ')}`,
      payType: payType,
      rawPay: parseInt(payAmount, 10) || 800,
      loc: `${venueName}, ${location}`,
      date: date,
      time: `${startTime} – ${endTime}`,
      slotsTotal: parseInt(slots, 10),
      slotsFilled: 0,
      urgent: true,
      instantPay: true,
      perks: ['Morning Breakfast Provided', 'Instant UPI Payout'],
      requirements: 'Punctuality, discipline, and neat grooming.',
      dressCode: 'Formals or Smart Casuals as requested',
      description:
        details ||
        `Work requirement posted by ${userProfile.name}. Need ${slots} reliable workers for ${finalCategory}. Contact: ${phone}`,
      phone: phone,
      genderReq: genderReq,
    };

    addNewJob(newOpening);
    closeModal('post-modal');
  };

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay open" id="post-modal">
      <div className="modal-card">
        <div
          className="modal-header"
          style={{ justifyContent: 'flex-start', marginBottom: '16px' }}
        >
          <h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mint-primary)"
              strokeWidth="2.5"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Post Work Requirement
          </h3>
        </div>

        <form id="work-requirement-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>
              Work Category <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="post-category"
              className="form-control"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setTitle('');
              }}
            >
              <option value="" disabled>
                Select Work Category ▼
              </option>
              {Object.keys(categoryToTitles).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Work Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="post-title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              >
                <option value="" disabled>
                  Select Work Title ▼
                </option>
                {titleOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                Workers Needed <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="number"
                id="post-slots"
                className="form-control"
                min="1"
                max="100"
                placeholder="e.g. 8"
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
              />
            </div>
          </div>

          {category === 'Other' && (
            <div
              className="form-group"
              id="other-category-group"
              style={{ marginTop: '-12px', marginBottom: '16px' }}
            >
              <label>
                Other Work Category <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                id="post-category-other"
                className="form-control"
                placeholder="Enter work category"
                value={categoryOther}
                onChange={(e) => setCategoryOther(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>
              Payment <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                id="post-pay-amount"
                className="form-control"
                placeholder="₹800"
                min="1"
                style={{ flex: 1 }}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <select
                id="post-pay-type"
                className="form-control"
                style={{ flex: 1.5 }}
                value={payType}
                onChange={(e) => setPayType(e.target.value)}
              >
                <option value="Per Shift">Per Shift</option>
                <option value="Per Day">Per Day</option>
                <option value="Per Hour">Per Hour</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Date of Work <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div
                className="custom-select-box"
                id="display-post-date-box"
                onClick={() => openModal('date-picker-modal')}
              >
                <span id="display-post-date">
                  {date ? `📅 ${date}` : '📅 Select Date'}
                </span>
              </div>
              <input type="hidden" id="post-date" value={date} />
            </div>

            <div className="form-group">
              <label>
                Shift Timing <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div
                className="custom-select-box"
                id="display-post-time-box"
                onClick={() => openModal('time-picker-modal')}
              >
                <span id="display-post-time">
                  {startTime && endTime
                    ? `🕐 ${startTime} – ${endTime}`
                    : '🕐 Select Shift Timing'}
                </span>{' '}
                ›
              </div>

              <label style={{ marginTop: '12px', display: 'block' }}>
                Reporting Time
              </label>
              <div
                className="custom-select-box"
                onClick={() => openModal('reporting-time-modal')}
                style={{ marginTop: '8px' }}
              >
                <span id="display-reporting-time">
                  {reportingTime ? `⏱️ ${reportingTime}` : '⏱️ Select Reporting Time'}
                </span>{' '}
                ›
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              Venue <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="post-venue-name"
              className="form-control"
              placeholder="e.g. Royal Palace Banquets"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Location <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div
              className="custom-select-box"
              id="display-post-location-box"
              onClick={() => openModal('location-picker-modal')}
            >
              <span id="display-post-location">
                {location ? `📍 ${location}` : '📍 Search / Select Location'}
              </span>{' '}
              ›
            </div>
            <input type="hidden" id="post-location" value={location} />
          </div>

          <div className="form-group">
            <label>Work Details</label>
            <textarea
              id="post-details"
              className="form-control"
              rows={2}
              placeholder="Briefly describe the work, responsibilities and anything workers should know."
              style={{ resize: 'vertical', minHeight: '60px' }}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Gender Requirement</label>
            <select
              id="post-gender-req"
              className="form-control"
              value={genderReq}
              onChange={(e) => setGenderReq(e.target.value)}
            >
              <option value="any">Anyone</option>
              <option value="girls">Girls Only</option>
              <option value="boys">Boys Only</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Contact Number <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="tel"
              id="post-phone"
              className="form-control"
              placeholder="e.g. +91 98401 23456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="form-actions-bottom" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => closeModal('post-modal')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Post Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
