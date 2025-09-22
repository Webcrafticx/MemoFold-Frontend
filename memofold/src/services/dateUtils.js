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
    const utcDate = new Date(dateString);
    const istDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    if (isNaN(istDate.getTime())) {
      return "Just now";
    }

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const diffInSeconds = Math.floor((now - istDate) / 1000);

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
      return istDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  } catch (e) {
    return "Just now";
  }
};