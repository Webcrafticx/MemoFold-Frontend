import React from "react";
import { Link } from "react-router-dom";

/**
 * Render post/comment text with clickable @mentions and styled #hashtags.
 * Prefer `mentions` snapshots ({ userId, username }) for profile links.
 */
export function MentionText({ text, mentions = [] }) {
  if (!text) return null;

  const byUsername = new Map();
  for (const m of mentions || []) {
    if (!m?.username) continue;
    byUsername.set(String(m.username).toLowerCase(), m);
  }

  const regex = /([@#][\w\d_]+)/g;
  const lines = String(text).split(/\r?\n/);
  let idx = 0;

  return lines.map((line, lineIdx) => {
    const parts = line.split(regex);
    const mapped = parts.map((part) => {
      if (/^@[\w\d_]+$/.test(part)) {
        const handle = part.slice(1).toLowerCase();
        const m = byUsername.get(handle);
        const userId = m?.userId?._id || m?.userId;
        if (userId) {
          return (
            <Link
              key={idx++}
              to={`/user/${userId}`}
              className="text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return (
          <span key={idx++} className="text-blue-500">
            {part}
          </span>
        );
      }
      if (/^#[\w\d_]+$/.test(part)) {
        return (
          <span key={idx++} className="text-blue-500">
            {part}
          </span>
        );
      }
      return <React.Fragment key={idx++}>{part}</React.Fragment>;
    });

    if (lineIdx < lines.length - 1) {
      mapped.push(<br key={"br-" + lineIdx} />);
    }
    return mapped;
  });
}

/** @deprecated Use MentionText — kept for bio/hashtag-only call sites */
export function highlightMentionsAndHashtags(text, mentions) {
  return <MentionText text={text} mentions={mentions} />;
}
