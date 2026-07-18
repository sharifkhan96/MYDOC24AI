// Access token lives in memory only (cleared on full page reload); refresh
// token persists in localStorage so a reload can silently re-authenticate.
// Documented tradeoff: an httpOnly cookie + CSRF token is the production
// hardening step here, deferred for this first build.
const REFRESH_KEY = "mydoc24_refresh_token";

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setRefreshToken: (token: string | null) => {
    if (token) {
      localStorage.setItem(REFRESH_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  },
  clear: () => {
    accessToken = null;
    localStorage.removeItem(REFRESH_KEY);
  },
};
