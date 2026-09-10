import React, { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaTimes, FaSpinner } from "react-icons/fa";
import { apiService } from "../../services/api";

const DEBOUNCE_MS = 300;

/**
 * Instagram-style place search via Google Places (autocomplete + details).
 * value: { name, placeId, lat, lng } | null
 */
export default function LocationAutocomplete({
  value,
  onChange,
  isDarkMode = false,
  disabled = false,
  placeholder = "Search for a location",
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const blurTimerRef = useRef(null);
  const proximityRef = useRef(null);
  const selectedRef = useRef(!!value?.name);

  useEffect(() => {
    if (value?.name) {
      setQuery(value.name);
      selectedRef.current = true;
    } else if (!value) {
      setQuery("");
      selectedRef.current = false;
    }
  }, [value?.name, value?.placeId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        proximityRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const search = (text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = (text || "").trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError("");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const data = await apiService.searchPlaces(
          token,
          q,
          8,
          proximityRef.current,
          controller.signal
        );
        if (controller.signal.aborted) return;
        if (data?.message && (!data.places || data.places.length === 0)) {
          setError(data.message);
        }
        setResults(Array.isArray(data?.places) ? data.places : []);
        setActiveIndex(0);
        setOpen(true);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setResults([]);
        setError("Could not search places");
        setOpen(false);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    selectedRef.current = false;
    if (value) onChange(null);
    search(next);
  };

  const selectPlace = async (place) => {
    if (!place?.placeId) {
      const snapshot = {
        name: (place.fullName || place.name || "").slice(0, 200),
        placeId: null,
        lat: place.lat ?? null,
        lng: place.lng ?? null,
      };
      selectedRef.current = true;
      setQuery(snapshot.name);
      setResults([]);
      setOpen(false);
      onChange(snapshot);
      return;
    }

    setSelecting(true);
    setOpen(false);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = await apiService.getPlaceDetails(token, place.placeId);
      if (!data?.place) {
        throw new Error(data?.message || "Could not load place");
      }
      const snapshot = {
        name: (data.place.name || place.fullName || place.name || "").slice(
          0,
          200
        ),
        placeId: data.place.placeId || place.placeId,
        lat: data.place.lat ?? null,
        lng: data.place.lng ?? null,
      };
      selectedRef.current = true;
      setQuery(snapshot.name);
      setResults([]);
      onChange(snapshot);
    } catch (err) {
      setError(err.message || "Could not load place details");
      // Fallback: still save name without coords
      const snapshot = {
        name: (place.fullName || place.name || "").slice(0, 200),
        placeId: place.placeId || null,
        lat: null,
        lng: null,
      };
      selectedRef.current = true;
      setQuery(snapshot.name);
      setResults([]);
      onChange(snapshot);
    } finally {
      setSelecting(false);
    }
  };

  const clear = () => {
    selectedRef.current = false;
    setQuery("");
    setResults([]);
    setOpen(false);
    setError("");
    onChange(null);
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectPlace(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt
          className={`flex-shrink-0 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
          size={14}
        />
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (results.length > 0 && !selectedRef.current) setOpen(true);
            }}
            onBlur={() => {
              blurTimerRef.current = setTimeout(() => setOpen(false), 150);
            }}
            disabled={disabled || selecting}
            placeholder={placeholder}
            maxLength={200}
            autoComplete="off"
            className={`w-full px-3 py-1.5 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? "bg-gray-700 text-white placeholder-gray-400 border border-gray-600"
                : "bg-gray-100 text-gray-800 placeholder-gray-500 border border-transparent"
            }`}
          />
          {(loading || selecting) && (
            <FaSpinner className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-gray-400 text-xs" />
          )}
          {!loading && !selecting && (query || value) && (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
              aria-label="Clear location"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>

      {error && !open && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{error}</p>
      )}

      {open && results.length > 0 && (
        <ul
          className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          }`}
          role="listbox"
        >
          {results.map((place, i) => (
            <li
              key={place.placeId || `${place.name}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer ${
                i === activeIndex
                  ? isDarkMode
                    ? "bg-gray-700"
                    : "bg-blue-50"
                  : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectPlace(place);
              }}
            >
              <FaMapMarkerAlt
                className="mt-0.5 flex-shrink-0 text-gray-400"
                size={12}
              />
              <div className="min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {place.name}
                </div>
                {(place.subtitle || place.fullName) && (
                  <div
                    className={`text-xs truncate ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {place.subtitle || place.fullName}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
