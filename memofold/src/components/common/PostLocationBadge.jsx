import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function PostLocationBadge({ location, className = "" }) {
  if (!location?.name) return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}
    >
      <FaMapMarkerAlt className="flex-shrink-0 text-xs" aria-hidden />
      <span className="truncate">{location.name}</span>
    </div>
  );
}
