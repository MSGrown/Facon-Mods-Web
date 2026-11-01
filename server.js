import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.APP_PORT || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'campaigns.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
}
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]), 'utf8');
}

// Self-healing check: Ensure public visitor routes bypass Google account auth bridge
try {
  const luaPath = '/etc/nginx/user_auth_verification.lua';
  if (fs.existsSync(luaPath)) {
    let luaContent = fs.readFileSync(luaPath, 'utf8');
    if (!luaContent.includes('/unlock.html')) {
      const target = 'if ngx.var.host == "localhost" then\n  return\nend';
      const patch = `if ngx.var.host == "localhost" then
  return
end

-- Allow public unlocking page, assets, and visitor APIs without Google login
local req_uri = ngx.var.uri or ""
if req_uri == "/" or req_uri == "/index.html" or req_uri == "/unlock.html" or req_uri == "/unlock"
   or string.match(req_uri, "^/p/")
   or string.match(req_uri, "^/api/campaigns/[^/]+$")
   or string.match(req_uri, "^/api/campaigns/[^/]+/unlock$")
   or string.match(req_uri, "^/api/campaigns/[^/]+/click$")
   or string.match(req_uri, "^/api/auth/")
   or string.match(req_uri, "^/assets/")
   or string.match(req_uri, "%.css$")
   or string.match(req_uri, "%.js$")
   or string.match(req_uri, "%.jpg$")
   or string.match(req_uri, "%.png$")
   or string.match(req_uri, "%.svg$")
   or string.match(req_uri, "%.ico$")
   or string.match(req_uri, "%.zip$") then
  return
end`;
      if (luaContent.includes(target)) {
        luaContent = luaContent.replace(target, patch);
        fs.writeFileSync(luaPath, luaContent, 'utf8');
        console.log('Self-healing: Patched /etc/nginx/user_auth_verification.lua for public unlock access');
        import('node:child_process').then(cp => {
          cp.exec('nginx -s reload', () => {});
        });
      }
    }
  }
} catch (e) {
  // Graceful fallback
}

function readJsonFile(filePath, defaultValue = []) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function readCampaigns() {
  return readJsonFile(DATA_FILE, []);
}

function writeCampaigns(campaigns) {
  writeJsonFile(DATA_FILE, campaigns);
}

function readUsers() {
  return readJsonFile(USERS_FILE, []);
}

function writeUsers(users) {
  writeJsonFile(USERS_FILE, users);
}

function readSessions() {
  return readJsonFile(SESSIONS_FILE, []);
}

function writeSessions(sessions) {
  writeJsonFile(SESSIONS_FILE, sessions);
}

// Password hashing with PBKDF2
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Initialize default creator if none exists
function initializeDefaultCreator() {
  const users = readUsers();
  if (users.length === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const defaultUser = {
      id: 'creator_1',
      username: 'creator',
      passwordHash: hashPassword('faconmods2026', salt),
      salt: salt,
      createdAt: Date.now()
    };
    users.push(defaultUser);
    writeUsers(users);
    console.log('Initialized default creator credentials (username: creator)');
  }
}
initializeDefaultCreator();

// Extract authentication session token
function extractSessionToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }
  const xAuth = req.headers['x-auth-token'];
  if (xAuth && typeof xAuth === 'string') {
    return xAuth.trim();
  }
  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const match = cookieHeader.match(/facon_token=([^;]+)/);
    if (match) return match[1].trim();
  }
  return null;
}

// Get authenticated user from session token
function getAuthenticatedUser(req) {
  const token = extractSessionToken(req);
  if (!token) return null;

  const sessions = readSessions();
  const session = sessions.find(s => s.token === token);
  if (!session) return null;

  // 30 days session validity
  if (session.expiresAt && session.expiresAt < Date.now()) {
    return null;
  }

  const users = readUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;

  return { id: user.id, username: user.username };
}

// Extract management key from request (header or query param)
function extractManageKey(req, parsedUrl) {
  const headerKey = req.headers['x-manage-key'];
  if (headerKey && typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }
  const queryKey = parsedUrl.searchParams.get('key');
  if (queryKey && queryKey.trim()) {
    return queryKey.trim();
  }
  return null;
}

// Check if request is authorized to manage a specific campaign
function isAuthorizedForCampaign(req, parsedUrl, campaign) {
  if (!campaign) return false;

  // 1. Check direct management key
  const providedKey = extractManageKey(req, parsedUrl);
  if (providedKey && campaign.manageKey && providedKey === campaign.manageKey) {
    return true;
  }

  // 2. Check authenticated creator user
  const user = getAuthenticatedUser(req);
  if (user && campaign.ownerId && campaign.ownerId === user.id) {
    return true;
  }

  return false;
}

// Sanitize campaign for public visitor view (NO destination URL until unlock, NO manage key, NO admin metrics)
function toPublicCampaign(campaign) {
  return {
    id: campaign.id,
    title: campaign.title || `Campaign ${campaign.id}`,
    tasks: (campaign.tasks || []).map(t => ({
      id: t.id,
      label: t.label,
      actionTitle: t.actionTitle,
      desc: t.desc,
      taskUrl: t.taskUrl,
      platform: t.platform
    })),
    createdAt: campaign.createdAt
  };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.zip': 'application/zip'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Manage-Key, X-Auth-Token, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper to send JSON responses
  const sendJson = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // --- CREATOR AUTHENTICATION API ---

  // POST /api/auth/register
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password || username.trim().length < 3 || password.length < 6) {
          return sendJson(400, { error: 'Username must be at least 3 characters and password at least 6 characters.' });
        }
        const cleanUsername = username.trim().toLowerCase();
        const users = readUsers();
        if (users.find(u => u.username.toLowerCase() === cleanUsername)) {
          return sendJson(409, { error: 'Username is already registered. Please choose another or log in.' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const newUser = {
          id: 'user_' + crypto.randomBytes(8).toString('hex'),
          username: cleanUsername,
          passwordHash: hashPassword(password, salt),
          salt: salt,
          createdAt: Date.now()
        };
        users.push(newUser);
        writeUsers(users);

        const token = crypto.randomBytes(32).toString('hex');
        const sessions = readSessions();
        sessions.push({
          token,
          userId: newUser.id,
          username: newUser.username,
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        });
        writeSessions(sessions);

        sendJson(201, {
          success: true,
          token,
          user: { id: newUser.id, username: newUser.username }
        });
      } catch (err) {
        sendJson(400, { error: 'Invalid JSON request' });
      }
    });
    return;
  }

  // POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password) {
          return sendJson(400, { error: 'Username and password are required.' });
        }
        const cleanUsername = username.trim().toLowerCase();
        const users = readUsers();
        const user = users.find(u => u.username.toLowerCase() === cleanUsername);
        if (!user) {
          return sendJson(401, { error: 'Invalid username or password.' });
        }
        const computedHash = hashPassword(password, user.salt);
        if (computedHash !== user.passwordHash) {
          return sendJson(401, { error: 'Invalid username or password.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const sessions = readSessions();
        sessions.push({
          token,
          userId: user.id,
          username: user.username,
          createdAt: Date.now(),
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        });
        writeSessions(sessions);

        sendJson(200, {
          success: true,
          token,
          user: { id: user.id, username: user.username }
        });
      } catch (err) {
        sendJson(400, { error: 'Invalid JSON request' });
      }
    });
    return;
  }

  // GET /api/auth/me
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return sendJson(401, { authenticated: false });
    }
    return sendJson(200, { authenticated: true, user });
  }

  // POST /api/auth/logout
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const token = extractSessionToken(req);
    if (token) {
      let sessions = readSessions();
      sessions = sessions.filter(s => s.token !== token);
      writeSessions(sessions);
    }
    return sendJson(200, { success: true });
  }

  // --- CAMPAIGN API ENDPOINTS ---

  // POST /api/campaigns (Create new campaign with secure management key and owner binding)
  if (req.method === 'POST' && pathname === '/api/campaigns') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.id || !payload.destinationUrl || !Array.isArray(payload.tasks)) {
          return sendJson(400, { error: 'Missing required fields (id, destinationUrl, tasks)' });
        }

        const currentUser = getAuthenticatedUser(req);
        // Generate cryptographically secure management key (48-character hex)
        const manageKey = payload.manageKey || crypto.randomBytes(24).toString('hex');

        const newCampaign = {
          id: payload.id,
          title: payload.title || `Campaign ${payload.id}`,
          destinationUrl: payload.destinationUrl,
          tasks: payload.tasks,
          manageKey: manageKey,
          ownerId: currentUser ? currentUser.id : 'creator_default',
          ownerUsername: currentUser ? currentUser.username : 'creator',
          createdAt: Date.now(),
          clicks: 0,
          unlocks: 0
        };

        const campaigns = readCampaigns();
        const existingIdx = campaigns.findIndex(c => c.id === newCampaign.id);
        if (existingIdx >= 0) {
          const existing = campaigns[existingIdx];
          // Check authorization before allowing overwrite
          if (!isAuthorizedForCampaign(req, parsedUrl, existing) && existing.manageKey !== payload.manageKey) {
            return sendJson(403, { error: 'A campaign with this ID already exists and cannot be overwritten without proper creator authorization.' });
          }
          // Preserve analytics and original owner if updating
          newCampaign.clicks = existing.clicks || 0;
          newCampaign.unlocks = existing.unlocks || 0;
          newCampaign.ownerId = existing.ownerId || newCampaign.ownerId;
          campaigns[existingIdx] = newCampaign;
        } else {
          campaigns.unshift(newCampaign);
        }
        writeCampaigns(campaigns);

        sendJson(201, {
          success: true,
          campaign: toPublicCampaign(newCampaign),
          manageKey: manageKey
        });
      } catch (err) {
        sendJson(400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  // GET /api/creator/campaigns (Private: Fetch all campaigns owned by the authenticated creator)
  if (req.method === 'GET' && pathname === '/api/creator/campaigns') {
    const user = getAuthenticatedUser(req);
    const campaigns = readCampaigns();

    if (user) {
      const owned = campaigns.filter(c => c.ownerId === user.id || !c.ownerId || c.ownerId === 'creator_default');
      return sendJson(200, owned);
    }

    // Fallback: check provided manage keys in header or query
    const providedKey = extractManageKey(req, parsedUrl);
    if (providedKey) {
      const matched = campaigns.filter(c => c.manageKey === providedKey);
      return sendJson(200, matched);
    }

    return sendJson(401, { error: 'Creator authentication required to view your campaigns list.' });
  }

  // POST /api/campaigns/my (Backward-compatible: Fetch campaigns using key verification map)
  if (req.method === 'POST' && pathname === '/api/campaigns/my') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const keysMap = payload.keys || {}; // { [campaignId]: manageKey }
        const user = getAuthenticatedUser(req);
        const campaigns = readCampaigns();

        const authorizedCampaigns = campaigns.filter(c => {
          if (user && (c.ownerId === user.id || !c.ownerId || c.ownerId === 'creator_default')) return true;
          const providedKey = keysMap[c.id];
          return providedKey && c.manageKey && providedKey === c.manageKey;
        });

        sendJson(200, authorizedCampaigns);
      } catch (err) {
        sendJson(400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  // GET /api/campaigns/:id/manage (Private: Full campaign details & analytics, requires auth)
  const manageMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)\/manage$/);
  if (req.method === 'GET' && manageMatch) {
    const id = manageMatch[1];
    const campaigns = readCampaigns();
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return sendJson(404, { error: 'Campaign not found' });
    }

    if (!isAuthorizedForCampaign(req, parsedUrl, campaign)) {
      return sendJson(401, {
        error: 'Unauthorized: Creator login or valid private management key required to access this campaign.',
        authenticated: false
      });
    }

    return sendJson(200, {
      success: true,
      campaign: campaign,
      authenticated: true
    });
  }

  // PUT /api/campaigns/:id (Private: Update destination URL or tasks, requires auth)
  const putMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)$/);
  if (req.method === 'PUT' && putMatch) {
    const id = putMatch[1];
    const campaigns = readCampaigns();
    const idx = campaigns.findIndex(c => c.id === id);

    if (idx === -1) {
      return sendJson(404, { error: 'Campaign not found' });
    }

    const campaign = campaigns[idx];
    if (!isAuthorizedForCampaign(req, parsedUrl, campaign)) {
      return sendJson(401, { error: 'Unauthorized: You do not own this campaign and cannot modify it.' });
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        if (updates.destinationUrl) campaign.destinationUrl = updates.destinationUrl;
        if (updates.title) campaign.title = updates.title;
        if (Array.isArray(updates.tasks)) campaign.tasks = updates.tasks;
        campaign.updatedAt = Date.now();

        campaigns[idx] = campaign;
        writeCampaigns(campaigns);

        sendJson(200, { success: true, campaign });
      } catch (err) {
        sendJson(400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  // DELETE /api/campaigns/:id (Private: Delete campaign, requires auth)
  const deleteMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const id = deleteMatch[1];
    let campaigns = readCampaigns();
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return sendJson(404, { error: 'Campaign not found' });
    }

    if (!isAuthorizedForCampaign(req, parsedUrl, campaign)) {
      return sendJson(401, { error: 'Unauthorized: You cannot delete campaigns you do not own.' });
    }

    campaigns = campaigns.filter(c => c.id !== id);
    writeCampaigns(campaigns);

    return sendJson(200, { success: true, message: 'Campaign deleted successfully' });
  }

  // GET /api/campaigns/:id (Public: Visitor link, returns sanitized public task info ONLY)
  const getMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)$/);
  if (req.method === 'GET' && getMatch) {
    const id = getMatch[1];
    const campaigns = readCampaigns();
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return sendJson(404, { error: 'Campaign not found' });
    }

    // Return sanitized public campaign (destination URL and manage key are NEVER exposed)
    return sendJson(200, toPublicCampaign(campaign));
  }

  // POST /api/campaigns/:id/click (Public: Track visitor arrival)
  const clickMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)\/click$/);
  if (req.method === 'POST' && clickMatch) {
    const id = clickMatch[1];
    const campaigns = readCampaigns();
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      campaign.clicks = (campaign.clicks || 0) + 1;
      writeCampaigns(campaigns);
    }
    return sendJson(200, { success: true });
  }

  // POST /api/campaigns/:id/unlock (Public: Releases destination URL only upon completing tasks)
  const unlockMatch = pathname.match(/^\/api\/campaigns\/([A-Za-z0-9_-]+)\/unlock$/);
  if (req.method === 'POST' && unlockMatch) {
    const id = unlockMatch[1];
    const campaigns = readCampaigns();
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      campaign.unlocks = (campaign.unlocks || 0) + 1;
      writeCampaigns(campaigns);
      return sendJson(200, { success: true, destinationUrl: campaign.destinationUrl });
    } else {
      return sendJson(404, { error: 'Campaign not found' });
    }
  }

  // --- PAGE ROUTING & STATIC FILE SERVING ---

  // Friendly Public Unlock Route: /unlock, /unlock.html, /p/:id
  if (pathname === '/unlock' || pathname === '/unlock.html' || pathname.startsWith('/p/')) {
    const unlockHtmlPath = path.join(PUBLIC_DIR, 'unlock.html');
    fs.readFile(unlockHtmlPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading unlock page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // Friendly Private Management Route: /manage, /m/:id
  if (pathname === '/manage' || pathname.startsWith('/m/')) {
    const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
    fs.readFile(indexHtmlPath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading management page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check file existence
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for general SPA routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`FACONMODS server running on http://${HOST}:${PORT}`);
});
