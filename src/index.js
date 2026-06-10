const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

const SESSION_DAYS = 7;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function now() {
  return new Date().toISOString();
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function cleanSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function passwordHash(password, salt) {
  return sha256(`${salt}:${password}`);
}

async function writeAudit(env, {
  userId = "system",
  action,
  entityType,
  entityId = null,
  details = {}
}) {
  await env.DB.prepare(`
    INSERT INTO audit_logs (
      id, user_id, action, entity_type, entity_id, details, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id("audit"),
    userId,
    action,
    entityType,
    entityId,
    JSON.stringify(details),
    now()
  ).run();
}

function getBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

async function createSession(env, userId) {
  const rawToken = crypto.randomUUID() + "." + crypto.randomUUID();
  const tokenHash = await sha256(rawToken);

  await env.DB.prepare(`
    INSERT INTO user_sessions (
      id, user_id, token_hash, expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `).bind(
    id("session"),
    userId,
    tokenHash,
    addDays(SESSION_DAYS),
    now()
  ).run();

  return rawToken;
}

async function getCurrentUser(request, env) {
  const token = getBearerToken(request);
  if (!token) return null;

  const tokenHash = await sha256(token);

  const session = await env.DB.prepare(`
    SELECT user_id, expires_at
    FROM user_sessions
    WHERE token_hash = ?
  `).bind(tokenHash).first();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  return env.DB.prepare(`
    SELECT id, email, first_name, last_name, role, club_id, status, created_at
    FROM users
    WHERE id = ? AND status = 'ACTIVE'
  `).bind(session.user_id).first();
}

async function requireSuperAdmin(request, env) {
  const user = await getCurrentUser(request, env);

  if (!user) {
    return {
      ok: false,
      response: json({ success: false, error: "Unauthorized" }, 401)
    };
  }

  if (user.role !== "SUPER_ADMIN") {
    return {
      ok: false,
      response: json({ success: false, error: "Forbidden" }, 403)
    };
  }

  return { ok: true, user };
}

async function setupPassword(request, env) {
  const body = await request.json();

  if (!env.SETUP_SECRET || body.setupSecret !== env.SETUP_SECRET) {
    return json({ success: false, error: "Invalid setup secret" }, 403);
  }

  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return json({ success: false, error: "Email and password are required" }, 400);
  }

  const user = await env.DB.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  if (!user) {
    return json({ success: false, error: "User not found" }, 404);
  }

  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);

  await env.DB.prepare(`
    UPDATE users
    SET password_hash = ?
    WHERE email = ?
  `).bind(`${salt}:${hash}`, email).run();

  await writeAudit(env, {
    userId: user.id,
    action: "SET_PASSWORD",
    entityType: "user",
    entityId: user.id,
    details: { email }
  });

  return json({
    success: true,
    data: { email, message: "Password set successfully" }
  });
}

async function login(request, env) {
  const body = await request.json();

  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  const user = await env.DB.prepare(`
    SELECT id, email, password_hash, first_name, last_name, role, club_id, status
    FROM users
    WHERE email = ? AND status = 'ACTIVE'
  `).bind(email).first();

  if (!user || !user.password_hash || user.password_hash === "TEMP_RESET_REQUIRED") {
    return json({ success: false, error: "Invalid email or password" }, 401);
  }

  const [salt, savedHash] = user.password_hash.split(":");
  const attemptedHash = await passwordHash(password, salt);

  if (attemptedHash !== savedHash) {
    return json({ success: false, error: "Invalid email or password" }, 401);
  }

  const token = await createSession(env, user.id);

  await env.DB.prepare(`
    UPDATE users
    SET last_login_at = ?
    WHERE id = ?
  `).bind(now(), user.id).run();

  await writeAudit(env, {
    userId: user.id,
    action: "LOGIN",
    entityType: "user",
    entityId: user.id,
    details: { email }
  });

  return json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        clubId: user.club_id
      }
    }
  });
}

async function logout(request, env) {
  const token = getBearerToken(request);
  if (!token) return json({ success: true });

  const tokenHash = await sha256(token);

  await env.DB.prepare(`
    DELETE FROM user_sessions
    WHERE token_hash = ?
  `).bind(tokenHash).run();

  return json({ success: true });
}

async function me(request, env) {
  const user = await getCurrentUser(request, env);

  if (!user) {
    return json({ success: false, error: "Unauthorized" }, 401);
  }

  return json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      clubId: user.club_id
    }
  });
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
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const name = String(body.clubName || "").trim();
  const slug = cleanSlug(body.clubCode || body.clubName);

  if (!name) return json({ success: false, error: "Club name is required" }, 400);
  if (!slug) return json({ success: false, error: "Club short code is required" }, 400);

  const existingSlug = await env.DB.prepare(`
    SELECT id FROM clubs WHERE slug = ?
  `).bind(slug).first();

  if (existingSlug) {
    return json({ success: false, error: "Club short code already exists" }, 409);
  }

  const clubId = id("club");
  const clubDbId = id("clubdb");
  const databaseName = await generateUniqueDatabaseName(env.DB, slug);
  const createdAt = now();

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
      auth.user.id
    ),

    env.DB.prepare(`
      INSERT INTO club_databases (
        id, club_id, database_name, database_identifier, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      clubDbId,
      clubId,
      databaseName,
      null,
      "REGISTERED",
      createdAt
    )
  ]);

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_CLUB",
    entityType: "club",
    entityId: clubId,
    details: { name, slug, databaseName }
  });

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
  const result = await env.DB.prepare(`
    SELECT id, name, slug, database_name, status, city, country, created_at
    FROM clubs
    ORDER BY created_at DESC
  `).all();

  return json({ success: true, data: result.results || [] });
}

async function getPlatformStats(env) {
  const totalClubs = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM clubs
  `).first();

  const activeClubs = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM clubs WHERE status = 'ACTIVE'
  `).first();

  const users = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM users
  `).first();

  const auditEvents = await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM audit_logs
  `).first();

  const latestClubs = await env.DB.prepare(`
    SELECT id, name, slug, database_name, status, city, country, created_at
    FROM clubs
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  return json({
    success: true,
    data: {
      totalClubs: totalClubs?.count || 0,
      activeClubs: activeClubs?.count || 0,
      users: users?.count || 0,
      auditEvents: auditEvents?.count || 0,
      latestClubs: latestClubs.results || []
    }
  });
}

async function listAuditLogs(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 25), 1), 100);

  const result = await env.DB.prepare(`
    SELECT id, user_id, action, entity_type, entity_id, details, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(limit).all();

  return json({ success: true, data: result.results || [] });
}

async function listRoles() {
  return json({
    success: true,
    data: [
      { code: "SUPER_ADMIN", name: "Super Administrator", scope: "PLATFORM" },
      { code: "PLATFORM_ADMIN", name: "Platform Administrator", scope: "PLATFORM" },
      { code: "SUPPORT_ADMIN", name: "Support Administrator", scope: "PLATFORM" },
      { code: "CLUB_ADMIN", name: "Club Administrator", scope: "CLUB" },
      { code: "PRESIDENT", name: "President", scope: "CLUB" },
      { code: "VPE", name: "Vice President Education", scope: "CLUB" },
      { code: "VPM", name: "Vice President Membership", scope: "CLUB" },
      { code: "SECRETARY", name: "Secretary", scope: "CLUB" },
      { code: "TREASURER", name: "Treasurer", scope: "CLUB" },
      { code: "MEMBER", name: "Member", scope: "CLUB" }
    ]
  });
}

async function listUsers(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const result = await env.DB.prepare(`
    SELECT
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.phone,
      u.role,
      u.club_id,
      c.name AS club_name,
      u.status,
      u.last_login_at,
      u.invited_at,
      u.created_at
    FROM users u
    LEFT JOIN clubs c ON c.id = u.club_id
    ORDER BY u.created_at DESC
  `).all();

  return json({
    success: true,
    data: result.results || []
  });
}

async function createUser(request, env) {
  const auth = await requireSuperAdmin(request, env);
  if (!auth.ok) return auth.response;

  const body = await request.json();

  const email = String(body.email || "").toLowerCase().trim();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = String(body.phone || "").trim();
  const role = String(body.role || "").trim();
  const clubId = body.clubId || null;
  const password = String(body.password || "TempPass12345");

  if (!email) return json({ success: false, error: "Email is required" }, 400);
  if (!role) return json({ success: false, error: "Role is required" }, 400);

  const existing = await env.DB.prepare(`
    SELECT id FROM users WHERE email = ?
  `).bind(email).first();

  if (existing) {
    return json({ success: false, error: "User already exists" }, 409);
  }

  const userId = id("user");
  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);
  const createdAt = now();

  await env.DB.prepare(`
    INSERT INTO users (
      id,
      email,
      password_hash,
      first_name,
      last_name,
      role,
      club_id,
      status,
      created_at,
      phone,
      invited_at,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    userId,
    email,
    `${salt}:${hash}`,
    firstName || null,
    lastName || null,
    role,
    clubId,
    "ACTIVE",
    createdAt,
    phone || null,
    createdAt,
    auth.user.id
  ).run();

  await writeAudit(env, {
    userId: auth.user.id,
    action: "CREATE_USER",
    entityType: "user",
    entityId: userId,
    details: { email, role, clubId }
  });

  return json({
    success: true,
    data: {
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      role,
      clubId,
      status: "ACTIVE",
      temporaryPassword: password,
      createdAt
    }
  }, 201);
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
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
      database: env.DB ? "connected" : "missing",
      auth: "enabled"
    });
  }

  if (url.pathname === "/api/setup/password" && request.method === "POST") {
    return setupPassword(request, env);
  }

  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    return login(request, env);
  }

  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    return logout(request, env);
  }

  if (url.pathname === "/api/auth/me" && request.method === "GET") {
    return me(request, env);
  }

  if (url.pathname === "/api/platform/stats" && request.method === "GET") {
    return getPlatformStats(env);
  }

  if (url.pathname === "/api/platform/clubs" && request.method === "GET") {
    return listClubs(env);
  }

  if (url.pathname === "/api/platform/clubs" && request.method === "POST") {
    return createClub(request, env);
  }

  if (url.pathname === "/api/platform/audit" && request.method === "GET") {
    return listAuditLogs(request, env);
  }

  if (url.pathname === "/api/platform/roles" && request.method === "GET") {
    return listRoles();
  }

  if (url.pathname === "/api/platform/users" && request.method === "GET") {
    return listUsers(request, env);
  }

  if (url.pathname === "/api/platform/users" && request.method === "POST") {
    return createUser(request, env);
  }

  return json({ success: false, error: "Route not found" }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      try {
        await writeAudit(env, {
          action: "API_ERROR",
          entityType: "system",
          details: { message: error.message || "Internal server error" }
        });
      } catch (_) {}

      return json({
        success: false,
        error: error.message || "Internal server error"
      }, 500);
    }
  }
};
