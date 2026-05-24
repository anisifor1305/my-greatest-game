const GAME_PAGE_PATH = "game/index.html";
const EXTENSION_ROOT_URL = browser.runtime.getURL("");
const REDIRECT_COOLDOWN_MS = 1500;
const recentlyRedirectedTabs = new Map();
const OFFLINE_ERROR_PATTERNS = [
  "NS_ERROR_NET_",
  "NS_ERROR_UNKNOWN_HOST",
  "NS_ERROR_CONNECTION_REFUSED",
  "NS_ERROR_CONNECTION_TIMEOUT",
  "NS_ERROR_OFFLINE",
  "ERR_INTERNET_DISCONNECTED",
  "ERR_NAME_NOT_RESOLVED",
  "ERR_CONNECTION_REFUSED",
  "ERR_CONNECTION_TIMED_OUT"
];

const isSupportedPageUrl = (url) => {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const isOfflineNavigation = (details) => {
  if (details.tabId < 0 || details.type !== "main_frame") {
    return false;
  }

  if (details.url.startsWith(EXTENSION_ROOT_URL) || !isSupportedPageUrl(details.url)) {
    return false;
  }

  const lastRedirectAt = recentlyRedirectedTabs.get(details.tabId) || 0;
  if (Date.now() - lastRedirectAt < REDIRECT_COOLDOWN_MS) {
    return false;
  }

  const error = details.error || "";
  return OFFLINE_ERROR_PATTERNS.some((pattern) => error.includes(pattern));
};

const buildGameUrl = (details) => {
  const gameUrl = new URL(browser.runtime.getURL(GAME_PAGE_PATH));
  gameUrl.searchParams.set("from", details.url);
  gameUrl.searchParams.set("error", details.error || "NETWORK_ERROR");
  return gameUrl.toString();
};

const markTabRedirected = (tabId) => {
  recentlyRedirectedTabs.set(tabId, Date.now());
  setTimeout(() => {
    recentlyRedirectedTabs.delete(tabId);
  }, REDIRECT_COOLDOWN_MS);
};

browser.webRequest.onErrorOccurred.addListener(
  (details) => {
    if (!isOfflineNavigation(details)) {
      return;
    }

    markTabRedirected(details.tabId);

    browser.tabs.update(details.tabId, {
      url: buildGameUrl(details)
    }).catch(() => {});
  },
  {
    urls: [
      "http://*/*",
      "https://*/*"
    ],
    types: [
      "main_frame"
    ]
  }
);

browser.tabs.onRemoved.addListener((tabId) => {
  recentlyRedirectedTabs.delete(tabId);
});
