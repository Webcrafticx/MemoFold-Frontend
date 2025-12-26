import React from "react";
// Utility to highlight @mentions and #hashtags, preserve HTML and line breaks
// Usage: highlightMentionsAndHashtags(text)
export function highlightMentionsAndHashtags(text) {
    if (!text) return null;
    const regex = /([@#][\w\d_]+)/g;
    // Split by newline first, then by mention/hashtag
    const lines = text.split(/\r?\n/);
    let idx = 0;
    return lines.map((line, lineIdx) => {
        const parts = line.split(regex);
        const mapped = parts.map((part) => {
            if (regex.test(part)) {
                return (
                    <span key={idx++} className="text-blue-500">
                        {part}
                    </span>
                );
            }
            return <React.Fragment key={idx++}>{part}</React.Fragment>;
        });
        // Add <br /> after every line except the last
        if (lineIdx < lines.length - 1) {
            mapped.push(<br key={"br-" + lineIdx} />);
        }
        return mapped;
    });
}
