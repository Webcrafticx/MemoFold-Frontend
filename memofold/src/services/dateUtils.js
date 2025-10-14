// dateUtils.js

// Utility function to get current Indian date in YYYY-MM-DD format
export const getIndianDateString = () => {
    const now = new Date();
    const indianDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const year = indianDate.getFullYear();
    const month = String(indianDate.getMonth() + 1).padStart(2, "0");
    const day = String(indianDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Get current time in UTC for server
export const getCurrentUTCTime = () => {
    return new Date().toISOString();
};

// Convert selected date to UTC datetime for server
export const getSelectedDateUTC = (selectedDate) => {
    if (!selectedDate) return getCurrentUTCTime();

    const now = new Date();
    const selectedDateObj = new Date(selectedDate);

    // Use current time but with selected date
    selectedDateObj.setHours(now.getHours());
    selectedDateObj.setMinutes(now.getMinutes());
    selectedDateObj.setSeconds(now.getSeconds());

    return selectedDateObj.toISOString();
};

// Convert UTC to IST for display
export const convertUTCToIST = (utcDateString) => {
    try {
        if (!utcDateString) return new Date().toISOString();

        const utcDate = new Date(utcDateString);

        // IST is UTC+5:30
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffset);

        return istDate.toISOString();
    } catch (error) {
        console.error("UTC to IST conversion error:", error);
        return utcDateString;
    }
};

// Temporary debug version
export const formatDate = (dateString) => {
    try {
        if (!dateString) return "Just now";

        // Try to detect if this is a comment date that needs adjustment
        const date = new Date(dateString);
        const now = new Date();

        let diffInSeconds = Math.floor((now - date) / 1000);

        // If it's a future date (negative), it's probably a mislabeled IST time
        if (diffInSeconds < 0) {
            // Add 5.5 hours to convert from "UTC-labeled-IST" to actual time
            diffInSeconds = Math.floor(
                (now - new Date(date.getTime() - 5.5 * 60 * 60 * 1000)) / 1000
            );
        }

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        console.error("Date error:", e);
        return "Just now";
    }
};

// Format date with time for detailed display
export const formatDateTime = (utcDateString) => {
    try {
        if (!utcDateString) return "";

        // Convert UTC to IST
        const istDate = convertUTCToIST(utcDateString);
        const date = new Date(istDate);

        return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch (error) {
        console.error("DateTime formatting error:", error);
        return "";
    }
};

// Check if a date is today in IST
export const isTodayIST = (utcDateString) => {
    try {
        const istDate = convertUTCToIST(utcDateString);
        const date = new Date(istDate);
        const today = new Date();

        return date.toDateString() === today.toDateString();
    } catch (error) {
        return false;
    }
};

// Get readable time difference
export const getTimeDifference = (utcDateString) => {
    try {
        const istDate = convertUTCToIST(utcDateString);
        const past = new Date(istDate);
        const now = new Date();
        const nowIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

        const diffMs = nowIST - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return "Just now";
    } catch (error) {
        return "Just now";
    }
};

// Backward compatibility functions
export const getCurrentIndianTimeISO = () => {
    // For backward compatibility - now returns UTC
    return getCurrentUTCTime();
};

export const convertToIndianTime = (dateString) => {
    // For backward compatibility - now converts UTC to IST
    return convertUTCToIST(dateString);
};

export const getCurrentIndianTimestamp = () => {
    return new Date();
};

export const formatToIndianDate = (utcDateString) => {
    try {
        const istDate = convertUTCToIST(utcDateString);
        const date = new Date(istDate);

        return date.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        return "Invalid date";
    }
};
