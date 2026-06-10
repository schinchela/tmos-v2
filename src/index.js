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

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function cleanSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
}

async function generateUniqueDatabaseName(db, baseSlug) {
  const base = `tmos-${baseSlug}`;
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await db
      .prepare("SELECT id FROM clubs WHERE database_name = ?")
      .bind(candidate)
      .first();

    if (!existing) return candidate;

    candidate = `${base}${counter}`;
    counter++;
  }
}

async function createClub(request, env) {
  const body = await request.json();

  const name = String(body.clubName || "").trim();
  const slug = cleanSlug(body.clubCode || body.clubName);

  if (!name) {
    return json({ success: false, error: "Club name is required" }, 400);
  }

  if (!slug) {
    return json({ success: false, error: "Club short code is required" }, 400);
  }

  const existingSlug = await env.DB
    .prepare("SELECT id FROM clubs WHERE slug = ?")
    .bind(slug)
    .first();

  if (existingSlug) {
    return json({ success: false, error: "Club short code already exists" }, 409);
  }

  const clubId = id("club");
  const databaseId = id("clubdb");
  const auditId = id("audit");
  const createdAt = now();
  const createdBy = "superadmin-dev";
  const databaseName = await generateUniqueDatabaseName(env.DB, slug);

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO clubs (
        id, name, slug, database_name, status, city, country, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      clubId,
      name,
      slug,
      databaseName,
      "ACTIVE",
      body.city || null,
      body.country || null,
      createdAt,
      createdBy
    ),

    env.DB.prepare(`
      INSERT INTO club_databases (
        id, club_id, database_name, database_identifier, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      databaseId,
      clubId,
      databaseName,
      null,
      "REGISTERED",
      createdAt
    ),

    env.DB.prepare(`
      INSERT INTO audit_logs (
        id, user_id, action, entity_type, entity_id, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      auditId,
      createdBy,
      "CREATE_CLUB",
      "club",
      clubId,
      JSON.stringify({ name, slug, databaseName }),
      createdAt
    )
  ]);

  return json({
    success: true,
    data: {
      id: clubId,
      name,
      slug,
      databaseName,
      status: "ACTIVE",
      city: body.city || null,
      country: body.country || null,
      createdAt
    }
  }, 201);
}

async function listClubs(env) {
  const result = await env.DB
    .prepare(`
      SELECT id, name, slug, database_name, status, city, country, created_at
      FROM clubs
      ORDER BY created_at DESC
    `)
    .all();

  return json({
    success: true,
    data: result.results || []
  });
}

export default {
  async fetch(request, env) {
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
        database: "connected"
      });
    }

    if (url.pathname === "/api/platform/clubs" && request.method === "GET") {
      return listClubs(env);
    }

    if (url.pathname === "/api/platform/clubs" && request.method === "POST") {
      return createClub(request, env);
    }

    return json({
      success: false,
      error: "Route not found"
    }, 404);
  }
};
