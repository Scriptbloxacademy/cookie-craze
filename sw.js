// Service Worker - intercepts all Base44 API calls and returns mock responses
const BASE44 = "base44.app";
const GAME_ORIGIN = self.location.origin;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Block all base44.app requests
  if (url.hostname.includes("base44") || url.hostname.includes("base44.app")) {
    // Auth check - return valid user
    if (url.pathname.includes("/auth/me")) {
      return e.respondWith(
        Response.json({ id: "local_user", email: "player@game.com", role: "user" })
      );
    }
    // Entity create - return fake entity
    if (url.pathname.includes("/entities/Garden")) {
      if (e.request.method === "POST") {
        return e.respondWith(
          Response.json({
            id: "local_" + Date.now(),
            player_name: "Gardener",
            fruits: 0,
            total_fruits: 0,
            fps: 0
          })
        );
      }
      if (e.request.method === "GET" || e.request.method === "LIST") {
        return e.respondWith(Response.json([]));
      }
      // Updates (PATCH/PUT) - just acknowledge
      if (e.request.method === "PATCH" || e.request.method === "PUT") {
        return e.respondWith(Response.json({ ok: true }));
      }
    }
    // Entity subscribe (WebSocket or EventSource) - block
    if (e.request.method === "SUBSCRIBE" || url.pathname.includes("subscribe")) {
      return e.respondWith(new Response("", { status: 200 }));
    }
    // Logging/tracking endpoints
    if (url.pathname.includes("/api/app-logs")) {
      return e.respondWith(new Response("", { status: 200 }));
    }
    // Any other base44 request
    return e.respondWith(Response.json({ ok: true }));
  }

  // Block badge.js (Base44 badge)
  if (url.pathname.includes("badge.js")) {
    return e.respondWith(new Response("", { status: 200 }));
  }

  // Everything else passes through
  return;
});
