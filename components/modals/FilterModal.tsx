'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { KNOWN_LOCALITIES, CATEGORIES } from '@/lib/initialData';

export default function FilterModal() {
  const {
    activeModal,
    closeModal,
    advancedFilters,
    setAdvancedFilters,
    showToast,
  } = useApp();

  const [draftLocation, setDraftLocation] = useState<{ name: string; lat: number; lng: number } | null>(
    advancedFilters.location
  );
  const [draftDistance, setDraftDistance] = useState<number | null>(advancedFilters.distanceKm);
  const [draftCategories, setDraftCategories] = useState<Set<string>>(
    new Set(advancedFilters.categories)
  );
  const [draftDate, setDraftDate] = useState<string | null>(advancedFilters.dateFilter);
  const [draftSalaryMin, setDraftSalaryMin] = useState<string>(
    advancedFilters.salaryMin != null ? String(advancedFilters.salaryMin) : ''
  );
  const [draftSalaryMax, setDraftSalaryMax] = useState<string>(
    advancedFilters.salaryMax != null ? String(advancedFilters.salaryMax) : ''
  );
  const [draftDuration, setDraftDuration] = useState<string | null>(advancedFilters.duration);
  const [draftGender, setDraftGender] = useState<string | null>(advancedFilters.gender || 'any');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (activeModal === 'filter-modal') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftLocation(advancedFilters.location);
       
      setDraftDistance(advancedFilters.distanceKm);
       
      setDraftCategories(new Set(advancedFilters.categories));
       
      setDraftDate(advancedFilters.dateFilter);
       
      setDraftSalaryMin(advancedFilters.salaryMin != null ? String(advancedFilters.salaryMin) : '');
       
      setDraftSalaryMax(advancedFilters.salaryMax != null ? String(advancedFilters.salaryMax) : '');
       
      setDraftDuration(advancedFilters.duration);
       
      setDraftGender(advancedFilters.gender || 'any');
    }
  }, [activeModal, advancedFilters]);

  if (activeModal !== 'filter-modal') {
    return null;
  }

  const handleLocalitySelect = (loc: typeof KNOWN_LOCALITIES[number]) => {
    if (draftLocation?.name === loc.name) {
      setDraftLocation(null);
    } else {
      setDraftLocation({ name: loc.name, lat: loc.lat, lng: loc.lng });
    }
  };

  const requestNearMe = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showToast("Location access isn't available on this device. Please pick a locality manually.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftLocation({
          name: 'Near Me',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setDetectingLocation(false);
      },
      () => {
        showToast('Location permission denied. Please choose a locality from the list instead.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const turnLocationOff = () => {
    setDraftLocation(null);
    setDraftDistance(null);
  };

  const toggleCategory = (catKey: string) => {
    setDraftCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  const handleApply = () => {
    setAdvancedFilters({
      categories: Array.from(draftCategories),
      dateFilter: draftDate,
      duration: draftDuration,
      gender: draftGender,
      location: draftLocation,
      distanceKm: draftLocation ? draftDistance || 10 : draftDistance,
      salaryMin: draftSalaryMin ? Number(draftSalaryMin) : null,
      salaryMax: draftSalaryMax ? Number(draftSalaryMax) : null,
    });
    closeModal('filter-modal');
    showToast('Filters applied!');
  };

  const handleClearAll = () => {
    setDraftLocation(null);
    setDraftDistance(null);
    setDraftCategories(new Set());
    setDraftDate(null);
    setDraftSalaryMin('');
    setDraftSalaryMax('');
    setDraftDuration(null);
    setDraftGender('any');

    setAdvancedFilters({
      categories: [],
      dateFilter: null,
      duration: null,
      gender: null,
      location: null,
      distanceKm: null,
      salaryMin: null,
      salaryMax: null,
    });
    showToast('Filters cleared');
  };

  const selectableCategories = CATEGORIES.filter((c) => c.key !== 'All');

  return (
    <div
      className={`modal-overlay ${activeModal === 'filter-modal' ? 'open' : ''}`}
      id="filter-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal('filter-modal');
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mint-primary)"
              strokeWidth="2.5"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter Shifts
          </h3>
          <button className="close-btn" aria-label="Close" onClick={() => closeModal('filter-modal')}>
            ✕
          </button>
        </div>

        {/* Location / Nearby */}
        <div className="filter-section">
          <div className="filter-section-title">📍 Location / Nearby</div>
          <button
            className="btn-near-me"
            id="btn-near-me"
            onClick={requestNearMe}
            disabled={detectingLocation}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            {detectingLocation ? 'Detecting your location...' : 'Use My Current Location'}
          </button>
          <div className="filter-locality-row" id="filter-locality-row">
            {KNOWN_LOCALITIES.map((loc) => (
              <button
                key={loc.name}
                className={`filter-option-btn ${draftLocation?.name === loc.name ? 'active' : ''}`}
                onClick={() => handleLocalitySelect(loc)}
              >
                {loc.name}
              </button>
            ))}
          </div>
          <div
            className={`filter-location-active ${draftLocation ? 'show' : ''}`}
            id="filter-location-active"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span id="filter-location-active-text">
              {draftLocation ? `Using: ${draftLocation.name}` : 'Location selected'}
            </span>
          </div>
          <button
            className="btn-cancel"
            style={{
              marginTop: '8px',
              width: '100%',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={turnLocationOff}
          >
            Location OFF
          </button>
        </div>

        {/* Distance */}
        <div className="filter-section">
          <div className="filter-section-title">Distance</div>
          <div className="filter-option-grid" id="filter-distance-group">
            {[1, 2, 3, 5, 10, 15].map((km) => (
              <button
                key={km}
                className={`filter-option-btn ${draftDistance === km ? 'active' : ''}`}
                data-distance={km}
                onClick={() => setDraftDistance(draftDistance === km ? null : km)}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>

        {/* Job Category */}
        <div className="filter-section">
          <div className="filter-section-title">Job Category</div>
          <div className="filter-option-grid" id="filter-category-group">
            {selectableCategories.map((c) => (
              <button
                key={c.key}
                className={`filter-option-btn ${draftCategories.has(c.key) ? 'active' : ''}`}
                data-category={c.key}
                onClick={() => toggleCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="filter-section">
          <div className="filter-section-title">Date</div>
          <div className="filter-option-grid" id="filter-date-group">
            {[
              { val: 'today', label: 'Today' },
              { val: 'tomorrow', label: 'Tomorrow' },
              { val: 'upcoming', label: 'Upcoming' },
            ].map((d) => (
              <button
                key={d.val}
                className={`filter-option-btn ${draftDate === d.val ? 'active' : ''}`}
                data-date={d.val}
                onClick={() => setDraftDate(draftDate === d.val ? null : d.val)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="filter-section">
          <div className="filter-section-title">Salary Range (₹ per shift)</div>
          <div className="filter-salary-row">
            <input
              type="number"
              className="form-control"
              id="filter-salary-min"
              placeholder="Min e.g. 500"
              min="0"
              value={draftSalaryMin}
              onChange={(e) => setDraftSalaryMin(e.target.value)}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="number"
              className="form-control"
              id="filter-salary-max"
              placeholder="Max e.g. 1200"
              min="0"
              value={draftSalaryMax}
              onChange={(e) => setDraftSalaryMax(e.target.value)}
            />
          </div>
        </div>

        {/* Job Duration */}
        <div className="filter-section">
          <div className="filter-section-title">Job Duration</div>
          <div className="filter-option-grid" id="filter-duration-group">
            {[
              { val: 'short', label: 'Short (< 4 hrs)' },
              { val: 'medium', label: 'Medium (4–6 hrs)' },
              { val: 'long', label: 'Long (6+ hrs)' },
            ].map((dur) => (
              <button
                key={dur.val}
                className={`filter-option-btn ${draftDuration === dur.val ? 'active' : ''}`}
                data-duration={dur.val}
                onClick={() => setDraftDuration(draftDuration === dur.val ? null : dur.val)}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Eligibility */}
        <div className="filter-section">
          <div className="filter-section-title">Gender Eligibility</div>
          <div className="filter-option-grid" id="filter-gender-group">
            {[
              { val: 'any', label: 'Any' },
              { val: 'boys', label: 'Boys Only' },
              { val: 'girls', label: 'Girls Only' },
            ].map((g) => (
              <button
                key={g.val}
                className={`filter-option-btn ${draftGender === g.val ? 'active' : ''}`}
                data-gender={g.val}
                onClick={() => setDraftGender(g.val)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-drawer-footer">
          <button
            type="button"
            className="btn-cancel"
            style={{ flex: 1 }}
            onClick={handleClearAll}
          >
            Clear All
          </button>
          <button
            type="button"
            className="btn-submit"
            style={{ flex: 2 }}
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
