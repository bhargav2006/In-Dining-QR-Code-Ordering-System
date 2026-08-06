/**
 * Utility to get the dynamic frontend base URL.
 * Prefers VITE_FRONTEND_URL from .env if defined, otherwise automatically falls back to window.location.origin.
 */
export const getFrontendUrl = () => {
  const envUrl = import.meta.env.VITE_FRONTEND_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return window.location.origin;
};
