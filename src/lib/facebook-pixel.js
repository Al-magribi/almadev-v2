export const initFacebookPixel = (pixelId) => {
  if (typeof window === "undefined") return;
  const trimmedId = String(pixelId || "").trim();
  if (!trimmedId) return;

  if (window.fbq) {
    window.fbq("init", trimmedId);
    return;
  }

  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq("init", trimmedId);
  window.fbq("track", "PageView");
};

export const trackFacebookEvent = (eventName, payload = {}) => {
  if (typeof window === "undefined") return;
  if (!window.fbq || !eventName) return;
  window.fbq("track", eventName, payload);
};
