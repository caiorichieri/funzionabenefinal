// Cookie consent storage helper
const COOKIE_KEY = "fb_cookie_consent";
const COOKIE_VERSION = "1";

export function getCookiePreferences() {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== COOKIE_VERSION) return null;
    return data.prefs;
  } catch (err) {
    console.warn("[cookieConsent] read failed:", err);
    return null;
  }
}

export function hasGivenConsent() {
  return getCookiePreferences() !== null;
}

export function setCookiePreferences(prefs) {
  const payload = {
    version: COOKIE_VERSION,
    prefs: { essential: true, analytics: !!prefs.analytics, marketing: !!prefs.marketing },
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event("fb-cookie-consent-changed"));
  } catch (err) {
    console.warn("[cookieConsent] write failed:", err);
  }
}

export function acceptAll() {
  setCookiePreferences({ analytics: true, marketing: true });
}

export function acceptEssentialOnly() {
  setCookiePreferences({ analytics: false, marketing: false });
}

export function clearCookieConsent() {
  try {
    localStorage.removeItem(COOKIE_KEY);
    window.dispatchEvent(new Event("fb-cookie-consent-changed"));
  } catch (err) {
    console.warn("[cookieConsent] clear failed:", err);
  }
}
