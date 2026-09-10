import React, { useEffect, useRef, useState } from "react";
import { apiService } from "../../services/api";

const DEBOUNCE_MS = 300;

/**
 * Textarea/input with @mention autocomplete (friends-first via mention-suggest).
 */
export default function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder = "",
  className = "",
  rows = 3,
  disabled = false,
  maxLength,
  inputRef: externalRef,
  singleLine = false,
  onKeyPress,
}) {
  const internalRef = useRef(null);
  const fieldRef = externalRef || internalRef;
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const selectedMentionsRef = useRef(new Map());

  const emitMentions = (map) => {
    if (!onMentionsChange) return;
    onMentionsChange(
      [...map.values()].map((u) => ({
        userId: u.id,
        username: u.username,
      }))
    );
  };

  const getActiveMention = (text, caret) => {
    const before = text.slice(0, caret);
    const match = before.match(/(^|[\s([{])@([a-zA-Z0-9_]*)$/);
    if (!match) return null;
    return {
      start: before.length - match[2].length - 1,
      query: match[2],
    };
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const fetchSuggestions = (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const token = localStorage.getItem("token");
        const data = await apiService.mentionSuggest(
          token,
          q,
          8,
          controller.signal
        );
        if (controller.signal.aborted) return;
        setSuggestions(Array.isArray(data?.users) ? data.users : []);
        setActiveIndex(0);
        setOpen(true);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
  };

  const handleChange = (e) => {
    const next = e.target.value;
    const caret = e.target.selectionStart ?? next.length;
    onChange(next);

    const active = getActiveMention(next, caret);
    setMentionQuery(active);
    if (active) {
      fetchSuggestions(active.query);
    } else {
      setOpen(false);
      setSuggestions([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  };

  const insertMention = (user) => {
    const el = fieldRef.current;
    const text = value || "";
    const caret = el?.selectionStart ?? text.length;
    const active = getActiveMention(text, caret) || mentionQuery;
    if (!active) return;

    const before = text.slice(0, active.start);
    const after = text.slice(caret);
    const insertion = `@${user.username} `;
    const next = before + insertion + after;
    onChange(next);

    selectedMentionsRef.current.set(user.id, user);
    emitMentions(selectedMentionsRef.current);

    setOpen(false);
    setSuggestions([]);
    setMentionQuery(null);

    requestAnimationFrame(() => {
      if (!el) return;
      const pos = before.length + insertion.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (onKeyPress) onKeyPress(e);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const sharedProps = {
    ref: fieldRef,
    value,
    onChange: handleChange,
    onKeyDown,
    placeholder,
    className,
    disabled,
    maxLength,
  };

  return (
    <div className="relative w-full flex-1">
      {singleLine ? (
        <input type="text" {...sharedProps} />
      ) : (
        <textarea {...sharedProps} rows={rows} />
      )}
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 left-0 right-0 bottom-full mb-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg"
          role="listbox"
        >
          {suggestions.map((user, i) => (
            <li
              key={user.id}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                i === activeIndex
                  ? "bg-blue-50 dark:bg-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(user);
              }}
            >
              <img
                src={user.profilePic || "/default-avatar.png"}
                alt=""
                className="w-8 h-8 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </div>
                {user.realname ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.realname}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
