const GAME_PAGE_PATH = "game/index.html";
const EXTENSION_ROOT_URL = browser.runtime.getURL("");
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

const isOfflineNavigation = (details) => {
  if (details.tabId < 0 || details.type !== "main_frame") {
    return false;
  }

  if (details.url.startsWith(EXTENSION_ROOT_URL)) {
    return false;
  }

  const error = details.error || "";
  return OFFLINE_ERROR_PATTERNS.some((pattern) => error.includes(pattern));
};

const buildGameUrl = (details) => {
  const gameUrl = new URL(browser.runtime.getURL(GAME_PAGE_PATH));
  gameUrl.searchParams.set("from", details.url);
  gameUrl.searchParams.set("error", details.error);
  return gameUrl.toString();
};

browser.webRequest.onErrorOccurred.addListener(
  (details) => {
    if (!isOfflineNavigation(details)) {
      return;
    }

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
