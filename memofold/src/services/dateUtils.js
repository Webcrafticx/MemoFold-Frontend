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

// NEW FUNCTION: Get current Indian time in IST format (not UTC)
export const getCurrentIndianTimeIST = () => {
    const now = new Date();
    const indianDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const year = indianDate.getFullYear();
    const month = String(indianDate.getMonth() + 1).padStart(2, "0");
    const day = String(indianDate.getDate()).padStart(2, "0");
    const hours = String(indianDate.getHours()).padStart(2, "0");
    const minutes = String(indianDate.getMinutes()).padStart(2, "0");
    const seconds = String(indianDate.getSeconds()).padStart(2, "0");

    // IST format: YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// NEW FUNCTION: Convert selected date to IST datetime
export const getSelectedDateIST = (selectedDate) => {
    if (!selectedDate) return getCurrentIndianTimeIST();

    const now = new Date();
    const indianTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const timeString = indianTime.toTimeString().split(" ")[0]; // HH:MM:SS

    // Selected date + current Indian time
    return `${selectedDate} ${timeString}`;
};

export const formatDate = (dateString) => {
    try {
        if (!dateString) return "Just now";

        console.log("Original date:", dateString);

        // Server date ko UTC samjho aur usme 5.5 hours SUBTRACT kar do
        const serverDate = new Date(dateString);

        if (isNaN(serverDate.getTime())) {
            return "Just now";
        }

        // Server date ko adjust karo (5.5 hours SUBTRACT)
        const adjustedServerDate = new Date(
            serverDate.getTime() - 5.5 * 60 * 60 * 1000
        );

        // Current time
        const now = new Date();

        const diffInSeconds = Math.floor((now - adjustedServerDate) / 1000);

        console.log("Time difference:", diffInSeconds, "seconds");
        console.log("Original Server Date:", serverDate.toUTCString());
        console.log("Adjusted Server Date:", adjustedServerDate.toUTCString());
        console.log("Current Time:", now.toUTCString());

        if (diffInSeconds < 0) return "Just now";
        if (diffInSeconds < 10) return "Just now";
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return adjustedServerDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        console.error("Date formatting error:", e, "Input:", dateString);
        return "Just now";
    }
};

// NEW FUNCTION: Current Indian time in ISO format
export const getCurrentIndianTimeISO = () => {
    const now = new Date();
    const indianDate = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    return indianDate.toISOString();
};

// NEW FUNCTION: Convert any date to Indian time
export const convertToIndianTime = (dateString) => {
    try {
        const date = new Date(dateString);
        const indianDate = new Date(
            date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        return indianDate.toISOString();
    } catch (error) {
        console.error("Time conversion error:", error);
        return dateString;
    }
};

// NEW FUNCTION: Get current Indian timestamp
export const getCurrentIndianTimestamp = () => {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
};

// NEW FUNCTION: Format date to Indian date string
export const formatToIndianDate = (dateString) => {
    try {
        const date = new Date(dateString);
        const indianDate = new Date(
            date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        return indianDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        return "Invalid date";
    }
};
