function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

function notFound() {
  return json({
    success: false,
    error: "Route not found"
  }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json({ success: true });
    }

    if (url.pathname === "/") {
      return json({
        success: true,
        service: "TMOS Enterprise API",
        version: "v2",
        status: "online"
      });
    }

    if (url.pathname === "/health") {
      return json({
        success: true,
        status: "healthy",
        runtime: "Cloudflare Worker",
        database: "not-connected-yet"
      });
    }

    return notFound();
  }
};
