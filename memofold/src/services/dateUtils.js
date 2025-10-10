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

export const formatDate = (dateString) => {
    try {
        if (!dateString) return "Just now";

        const serverDate = new Date(dateString);

        // Check if date is valid
        if (isNaN(serverDate.getTime())) {
            return "Just now";
        }

        // Dono dates ko Indian time mein convert karen
        const serverIndianTime = new Date(
            serverDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        const nowIndianTime = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );

        const diffInSeconds = Math.floor(
            (nowIndianTime - serverIndianTime) / 1000
        );

        if (diffInSeconds < 0) {
            return "Just now";
        }

        if (diffInSeconds < 10) {
            return "Just now";
        }
        if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else {
            return serverIndianTime.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        }
    } catch (e) {
        console.error("Date formatting error:", e);
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
