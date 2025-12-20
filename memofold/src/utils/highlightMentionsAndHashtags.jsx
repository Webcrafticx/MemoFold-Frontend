// Utility to highlight @mentions and #hashtags in text
// Usage: highlightMentionsAndHashtags(text)
import React from "react";

export function highlightMentionsAndHashtags(text) {
    if (!text) return "";
    const regex = /([@#][\w\d_]+)/g;
    const parts = text.split(regex);
    return parts.map((part, idx) => {
        if (regex.test(part)) {
            return (
                <span key={idx} className="text-blue-500">
                    {part}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
}
