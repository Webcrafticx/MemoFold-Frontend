import config from "../hooks/config";

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const USERNAME_DEBOUNCE_MS = 700;

/**
 * Local format check only — no network.
 * @returns {{ ok: true, value: string } | { ok: false, message: string, available: boolean|null }}
 */
export function validateUsernameLocal(username) {
    const value = (username || "").trim().toLowerCase();

    if (!value) {
        return { ok: false, available: null, message: "", value: "" };
    }
    if (value.length < 3) {
        return {
            ok: false,
            available: false,
            message: "Username must be at least 3 characters",
            value,
        };
    }
    if (!USERNAME_REGEX.test(value)) {
        return {
            ok: false,
            available: false,
            message: "Username can only contain letters, numbers, and underscores",
            value,
        };
    }
    return { ok: true, value, available: null, message: "" };
}

/**
 * Fetch username availability. Pass AbortSignal to cancel stale requests.
 * @param {string} username
 * @param {{ token?: string|null, signal?: AbortSignal }} options
 */
export async function fetchUsernameAvailability(username, options = {}) {
    const { token = null, signal } = options;
    const value = username.trim().toLowerCase();

    const url = token
        ? `${config.apiUrl}/user/check-username?username=${encodeURIComponent(value)}`
        : `${config.apiUrl}/auth/check-username?username=${encodeURIComponent(value)}`;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { headers, signal });
    const data = await res.json();

    return {
        available: !!data.available,
        message:
            data.message ||
            (data.available ? "Username is available" : "Username is already taken"),
    };
}
