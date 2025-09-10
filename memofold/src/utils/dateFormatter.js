export const formatDate = (dateString) => {
  try {
    const utcDate = new Date(dateString);
    const istDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    if (isNaN(istDate.getTime())) return "Just now";

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const diffInSeconds = Math.floor((now - istDate) / 1000);
    if (diffInSeconds < 0) return "Just now";
    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return istDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "Just now";
  }
};