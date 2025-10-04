import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import config from "../../hooks/config";

const CalendarDropdown = ({
    showDropdown,
    onClose,
    darkMode,
    token,
    username,
    navigate,
    calendarRef, // parent ref for outside click handling
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [postCounts, setPostCounts] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showDropdown && token) {
            fetchPostCounts();
        }
    }, [showDropdown, currentDate, token]);

    const fetchPostCounts = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            const response = await fetch(
                `${config.apiUrl}/posts/calendar?year=${year}&month=${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                setPostCounts(result.counts || {});
            }
        } catch (error) {
            console.error("Error fetching post counts:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const handlePrevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
        );
    };

    const handleDateClick = (day) => {
        const selectedDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        const dateStr = selectedDate.toISOString().split("T")[0];

        navigate(`/profile?date=${dateStr}`);
        onClose();
    };

    const formatMonthYear = () => {
        return currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (!showDropdown) return null;

    return (
        <div
            ref={calendarRef}
            className={`absolute right-0 mt-2 w-72 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } ring-1 ring-black ring-opacity-5 z-50 p-4`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
                <h2 className="text-lg font-bold">My Calendar</h2>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={handlePrevMonth}
                    className={`p-2 rounded-full transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                >
                    <FiChevronLeft className="w-5 h-5" />
                </button>

                <h3 className="text-sm font-semibold">{formatMonthYear()}</h3>

                <button
                    onClick={handleNextMonth}
                    className={`p-2 rounded-full transition-colors ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                >
                    <FiChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div>
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className={`text-center font-semibold py-1 text-xs ${
                                        darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startingDayOfWeek }).map(
                                (_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="aspect-square"
                                    />
                                )
                            )}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${currentDate.getFullYear()}-${String(
                                    currentDate.getMonth() + 1
                                ).padStart(2, "0")}-${String(day).padStart(
                                    2,
                                    "0"
                                )}`;
                                const count = postCounts[dateStr] || 0;
                                const isToday =
                                    new Date().toDateString() ===
                                    new Date(
                                        currentDate.getFullYear(),
                                        currentDate.getMonth(),
                                        day
                                    ).toDateString();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`aspect-square rounded-md flex flex-col items-center justify-center transition-all text-xs ${
                                            isToday
                                                ? darkMode
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-blue-500 text-white"
                                                : darkMode
                                                ? "bg-gray-700 hover:bg-gray-600"
                                                : "bg-gray-100 hover:bg-gray-200"
                                        } ${
                                            count > 0
                                                ? "ring-2 ring-green-500"
                                                : ""
                                        }`}
                                    >
                                        <span className="font-medium">
                                            {day}
                                        </span>
                                        {count > 0 && (
                                            <span
                                                className={`mt-0.5 px-1 rounded-full text-[10px] ${
                                                    isToday
                                                        ? "bg-white text-blue-600"
                                                        : darkMode
                                                        ? "bg-green-600 text-white"
                                                        : "bg-green-500 text-white"
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalendarDropdown;
