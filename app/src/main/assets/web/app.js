/**
 * FACONMODS Link Generator & Content Locker
 * Client Application Logic
 */

// 11 Exact Selectable Tasks
const TASK_DEFINITIONS = [
  {
    id: 'subscribe',
    label: '+ Subscribe',
    actionTitle: 'Subscribe to Channel',
    desc: 'Subscribe to our YouTube channel to support content.',
    inputLabel: 'YouTube Channel URL to Subscribe',
    placeholder: 'https://www.youtube.com/@faconmods',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'subscribe_2',
    label: '+ Subscribe 2',
    actionTitle: 'Subscribe to 2nd Channel',
    desc: 'Subscribe to our backup secondary YouTube channel.',
    inputLabel: '2nd YouTube Channel URL',
    placeholder: 'https://www.youtube.com/@faconmods2',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'like_subscribe',
    label: '+ Like & Subscribe',
    actionTitle: 'Like Video & Subscribe',
    desc: 'Like the video and subscribe to the YouTube channel.',
    inputLabel: 'YouTube Video URL (Like & Subscribe)',
    placeholder: 'https://www.youtube.com/watch?v=example',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'sub_bell',
    label: '+ Subscribe & Hit Bell',
    actionTitle: 'Subscribe & Turn on Bell',
    desc: 'Subscribe and ring the notification bell for instant alerts.',
    inputLabel: 'YouTube Channel URL (Sub & Bell)',
    placeholder: 'https://www.youtube.com/@faconmods',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'like_comment',
    label: '+ Like & Comment',
    actionTitle: 'Like & Comment on Video',
    desc: 'Leave a like and drop a comment on our video.',
    inputLabel: 'YouTube Video URL (Like & Comment)',
    placeholder: 'https://www.youtube.com/watch?v=example',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'like_video',
    label: '+ Like Video',
    actionTitle: 'Like YouTube Video',
    desc: 'Give a thumbs up to this YouTube video.',
    inputLabel: 'YouTube Video URL to Like',
    placeholder: 'https://www.youtube.com/watch?v=example',
    platform: 'youtube',
    domains: ['youtube.com', 'youtu.be']
  },
  {
    id: 'follow_instagram',
    label: '+ Follow Instagram',
    actionTitle: 'Follow Instagram',
    desc: 'Follow our official Instagram profile for stories & updates.',
    inputLabel: 'Instagram Profile URL to Follow',
    placeholder: 'https://www.instagram.com/faconmods',
    platform: 'instagram',
    domains: ['instagram.com', 'instagr.am']
  },
  {
    id: 'follow_facebook',
    label: '+ Follow Facebook',
    actionTitle: 'Follow Facebook',
    desc: 'Follow our Facebook page to join the community.',
    inputLabel: 'Facebook Page/Profile URL to Follow',
    placeholder: 'https://www.facebook.com/faconmods',
    platform: 'facebook',
    domains: ['facebook.com', 'fb.me', 'fb.com']
  },
  {
    id: 'follow_twitter',
    label: '+ Follow Twitter/X',
    actionTitle: 'Follow on X',
    desc: 'Follow our official X (Twitter) profile for news.',
    inputLabel: 'Twitter/X Profile URL to Follow',
    placeholder: 'https://x.com/faconmods',
    platform: 'twitter',
    domains: ['twitter.com', 'x.com']
  },
  {
    id: 'join_telegram',
    label: '+ Join Telegram',
    actionTitle: 'Join Telegram',
    desc: 'Join our Telegram channel for direct download alerts.',
    inputLabel: 'Telegram Channel or Group URL',
    placeholder: 'https://t.me/faconmods',
    platform: 'telegram',
    domains: ['t.me', 'telegram.me']
  },
  {
    id: 'join_discord',
    label: '+ Join Discord',
    actionTitle: 'Join Discord',
    desc: 'Join our Discord server to connect with community members.',
    inputLabel: 'Discord Server Invite URL',
    placeholder: 'https://discord.gg/invitelink',
    platform: 'discord',
    domains: ['discord.gg', 'discord.com']
  }
];

// App State
let selectedTaskIds = new Set();
let taskUrlValues = {};
let currentGeneratedCampaign = null;
let currentVisitorCampaign = null;
let currentManagedCampaign = null;
let currentManagedKey = null;
let visitorTaskVerification = {}; // taskId -> boolean

// Local storage keys
const STORAGE_KEY = 'faconmods_campaigns_db_v1';
const CREATOR_KEYS_STORAGE = 'faconmods_creator_keys_v1';

// Creator Keys Security Store (stores authorization keys for campaigns created by this user)
function getStoredCreatorKeys() {
  try {
    const raw = localStorage.getItem(CREATOR_KEYS_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCreatorKey(campaignId, key) {
  try {
    const keys = getStoredCreatorKeys();
    keys[campaignId] = key;
    localStorage.setItem(CREATOR_KEYS_STORAGE, JSON.stringify(keys));
  } catch (e) {}
}

function removeCreatorKey(campaignId) {
  try {
    const keys = getStoredCreatorKeys();
    delete keys[campaignId];
    localStorage.setItem(CREATOR_KEYS_STORAGE, JSON.stringify(keys));
  } catch (e) {}
}

function getCreatorKey(campaignId) {
  const keys = getStoredCreatorKeys();
  return keys[campaignId] || null;
}

// Get Base Origin for Link Generation
function getBaseOrigin() {
  let origin = window.location.origin;
  if (!origin || origin === 'null' || origin.startsWith('file:')) {
    origin = 'https://faconmods.netlify.app';
  }
  return origin;
}

// Build PUBLIC Link for Visitors (Standalone simple unlocker page)
function buildPublicUrl(campaign) {
  const origin = getBaseOrigin();
  const encoded = encodeCampaignData(campaign);
  return `${origin}/unlock.html?c=${campaign.id}${encoded ? '&d=' + encoded : ''}`;
}

// Build PRIVATE Management Link for Creator (Dashboard with authorization token)
function buildPrivateUrl(campaignId, manageKey) {
  const origin = getBaseOrigin();
  return `${origin}/index.html?manage=${campaignId}&key=${manageKey}`;
}

// ==========================================================================
// CREATOR AUTHENTICATION STATE & HELPERS
// ==========================================================================
const AUTH_TOKEN_KEY = 'facon_auth_token';
let currentCreatorUser = null;
let currentAuthTab = 'login';

function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch (_) {
    return '';
  }
}

function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (_) {}
}

function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (_) {}
}

async function checkCreatorAuthStatus() {
  const token = getAuthToken();
  if (!token) {
    currentCreatorUser = null;
    renderCreatorAuthNav();
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        currentCreatorUser = data.user;
      } else {
        currentCreatorUser = null;
        clearAuthToken();
      }
    } else {
      currentCreatorUser = null;
      clearAuthToken();
    }
  } catch (_) {
    // If backend offline, assume logged in if token exists
  }
  renderCreatorAuthNav();
}

function renderCreatorAuthNav() {
  const desktopNav = document.getElementById('creatorAuthNavArea');
  const mobileNav = document.getElementById('mobileCreatorAuthArea');

  const html = currentCreatorUser ? `
    <div class="creator-logged-pill">
      <span>👤 ${escapeHtml(currentCreatorUser.username)}</span>
      <button type="button" class="creator-logout-btn" onclick="handleCreatorLogout()" title="Log out">Log out</button>
    </div>
  ` : `
    <button type="button" class="creator-auth-btn" onclick="openCreatorAuthModal()">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      Creator Login
    </button>
  `;

  if (desktopNav) desktopNav.innerHTML = html;
  if (mobileNav) mobileNav.innerHTML = html;
}

function openCreatorAuthModal(requiredMsg) {
  const modal = document.getElementById('creatorAuthModal');
  const errorEl = document.getElementById('authErrorMsg');
  if (errorEl) {
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
    if (requiredMsg) {
      errorEl.textContent = requiredMsg;
      errorEl.classList.add('visible');
    }
  }
  if (modal) modal.style.display = 'flex';
}

function closeCreatorAuthModal() {
  const modal = document.getElementById('creatorAuthModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');
  const title = document.getElementById('authModalTitle');
  const submitText = document.getElementById('authSubmitText');
  const errorEl = document.getElementById('authErrorMsg');

  if (errorEl) errorEl.classList.remove('visible');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    if (title) title.textContent = 'Creator Login';
    if (submitText) submitText.textContent = 'LOG IN';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    if (title) title.textContent = 'Register Creator Account';
    if (submitText) submitText.textContent = 'REGISTER';
  }
}

async function submitCreatorAuth() {
  const usernameInput = document.getElementById('authUsernameInput');
  const passwordInput = document.getElementById('authPasswordInput');
  const errorEl = document.getElementById('authErrorMsg');
  const submitBtn = document.getElementById('authSubmitBtn');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!username || !password) {
    if (errorEl) {
      errorEl.textContent = 'Please enter both username and password.';
      errorEl.classList.add('visible');
    }
    return;
  }

  const endpoint = currentAuthTab === 'register' ? '/api/auth/register' : '/api/auth/login';

  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok && data.success && data.token) {
      setAuthToken(data.token);
      currentCreatorUser = data.user;
      renderCreatorAuthNav();
      closeCreatorAuthModal();
      showToast(currentAuthTab === 'register' ? 'Account created! Welcome, creator.' : 'Logged in successfully!');
      loadCampaignsFromStorage();
    } else {
      if (errorEl) {
        errorEl.textContent = data.error || 'Authentication failed. Please check your credentials.';
        errorEl.classList.add('visible');
      }
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'Network error contacting server.';
      errorEl.classList.add('visible');
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleCreatorLogout() {
  const token = getAuthToken();
  if (token) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
  }
  clearAuthToken();
  currentCreatorUser = null;
  renderCreatorAuthNav();
  showToast('Logged out.');
  loadCampaignsFromStorage();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderTaskButtons();
  setupEventListeners();
  checkCreatorAuthStatus();
  checkUrlParamsForCampaign();
  loadCampaignsFromStorage();
});

// Setup Mobile Menu & Global Listeners
function setupEventListeners() {
  const hamburger = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }

  // Clear destination error on typing
  const destInput = document.getElementById('destinationUrlInput');
  if (destInput) {
    destInput.addEventListener('input', () => {
      const err = document.getElementById('destinationError');
      if (err) {
        err.classList.remove('visible');
        err.textContent = '';
      }
    });
  }

  // Handle browser back/forward or hash changes
  window.addEventListener('popstate', () => {
    checkUrlParamsForCampaign();
  });

  // Record departure timestamp when user actually leaves/hides page
  const recordDeparture = () => {
    const raw = localStorage.getItem('facon_pending_verification');
    if (raw) {
      try {
        const pending = JSON.parse(raw);
        if (pending && !pending.departedAt) {
          pending.departedAt = Date.now();
          localStorage.setItem('facon_pending_verification', JSON.stringify(pending));
        }
      } catch (_) {}
    }
  };

  window.addEventListener('pagehide', recordDeparture);
  window.addEventListener('beforeunload', recordDeparture);

  // Listen for return from external task visit in same tab (mobile & desktop)
  window.addEventListener('pageshow', (event) => {
    checkPendingVerification();
  });

  // Listen for tab focus/visibility changes on desktop and mobile
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      recordDeparture();
    } else if (document.visibilityState === 'visible') {
      checkPendingVerification();
    }
  });
}

// Render 11 Task Selection Buttons
function renderTaskButtons() {
  const grid = document.getElementById('taskButtonsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  TASK_DEFINITIONS.forEach(task => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `task-chip-btn ${selectedTaskIds.has(task.id) ? 'selected' : ''}`;
    btn.id = `btn_task_${task.id}`;
    btn.onclick = () => toggleTask(task.id);

    btn.innerHTML = `
      <span class="check-icon">✓</span>
      <span>${task.label}</span>
    `;
    grid.appendChild(btn);
  });
}

// Toggle Task Selection
function toggleTask(taskId) {
  if (selectedTaskIds.has(taskId)) {
    selectedTaskIds.delete(taskId);
    delete taskUrlValues[taskId];
  } else {
    selectedTaskIds.add(taskId);
    if (!taskUrlValues[taskId]) {
      taskUrlValues[taskId] = '';
    }
  }

  renderTaskButtons();
  renderTaskInputs();
}

// Render dynamic URL input fields for selected tasks
function renderTaskInputs() {
  const container = document.getElementById('taskInputsContainer');
  const list = document.getElementById('taskInputsList');
  if (!container || !list) return;

  if (selectedTaskIds.size === 0) {
    container.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  list.innerHTML = '';

  TASK_DEFINITIONS.forEach(task => {
    if (!selectedTaskIds.has(task.id)) return;

    const item = document.createElement('div');
    item.className = 'task-input-item';
    item.id = `input_item_${task.id}`;

    item.innerHTML = `
      <div class="task-input-header">
        <div class="task-input-meta">
          <div class="platform-badge ${task.platform}">
            ${getPlatformIcon(task.platform)}
          </div>
          <div>
            <div class="task-label-title">${escapeHtml(task.inputLabel)}</div>
            <div class="task-label-sub">${escapeHtml(task.desc)}</div>
          </div>
        </div>
        <button type="button" class="remove-task-btn" onclick="toggleTask('${task.id}')" title="Remove task">×</button>
      </div>
      <div class="input-wrapper">
        <input type="url" class="facon-input" id="url_input_${task.id}"
               placeholder="${task.placeholder}"
               value="${escapeHtml(taskUrlValues[task.id] || '')}"
               oninput="updateTaskUrl('${task.id}', this.value)">
        <button type="button" class="clear-input-btn" onclick="clearTaskInput('${task.id}')">×</button>
      </div>
      <div class="error-msg" id="error_${task.id}"></div>
    `;

    list.appendChild(item);
  });
}

function updateTaskUrl(taskId, value) {
  taskUrlValues[taskId] = value;
  const errEl = document.getElementById(`error_${taskId}`);
  const itemEl = document.getElementById(`input_item_${taskId}`);
  if (errEl) {
    errEl.classList.remove('visible');
    errEl.textContent = '';
  }
  if (itemEl) {
    itemEl.classList.remove('has-error');
  }
}

function clearTaskInput(taskId) {
  const input = document.getElementById(`url_input_${taskId}`);
  if (input) {
    input.value = '';
    updateTaskUrl(taskId, '');
  }
}

function clearDestinationInput() {
  const input = document.getElementById('destinationUrlInput');
  if (input) {
    input.value = '';
  }
}

// URL Validation
function validateUrl(url, expectedDomains = null) {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'URL cannot be empty' };
  }

  // Reject malicious schemes
  if (/^(javascript|data|file|vbscript):/i.test(trimmed)) {
    return { valid: false, message: 'Invalid or prohibited URL protocol' };
  }

  let formatted = trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    formatted = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(formatted);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { valid: false, message: 'Please enter a valid domain address' };
    }

    if (expectedDomains && expectedDomains.length > 0) {
      const hostname = parsed.hostname.toLowerCase();
      const matched = expectedDomains.some(d => hostname === d || hostname.endsWith('.' + d));
      if (!matched) {
        return {
          valid: false,
          message: `Must be a valid ${expectedDomains.join(' or ')} link`
        };
      }
    }

    return { valid: true, formattedUrl: formatted };
  } catch (e) {
    return { valid: false, message: 'Invalid URL structure' };
  }
}

// Generate Button Handler
async function handleGenerate() {
  const destInput = document.getElementById('destinationUrlInput');
  const destError = document.getElementById('destinationError');
  const destValue = (destInput ? destInput.value : '').trim();

  // Validate destination
  const destValidation = validateUrl(destValue);
  if (!destValidation.valid) {
    if (destError) {
      destError.textContent = destValidation.message;
      destError.classList.add('visible');
    }
    showToast('Please fix destination URL');
    return;
  }

  // Validate tasks
  if (selectedTaskIds.size === 0) {
    showToast('Please select at least one task above!');
    return;
  }

  let hasErrors = false;
  const preparedTasks = [];

  for (const taskId of selectedTaskIds) {
    const taskDef = TASK_DEFINITIONS.find(t => t.id === taskId);
    const rawUrl = taskUrlValues[taskId] || '';
    const validation = validateUrl(rawUrl, taskDef.domains);
    const errEl = document.getElementById(`error_${taskId}`);
    const itemEl = document.getElementById(`input_item_${taskId}`);

    if (!validation.valid) {
      hasErrors = true;
      if (errEl) {
        errEl.textContent = validation.message;
        errEl.classList.add('visible');
      }
      if (itemEl) {
        itemEl.classList.add('has-error');
      }
    } else {
      preparedTasks.push({
        id: taskId,
        taskType: taskId,
        label: taskDef.label,
        actionTitle: taskDef.actionTitle,
        desc: taskDef.desc,
        platform: taskDef.platform,
        taskUrl: validation.formattedUrl
      });
    }
  }

  if (hasErrors) {
    showToast('Please correct errors on selected tasks');
    return;
  }

  // Show button spinner
  const btn = document.getElementById('generateBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnSpinner = btn.querySelector('.btn-spinner');
  if (btnText && btnSpinner) {
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    btn.disabled = true;
  }

  // Generate unique campaign ID and secure management key (48-char hex)
  const clientKey = Array.from(window.crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const campaignId = 'FM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const campaignData = {
    id: campaignId,
    title: `FACONMODS Campaign #${campaignId}`,
    destinationUrl: destValidation.formattedUrl,
    tasks: preparedTasks,
    manageKey: clientKey,
    createdAt: Date.now(),
    clicks: 0,
    unlocks: 0
  };

  let assignedKey = clientKey;

  try {
    // Send to backend server API
    const headers = { 'Content-Type': 'application/json' };
    const authToken = getAuthToken();
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(campaignData)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.manageKey) {
        assignedKey = data.manageKey;
        campaignData.manageKey = assignedKey;
      }
    }
  } catch (_) {
    // Static fallback
  }

  // Save creator authorization key and campaign to persistent store
  saveCreatorKey(campaignId, assignedKey);
  saveCampaignToLocal(campaignData);
  currentGeneratedCampaign = campaignData;

  // Restore button
  if (btnText && btnSpinner) {
    btnText.style.display = 'flex';
    btnSpinner.style.display = 'none';
    btn.disabled = false;
  }

  // Display Result Box with TWO distinct links
  displayResultBox(campaignData, assignedKey);
  showToast(`Campaign ${campaignId} generated successfully!`);
}

// Encode campaign compactly for universal static/dynamic link sharing
function encodeCampaignData(campaign) {
  try {
    const compact = {
      id: campaign.id,
      dst: campaign.destinationUrl,
      t: campaign.tasks.map(t => ({
        id: t.id,
        u: t.taskUrl
      }))
    };
    return btoa(encodeURIComponent(JSON.stringify(compact)));
  } catch (e) {
    return '';
  }
}

// Decode campaign from payload
function decodeCampaignData(encoded) {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    const compact = JSON.parse(jsonStr);
    if (!compact || !compact.id || !compact.dst || !Array.isArray(compact.t)) return null;

    const fullTasks = compact.t.map(ct => {
      const def = TASK_DEFINITIONS.find(d => d.id === ct.id) || {};
      return {
        id: ct.id,
        label: def.label || ct.id,
        actionTitle: def.actionTitle || ct.id,
        desc: def.desc || 'Complete this task',
        taskUrl: ct.u,
        platform: def.platform || 'youtube'
      };
    });

    return {
      id: compact.id,
      title: `Campaign ${compact.id}`,
      destinationUrl: compact.dst,
      tasks: fullTasks,
      createdAt: Date.now(),
      clicks: 0,
      unlocks: 0
    };
  } catch (e) {
    return null;
  }
}

// Display Result Box with TWO Separate Links
function displayResultBox(campaign, manageKey) {
  const box = document.getElementById('resultBox');
  const meta = document.getElementById('resultMeta');
  const publicInput = document.getElementById('publicUrlInput');
  const privateInput = document.getElementById('privateUrlInput');
  if (!box || !publicInput || !privateInput) return;

  const key = manageKey || getCreatorKey(campaign.id) || campaign.manageKey || '';
  const publicUrl = buildPublicUrl(campaign);
  const privateUrl = buildPrivateUrl(campaign.id, key);

  if (meta) {
    meta.textContent = `Campaign ID: ${campaign.id} • ${campaign.tasks.length} required tasks`;
  }

  publicInput.value = publicUrl;
  privateInput.value = privateUrl;
  box.style.display = 'block';

  // Smooth scroll to result
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Copy Public Link
function copyPublicLink() {
  const input = document.getElementById('publicUrlInput');
  const btnText = document.getElementById('copyPublicBtnText');
  if (!input) return;
  copyText(input.value);
  if (btnText) {
    btnText.textContent = 'COPIED!';
    setTimeout(() => { btnText.textContent = 'COPY'; }, 2000);
  }
}

// Copy Private Management Link
function copyPrivateLink() {
  const input = document.getElementById('privateUrlInput');
  const btnText = document.getElementById('copyPrivateBtnText');
  if (!input) return;
  copyText(input.value);
  if (btnText) {
    btnText.textContent = 'COPIED!';
    setTimeout(() => { btnText.textContent = 'COPY'; }, 2000);
  }
}

// Share Public Link
function sharePublicLink() {
  const input = document.getElementById('publicUrlInput');
  if (!input) return;

  if (navigator.share) {
    navigator.share({
      title: 'FACONMODS Locked Link',
      text: 'Complete tasks to unlock this link:',
      url: input.value
    }).catch(() => {});
  } else {
    copyPublicLink();
  }
}

// Test Public Link
function openCurrentCampaignPublic() {
  const input = document.getElementById('publicUrlInput');
  if (input && input.value) {
    window.open(input.value, '_blank');
  }
}

// Open Management for Current Campaign
function openCurrentCampaignManage() {
  const input = document.getElementById('privateUrlInput');
  if (input && input.value) {
    window.location.href = input.value;
  }
}

// Open Current Campaign in Visitor Page
function openCurrentCampaignVisitor() {
  if (currentGeneratedCampaign) {
    loadVisitorCampaign(currentGeneratedCampaign.id);
  }
}

// Directly load and render a campaign model into visitor view
function loadVisitorCampaignDirect(campaign) {
  if (!campaign) return;

  // Record visit click
  campaign.clicks = (campaign.clicks || 0) + 1;
  saveCampaignToLocal(campaign);
  fetch(`/api/campaigns/${campaign.id}/click`, { method: 'POST' }).catch(() => {});

  currentVisitorCampaign = campaign;
  visitorTaskVerification = {};

  navigateTo('visitor');

  const metaEl = document.getElementById('visitorCampaignMeta');
  if (metaEl) {
    metaEl.textContent = `Campaign: ${campaign.id} • Complete the ${campaign.tasks.length} steps below to unlock destination.`;
  }

  renderVisitorTasks(campaign);
  updateVisitorProgress();
}

// Public Locked-Link Page Logic
async function loadVisitorCampaign(campaignId) {
  let campaign = null;

  // 1. Check server API
  try {
    const res = await fetch(`/api/campaigns/${campaignId}`);
    if (res.ok) {
      campaign = await res.json();
    }
  } catch (_) {}

  // 2. Fallback to local storage
  if (!campaign) {
    const local = getSavedCampaigns();
    campaign = local.find(c => c.id === campaignId);
  }

  if (!campaign) {
    showToast(`Campaign ${campaignId} not found`);
    navigateTo('visitor');
    return;
  }

  loadVisitorCampaignDirect(campaign);
}

// Map each task to its specific clear action button label
function getTaskActionLabel(task) {
  const id = (task.id || task.taskType || '').toLowerCase();
  if (id.includes('subscribe_2') || id.includes('second_subscribe')) return 'Subscribe to 2nd Channel';
  if (id.includes('sub_bell')) return 'Subscribe & Turn on Bell';
  if (id.includes('like_subscribe')) return 'Like & Subscribe';
  if (id.includes('like_comment')) return 'Like & Comment';
  if (id.includes('like_video')) return 'Like Video';
  if (id.includes('subscribe')) return 'Subscribe to Channel';
  if (id.includes('discord')) return 'Join Discord';
  if (id.includes('telegram')) return 'Join Telegram';
  if (id.includes('instagram')) return 'Follow Instagram';
  if (id.includes('facebook')) return 'Follow Facebook';
  if (id.includes('twitter')) return 'Follow on X';
  return task.actionTitle || 'Complete Task';
}

function getButtonIcon(platform) {
  switch (platform) {
    case 'youtube':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'discord':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
    case 'telegram':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case 'facebook':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    case 'twitter':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
  }
}

// Render Visitor Task Cards with Clear Action Label and Clean Completed State
function renderVisitorTasks(campaign) {
  const list = document.getElementById('visitorTasksList');
  if (!list) return;
  list.innerHTML = '';

  campaign.tasks.forEach((task, index) => {
    const isDone = !!visitorTaskVerification[task.id];
    const actionLabel = getTaskActionLabel(task);
    const card = document.createElement('div');
    card.className = `visitor-task-card ${isDone ? 'verified' : ''}`;
    card.id = `visitor_card_${task.id}`;

    card.innerHTML = `
      <div class="visitor-task-main">
        <div class="visitor-task-info">
          <div class="platform-badge ${task.platform}">
            ${getPlatformIcon(task.platform)}
          </div>
          <div>
            <div class="visitor-task-title">Step ${index + 1}: ${escapeHtml(task.actionTitle || task.label)}</div>
            <div class="visitor-task-desc">${escapeHtml(task.desc || 'Complete this task')}</div>
          </div>
        </div>
        ${isDone ? '<div class="status-badge">✓</div>' : ''}
      </div>
      <div class="visitor-task-actions">
        <button type="button" id="action_btn_${task.id}" class="visitor-unified-btn ${isDone ? 'verified' : ''}"
                onclick="startTaskVerificationFlow('${task.id}', '${task.taskUrl}')" ${isDone ? 'disabled' : ''}>
          ${isDone ? `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>COMPLETED</span>
          ` : `
            ${getButtonIcon(task.platform)}
            <span>${escapeHtml(actionLabel)}</span>
          `}
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

// Start Task Verification Flow: Navigates to destination in same tab and runs silent 10-second timer
function startTaskVerificationFlow(taskId, taskUrl) {
  if (visitorTaskVerification[taskId]) return;

  const btn = document.getElementById(`action_btn_${taskId}`);

  // Save pending verification state in localStorage
  const pending = {
    campaignId: currentVisitorCampaign.id,
    taskId: taskId,
    taskUrl: taskUrl,
    departedAt: Date.now()
  };
  localStorage.setItem('facon_pending_verification', JSON.stringify(pending));

  if (btn) {
    btn.innerHTML = `<span class="btn-spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;"></span> Opening...`;
  }

  // Navigate to configured destination URL in same tab
  setTimeout(() => {
    window.location.href = taskUrl;
  }, 350);
}

// Check if user returned from destination link (called on pageshow and visibilitychange)
function checkPendingVerification() {
  const raw = localStorage.getItem('facon_pending_verification');
  if (!raw) return;

  let pending;
  try {
    pending = JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem('facon_pending_verification');
    return;
  }

  if (!pending || !pending.taskId || !pending.departedAt) return;

  // Clear immediately to prevent repeat evaluation
  localStorage.removeItem('facon_pending_verification');

  const elapsedMs = Date.now() - pending.departedAt;
  const elapsedSeconds = Math.round(elapsedMs / 1000);

  // If campaign isn't loaded yet, load it first
  if (!currentVisitorCampaign || currentVisitorCampaign.id !== pending.campaignId) {
    loadVisitorCampaign(pending.campaignId).then(() => {
      evaluateVerification(pending, elapsedSeconds);
    });
  } else {
    evaluateVerification(pending, elapsedSeconds);
  }
}

// Evaluate whether the user stayed away for at least 10 seconds (silent background check)
function evaluateVerification(pending, elapsedSeconds) {
  const btn = document.getElementById(`action_btn_${pending.taskId}`);
  const task = currentVisitorCampaign?.tasks?.find(t => t.id === pending.taskId);
  const actionLabel = task ? getTaskActionLabel(task) : 'Complete Task';

  if (elapsedSeconds < 10) {
    // FAILED: returned before 10 seconds. Keep task incomplete!
    if (btn) {
      btn.className = 'visitor-unified-btn';
      btn.disabled = false;
      btn.innerHTML = `
        ${getButtonIcon(task ? task.platform : '')}
        <span>${escapeHtml(actionLabel)}</span>
      `;
    }
    showToast('Task not completed. Please try again.');
  } else {
    // PASSED: 10 or more seconds passed away from page. Mark complete!
    visitorTaskVerification[pending.taskId] = true;

    if (btn) {
      btn.className = 'visitor-unified-btn verified';
      btn.disabled = true;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>COMPLETED</span>
      `;
    }

    const card = document.getElementById(`visitor_card_${pending.taskId}`);
    if (card) {
      card.classList.add('verified');
      const main = card.querySelector('.visitor-task-main');
      if (main && !main.querySelector('.status-badge')) {
        const badge = document.createElement('div');
        badge.className = 'status-badge';
        badge.textContent = '✓';
        main.appendChild(badge);
      }
    }

    updateVisitorProgress();
  }
}

// Update Visitor Progress & Lock state
function updateVisitorProgress() {
  if (!currentVisitorCampaign) return;

  const tasks = currentVisitorCampaign.tasks;
  const total = tasks.length;
  const completed = tasks.filter(t => visitorTaskVerification[t.id]).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pText = document.getElementById('progressText');
  const pPercent = document.getElementById('progressPercent');
  const pBar = document.getElementById('progressBarFill');

  if (pText) pText.textContent = `Tasks: ${completed} / ${total} completed`;
  if (pPercent) pPercent.textContent = `${percent}%`;
  if (pBar) pBar.style.width = `${percent}%`;

  const lockCard = document.getElementById('destinationLockCard');
  const lockHeading = document.getElementById('lockHeading');
  const lockDesc = document.getElementById('lockDescription');
  const unlockBtn = document.getElementById('unlockProceedBtn');
  const unlockBtnText = document.getElementById('unlockProceedBtnText');
  const lockClosed = document.getElementById('lockClosedSvg');
  const lockOpen = document.getElementById('lockOpenSvg');

  if (completed === total && total > 0) {
    // Unlocked!
    if (lockCard) lockCard.classList.add('unlocked');
    if (lockHeading) lockHeading.textContent = 'DESTINATION UNLOCKED!';
    if (lockDesc) lockDesc.textContent = 'All steps completed and verified! Click the button below to proceed to your target link.';
    if (unlockBtn) {
      unlockBtn.disabled = false;
    }
    if (unlockBtnText) unlockBtnText.textContent = 'UNLOCK & PROCEED';
    if (lockClosed) lockClosed.style.display = 'none';
    if (lockOpen) lockOpen.style.display = 'inline-block';
  } else {
    // Locked
    if (lockCard) lockCard.classList.remove('unlocked');
    if (lockHeading) lockHeading.textContent = 'DESTINATION IS LOCKED';
    if (lockDesc) lockDesc.textContent = 'Destination URL is locked. Visit and verify each required task above to unlock.';
    if (unlockBtn) unlockBtn.disabled = true;
    if (unlockBtnText) unlockBtnText.textContent = `LOCKED (${total - completed} REMAINING)`;
    if (lockClosed) lockClosed.style.display = 'inline-block';
    if (lockOpen) lockOpen.style.display = 'none';
  }
}

// Unlock Destination Action
function handleUnlockDestination() {
  if (!currentVisitorCampaign) return;

  // Increment unlocks count
  currentVisitorCampaign.unlocks = (currentVisitorCampaign.unlocks || 0) + 1;
  saveCampaignToLocal(currentVisitorCampaign);
  fetch(`/api/campaigns/${currentVisitorCampaign.id}/unlock`, { method: 'POST' }).catch(() => {});

  const destination = currentVisitorCampaign.destinationUrl;
  showToast('Redirecting to destination...');

  setTimeout(() => {
    window.location.href = destination;
  }, 1000);
}

// Local Storage & Campaigns Management
function getSavedCampaigns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCampaignToLocal(campaign) {
  try {
    const list = getSavedCampaigns();
    const idx = list.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      list[idx] = campaign;
    } else {
      list.unshift(campaign);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderCampaignsList();
  } catch (e) {}
}

async function loadCampaignsFromStorage() {
  const token = getAuthToken();
  const keys = getStoredCreatorKeys();

  try {
    let serverCampaigns = [];
    if (token) {
      const res = await fetch('/api/creator/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) serverCampaigns = await res.json();
    } else if (Object.keys(keys).length > 0) {
      const res = await fetch('/api/campaigns/my', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys })
      });
      if (res.ok) serverCampaigns = await res.json();
    }

    if (Array.isArray(serverCampaigns) && serverCampaigns.length > 0) {
      serverCampaigns.forEach(sc => {
        saveCampaignToLocal(sc);
      });
    }
  } catch (_) {}

  renderCampaignsList();
}

function renderCampaignsList() {
  const container = document.getElementById('campaignsContainer');
  const countActive = document.getElementById('statActiveCount');
  const countClicks = document.getElementById('statClicksCount');
  const countUnlocks = document.getElementById('statUnlocksCount');

  const allCampaigns = getSavedCampaigns();
  const creatorKeys = getStoredCreatorKeys();

  // Filter to campaigns where the creator holds the private manageKey
  const campaigns = allCampaigns.filter(c => !!creatorKeys[c.id] || !!c.manageKey);

  if (countActive) countActive.textContent = campaigns.length;
  if (countClicks) countClicks.textContent = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  if (countUnlocks) countUnlocks.textContent = campaigns.reduce((acc, c) => acc + (c.unlocks || 0), 0);

  if (!container) return;

  if (campaigns.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No campaigns created yet. Click "+ New Link" to generate your first link.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  campaigns.forEach(c => {
    const card = document.createElement('div');
    card.className = 'campaign-row-card';

    const dateStr = new Date(c.createdAt || Date.now()).toLocaleDateString();
    const key = creatorKeys[c.id] || c.manageKey || '';
    const publicUrl = buildPublicUrl(c);
    const privateUrl = buildPrivateUrl(c.id, key);
    const clicks = c.clicks || 0;
    const unlocks = c.unlocks || 0;
    const rate = clicks > 0 ? Math.round((unlocks / clicks) * 100) : 0;

    card.innerHTML = `
      <div class="campaign-row-top">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="campaign-id-badge">${c.id}</span>
          <span class="status-live-badge">● ACTIVE</span>
        </div>
        <button type="button" class="delete-btn" onclick="deleteCampaignFromList('${c.id}')" title="Delete">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
      <div class="campaign-destination">Target: ${escapeHtml(c.destinationUrl)}</div>
      <div class="campaign-meta-details">${c.tasks.length} tasks • ${clicks} visits • ${unlocks} unlocks (${rate}%) • ${dateStr}</div>
      <div class="campaign-row-actions" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
        <button type="button" class="row-copy-btn" onclick="copyText('${publicUrl}')" style="background-color: var(--color-blue-btn); color: #fff;">Copy Public</button>
        <button type="button" class="row-copy-btn" onclick="copyText('${privateUrl}')" style="background-color: var(--color-pink); color: #fff;">Copy Private</button>
        <button type="button" class="row-view-btn" onclick="loadManageCampaign('${c.id}', '${key}')">Manage & Edit</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Delete campaign from creator list (requires server-side manageKey)
async function deleteCampaignFromList(id) {
  const key = getCreatorKey(id);
  if (!confirm(`Are you sure you want to delete campaign ${id}? This cannot be undone.`)) {
    return;
  }

  try {
    await fetch(`/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Manage-Key': key || ''
      }
    });
  } catch (_) {}

  const list = getSavedCampaigns().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  removeCreatorKey(id);
  renderCampaignsList();
  showToast(`Campaign ${id} deleted`);
}

// Load Campaign into Creator Management Dashboard
async function loadManageCampaign(campaignId, manageKey) {
  let campaign = null;
  const headers = {};
  if (manageKey) headers['X-Manage-Key'] = manageKey;
  const authToken = getAuthToken();
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(`/api/campaigns/${campaignId}/manage`, { headers });
    if (res.ok) {
      const data = await res.json();
      campaign = data.campaign;
    } else if (res.status === 401 || res.status === 403) {
      showToast('Unauthorized: Creator login or valid management key required.');
      openCreatorAuthModal(`Please log in as creator or provide the private management key for campaign ${campaignId}.`);
      return;
    }
  } catch (_) {}

  // Fallback to local storage if offline / static
  if (!campaign) {
    const local = getSavedCampaigns();
    const found = local.find(c => c.id === campaignId);
    if (found) {
      const storedKey = getCreatorKey(campaignId) || found.manageKey;
      if (!manageKey || (storedKey && storedKey === manageKey)) {
        campaign = found;
      }
    }
  }

  if (!campaign) {
    showToast(`Campaign ${campaignId} not found or unauthorized.`);
    openCreatorAuthModal(`Enter creator credentials to access campaign ${campaignId}`);
    return;
  }

  // Save authorized key to creator store
  saveCreatorKey(campaignId, manageKey);
  currentManagedCampaign = campaign;
  currentManagedKey = manageKey;

  // Ensure creator mode is active
  document.body.classList.remove('public-visitor-mode');

  // Populate Management UI
  const titleEl = document.getElementById('manageCampaignTitle');
  const metaEl = document.getElementById('manageCampaignMeta');
  const clicksEl = document.getElementById('manageClicks');
  const unlocksEl = document.getElementById('manageUnlocks');
  const convEl = document.getElementById('manageConversion');
  const pubInput = document.getElementById('managePublicUrlInput');
  const privInput = document.getElementById('managePrivateUrlInput');
  const editDest = document.getElementById('editDestinationInput');

  if (titleEl) titleEl.textContent = `Campaign ${campaign.id}`;
  const dateStr = new Date(campaign.createdAt || Date.now()).toLocaleDateString();
  if (metaEl) metaEl.textContent = `Created on ${dateStr} • ${campaign.tasks.length} configured tasks`;

  const clicks = campaign.clicks || 0;
  const unlocks = campaign.unlocks || 0;
  const rate = clicks > 0 ? Math.round((unlocks / clicks) * 100) : 0;

  if (clicksEl) clicksEl.textContent = clicks;
  if (unlocksEl) unlocksEl.textContent = unlocks;
  if (convEl) convEl.textContent = `${rate}%`;

  if (pubInput) pubInput.value = buildPublicUrl(campaign);
  if (privInput) privInput.value = buildPrivateUrl(campaign.id, manageKey);
  if (editDest) editDest.value = campaign.destinationUrl;

  renderManageTasksEditList(campaign);
  navigateTo('manage');
}

// Render task list in management edit panel
function renderManageTasksEditList(campaign) {
  const container = document.getElementById('manageTasksEditList');
  if (!container) return;
  container.innerHTML = '';

  campaign.tasks.forEach((task, idx) => {
    const item = document.createElement('div');
    item.className = 'task-input-item';
    item.innerHTML = `
      <div class="task-input-header">
        <div class="task-input-title">
          <span class="platform-dot ${task.platform}"></span>
          <span>${escapeHtml(task.actionTitle || task.label)}</span>
        </div>
      </div>
      <div class="input-wrapper">
        <input type="url" id="edit_task_url_${idx}" class="facon-input" value="${escapeHtml(task.taskUrl)}">
      </div>
    `;
    container.appendChild(item);
  });
}

// Save modified destination and tasks (authorized with X-Manage-Key)
async function saveCampaignModifications() {
  if (!currentManagedCampaign || !currentManagedKey) return;

  const destInput = document.getElementById('editDestinationInput');
  const newDest = (destInput ? destInput.value : '').trim();
  const destVal = validateUrl(newDest);
  if (!destVal.valid) {
    showToast('Please enter a valid destination URL');
    return;
  }

  const updatedTasks = currentManagedCampaign.tasks.map((task, idx) => {
    const urlInput = document.getElementById(`edit_task_url_${idx}`);
    const val = (urlInput ? urlInput.value : '').trim();
    return {
      ...task,
      taskUrl: val || task.taskUrl
    };
  });

  currentManagedCampaign.destinationUrl = destVal.formattedUrl;
  currentManagedCampaign.tasks = updatedTasks;

  try {
    await fetch(`/api/campaigns/${currentManagedCampaign.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Manage-Key': currentManagedKey
      },
      body: JSON.stringify({
        destinationUrl: destVal.formattedUrl,
        tasks: updatedTasks
      })
    });
  } catch (_) {}

  saveCampaignToLocal(currentManagedCampaign);

  const pubInput = document.getElementById('managePublicUrlInput');
  if (pubInput) pubInput.value = buildPublicUrl(currentManagedCampaign);

  showToast('Campaign settings updated successfully!');
}

// Delete current managed campaign
async function deleteCurrentManagedCampaign() {
  if (!currentManagedCampaign || !currentManagedKey) return;

  if (!confirm(`Are you sure you want to delete campaign ${currentManagedCampaign.id}? This cannot be undone.`)) {
    return;
  }

  try {
    await fetch(`/api/campaigns/${currentManagedCampaign.id}`, {
      method: 'DELETE',
      headers: {
        'X-Manage-Key': currentManagedKey
      }
    });
  } catch (_) {}

  const list = getSavedCampaigns().filter(c => c.id !== currentManagedCampaign.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  removeCreatorKey(currentManagedCampaign.id);

  showToast(`Campaign ${currentManagedCampaign.id} deleted.`);
  currentManagedCampaign = null;
  currentManagedKey = null;
  renderCampaignsList();
  navigateTo('campaigns');
}

function copyTextFromInput(id) {
  const el = document.getElementById(id);
  if (el) copyText(el.value);
}

function shareUrlFromInput(id) {
  const el = document.getElementById(id);
  if (!el || !el.value) return;
  if (navigator.share) {
    navigator.share({
      title: 'FACONMODS Locked Link',
      text: 'Complete tasks to unlock this link:',
      url: el.value
    }).catch(() => {});
  } else {
    copyText(el.value);
  }
}

// Navigation between views
function navigateTo(screenId) {
  // Update screen views
  document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`${screenId}Screen`);
  if (target) target.classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.nav-btn, .mobile-menu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenId);
  });

  // Close mobile menu
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');

  // If visitor screen selected without active campaign, populate chip selector
  if (screenId === 'visitor' && !currentVisitorCampaign) {
    populateVisitorChips();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populateVisitorChips() {
  const selector = document.getElementById('visitorCampaignSelector');
  const chipsList = document.getElementById('campaignSelectorList');
  const campaigns = getSavedCampaigns();

  if (!selector || !chipsList) return;

  if (campaigns.length === 0) {
    selector.style.display = 'none';
    return;
  }

  selector.style.display = 'block';
  chipsList.innerHTML = '';

  campaigns.forEach(c => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip-btn ${currentVisitorCampaign && currentVisitorCampaign.id === c.id ? 'active' : ''}`;
    chip.textContent = `${c.id} (${c.tasks.length} tasks)`;
    chip.onclick = () => loadVisitorCampaign(c.id);
    chipsList.appendChild(chip);
  });
}

// Check URL Parameters on Load (?c=FM-XXXXXX and optional ?key=token or ?d=payload)
function checkUrlParamsForCampaign() {
  const params = new URLSearchParams(window.location.search);
  const manageId = params.get('manage');
  const campaignId = params.get('c');
  const manageKey = params.get('key');
  const dataParam = params.get('d') || params.get('data');

  if (manageKey && (manageId || campaignId)) {
    // CREATOR PRIVATE LINK: Authenticated access to dashboard
    document.body.classList.remove('public-visitor-mode');
    const targetId = manageId || campaignId;
    loadManageCampaign(targetId, manageKey);
    return;
  }

  if (manageId) {
    // Creator opened manage route without key in query -> verify session or prompt login
    document.body.classList.remove('public-visitor-mode');
    loadManageCampaign(manageId, null);
    return;
  }

  if (campaignId || dataParam) {
    // PUBLIC VISITOR LINK: Immediately forward to clean standalone public unlocking page
    const publicUrl = `unlock.html?c=${campaignId || ''}${dataParam ? '&d=' + dataParam : ''}`;
    window.location.replace(publicUrl);
    return;
  }

  // Default Home: Creator Dashboard
  document.body.classList.remove('public-visitor-mode');
}

// Quick Sample Demo
function fillDemoData() {
  selectedTaskIds = new Set(['subscribe', 'like_subscribe', 'join_telegram']);
  taskUrlValues = {
    subscribe: 'https://www.youtube.com/@faconmods',
    like_subscribe: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    join_telegram: 'https://t.me/faconmods'
  };

  const destInput = document.getElementById('destinationUrlInput');
  if (destInput) {
    destInput.value = 'https://mediafire.com/file/faconmods_v2_pack.zip';
  }

  renderTaskButtons();
  renderTaskInputs();
  navigateTo('create');
  showToast('Demo data filled! Click GENERATE to build link.');
}

function clearForm() {
  selectedTaskIds.clear();
  taskUrlValues = {};
  const destInput = document.getElementById('destinationUrlInput');
  if (destInput) destInput.value = '';

  renderTaskButtons();
  renderTaskInputs();

  const box = document.getElementById('resultBox');
  if (box) box.style.display = 'none';
  showToast('Form cleared.');
}

// Toast helper
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// SVG platform icon provider
function getPlatformIcon(platform) {
  switch (platform) {
    case 'youtube':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case 'facebook':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    case 'twitter':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    case 'telegram':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
    case 'discord':
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }
}
