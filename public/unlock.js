/**
 * FACONMODS Standalone Public Visitor Unlock Engine
 * Silent background verification and persistent destination unlock
 */

const REQUIRED_VISIT_SECONDS = 10;
let currentCampaign = null;
let completedTaskIds = new Set();
let isDestinationUnlocked = false;
let unlockedDestinationUrl = null;

// Platform Icons SVG map
function getPlatformIcon(platform) {
  switch (platform) {
    case 'youtube':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case 'facebook':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    case 'twitter':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    case 'telegram':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
    case 'discord':
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }
}

// Action button text based on platform / task
function getActionLabel(task) {
  if (task.actionTitle && task.actionTitle.trim()) {
    return task.actionTitle;
  }
  switch (task.platform) {
    case 'youtube':
      if (task.id === 'like_subscribe') return 'Like Video';
      if (task.id === 'like_comment') return 'Like & Comment';
      return 'Subscribe to Channel';
    case 'discord':
      return 'Join Discord';
    case 'telegram':
      return 'Join Telegram';
    case 'instagram':
      return 'Follow Instagram';
    case 'facebook':
      return 'Follow Facebook';
    case 'twitter':
      return 'Follow on X';
    default:
      return task.label || 'Go to Link';
  }
}

// Toast helper
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Persistent visitor ID (ensures progress survives page refreshes and browser restarts)
function getVisitorId() {
  try {
    let vid = localStorage.getItem('faconmods_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('faconmods_visitor_id', vid);
    }
    return vid;
  } catch (_) {
    return 'v_client';
  }
}

// Load visitor progress persistently from storage
function loadVisitorProgress(campaignId) {
  if (!campaignId) return { completedTasks: [], isUnlocked: false, destinationUrl: null };
  const vid = getVisitorId();
  const key = `fm_progress_${campaignId}_${vid}`;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.completedTasks)) {
        return parsed;
      }
    }
  } catch (_) {}

  // Fallback to legacy keys
  try {
    const legacy = JSON.parse(localStorage.getItem(`fm_completed_${campaignId}`) || '[]');
    const isUnlocked = localStorage.getItem(`fm_unlocked_${campaignId}`) === 'true';
    const dest = localStorage.getItem(`fm_dest_${campaignId}`) || null;
    if (Array.isArray(legacy) && legacy.length > 0) {
      return { completedTasks: legacy, isUnlocked, destinationUrl: dest };
    }
  } catch (_) {}

  return { completedTasks: [], isUnlocked: false, destinationUrl: null };
}

// Save visitor progress persistently across storage layers
function saveVisitorProgress(campaignId, progressData) {
  if (!campaignId) return;
  const vid = getVisitorId();
  const key = `fm_progress_${campaignId}_${vid}`;

  try {
    localStorage.setItem(key, JSON.stringify(progressData));
    localStorage.setItem(`fm_completed_${campaignId}`, JSON.stringify(progressData.completedTasks));
    if (progressData.isUnlocked) {
      localStorage.setItem(`fm_unlocked_${campaignId}`, 'true');
      if (progressData.destinationUrl) {
        localStorage.setItem(`fm_dest_${campaignId}`, progressData.destinationUrl);
      }
    }
  } catch (_) {}

  // Sync with backend server
  fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId: vid,
      completedTasks: progressData.completedTasks,
      isUnlocked: progressData.isUnlocked
    })
  }).catch(() => {});
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupLifecycleListeners();
  loadCampaignFromUrl();
});

// Setup listeners to detect when visitor leaves and returns to the tab
function setupLifecycleListeners() {
  const recordDeparture = () => {
    try {
      const raw = localStorage.getItem('fm_pending_unlock_task');
      if (raw) {
        const data = JSON.parse(raw);
        if (!data.departedAt) {
          data.departedAt = Date.now();
          localStorage.setItem('fm_pending_unlock_task', JSON.stringify(data));
        }
      }
    } catch (_) {}
  };

  window.addEventListener('pagehide', recordDeparture);
  window.addEventListener('beforeunload', recordDeparture);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      recordDeparture();
    } else if (document.visibilityState === 'visible') {
      checkPendingVerification();
    }
  });

  window.addEventListener('pageshow', () => {
    checkPendingVerification();
  });

  window.addEventListener('focus', () => {
    checkPendingVerification();
  });
}

// Parse URL for campaign ID or fallback payload
async function loadCampaignFromUrl() {
  const params = new URLSearchParams(window.location.search);
  let campaignId = params.get('c') || params.get('id');

  // Check path segments (e.g. /f/AB12CD, /l/AB12CD, /p/AB12CD, /unlock/AB12CD)
  if (!campaignId) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && ['f', 'l', 'p', 'unlock'].includes(pathParts[0].toLowerCase())) {
      campaignId = pathParts[1];
    } else if (pathParts.length === 1 && !['unlock.html', 'unlock', 'index.html'].includes(pathParts[0].toLowerCase())) {
      campaignId = pathParts[0];
    }
  }

  // Check hash segments (e.g. #/f/AB12CD or #AB12CD)
  if (!campaignId && window.location.hash) {
    const hashClean = window.location.hash.replace(/^#\/?/, '');
    const hashParts = hashClean.split('/').filter(Boolean);
    if (hashParts.length >= 2 && ['f', 'l', 'p', 'unlock'].includes(hashParts[0].toLowerCase())) {
      campaignId = hashParts[1];
    } else if (hashParts.length === 1 && hashParts[0].length >= 3) {
      campaignId = hashParts[0];
    }
  }

  const encodedData = params.get('d') || params.get('data');

  if (!campaignId && !encodedData) {
    showErrorState('No destination specified. Please check your link.');
    return;
  }

  // Record arrival click metric
  if (campaignId) {
    fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/click`, { method: 'POST' }).catch(() => {});
  }

  // 1. Try server fetch for sanitized public campaign data
  if (campaignId) {
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}`);
      if (res.ok) {
        const data = await res.json();
        setupCampaign(data);
        return;
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to client cache/payload:', e);
    }
  }

  // 2. Fallback to localStorage cache (supports all storage keys)
  if (campaignId) {
    try {
      const dbKeys = ['faconmods_campaigns_db_v1', 'faconmods_campaigns_v2', 'faconmods_campaigns_v1'];
      for (const k of dbKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find(c => c && c.id && c.id.toLowerCase() === campaignId.toLowerCase());
          if (found) {
            setupCampaign(found);
            return;
          }
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to encoded payload if offline / static host
  if (encodedData) {
    try {
      const json = decodeURIComponent(atob(encodedData));
      const parsed = JSON.parse(json);
      setupCampaign(parsed);
      return;
    } catch (e) {
      console.error('Failed to decode payload:', e);
    }
  }

  showErrorState('The requested destination could not be loaded. Please check your link.');
}

async function setupCampaign(campaign) {
  currentCampaign = campaign;

  // Clean heading: Never show campaign IDs or technical identifiers on public page
  const subtitle = document.getElementById('unlockCampaignSubtitle');
  if (subtitle) {
    subtitle.textContent = 'Complete the required steps to unlock your destination.';
  }

  // 1. Immediately restore persistent progress from localStorage without reset
  const progress = loadVisitorProgress(campaign.id);
  completedTaskIds.clear();
  if (Array.isArray(progress.completedTasks)) {
    progress.completedTasks.forEach(id => completedTaskIds.add(id));
  }

  if (progress.isUnlocked) {
    isDestinationUnlocked = true;
    if (progress.destinationUrl) {
      unlockedDestinationUrl = progress.destinationUrl;
    }
  }

  // 2. Render initial UI with restored progress
  renderTasks();
  updateProgress();

  // 3. Sync with server in background to ensure zero data loss across devices/sessions
  try {
    const vid = getVisitorId();
    const res = await fetch(`/api/campaigns/${encodeURIComponent(campaign.id)}/progress?visitorId=${encodeURIComponent(vid)}`);
    if (res.ok) {
      const serverProgress = await res.json();
      if (serverProgress && Array.isArray(serverProgress.completedTasks)) {
        serverProgress.completedTasks.forEach(id => completedTaskIds.add(id));
      }
      if (serverProgress && serverProgress.isUnlocked) {
        isDestinationUnlocked = true;
        if (serverProgress.destinationUrl) {
          unlockedDestinationUrl = serverProgress.destinationUrl;
        }
      }

      // Re-save merged progress
      progress.completedTasks = Array.from(completedTaskIds);
      progress.isUnlocked = isDestinationUnlocked || (completedTaskIds.size >= (campaign.tasks || []).length);
      if (unlockedDestinationUrl) progress.destinationUrl = unlockedDestinationUrl;
      saveVisitorProgress(campaign.id, progress);

      // Re-render after sync
      renderTasks();
      updateProgress();
    }
  } catch (_) {}

  // Check any pending return verification
  checkPendingVerification();
}

function renderTasks() {
  const container = document.getElementById('unlockTasksList');
  if (!container || !currentCampaign) return;

  container.innerHTML = '';
  const tasks = currentCampaign.tasks || [];

  if (tasks.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No steps required. Click below to proceed.</div>`;
    return;
  }

  tasks.forEach((task, index) => {
    const isDone = completedTaskIds.has(task.id);
    const card = document.createElement('div');
    card.id = `unlockTaskCard_${task.id}`;
    card.className = `visitor-task-card ${isDone ? 'verified' : ''}`;

    const actionText = getActionLabel(task);
    const iconHtml = getPlatformIcon(task.platform);

    // Clean task title and description without internal IDs or timer notes
    const taskTitle = task.actionTitle || task.label || `Step ${index + 1}`;
    const taskDesc = (task.desc || 'Visit link to proceed').replace(/\b(10[- ]?sec(ond)?s?|timer|countdown)\b/gi, '').trim();

    card.innerHTML = `
      <div class="visitor-task-main">
        <div class="visitor-task-info">
          <div class="platform-badge ${task.platform || 'youtube'}">
            ${iconHtml}
          </div>
          <div>
            <div class="visitor-task-title">${escapeHtml(taskTitle)}</div>
            <div class="visitor-task-desc">${escapeHtml(taskDesc)}</div>
          </div>
        </div>
        ${isDone ? `
          <div class="status-badge" title="Completed">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        ` : ''}
      </div>

      <div class="visitor-task-actions">
        <button type="button" 
                id="unlockTaskBtn_${task.id}" 
                class="visitor-unified-btn ${isDone ? 'verified' : ''}" 
                ${isDone ? 'disabled' : ''} 
                onclick="handleTaskClick('${task.id}')">
          ${isDone ? `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            COMPLETED
          ` : `
            ${actionText}
          `}
        </button>
        <div id="unlockTaskFeedback_${task.id}" class="task-feedback-msg"></div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Visitor clicks task button
function handleTaskClick(taskId) {
  if (!currentCampaign) return;
  const task = (currentCampaign.tasks || []).find(t => t.id === taskId);
  if (!task || !task.taskUrl) return;

  const feedback = document.getElementById(`unlockTaskFeedback_${taskId}`);
  if (feedback) {
    feedback.className = 'task-feedback-msg';
    feedback.style.display = 'none';
  }

  // Save pending verification state in localStorage
  const visitorId = getVisitorId();
  const pending = {
    campaignId: currentCampaign.id,
    visitorId: visitorId,
    taskId: taskId,
    clickedAt: Date.now(),
    departedAt: Date.now()
  };
  localStorage.setItem('fm_pending_unlock_task', JSON.stringify(pending));

  // Open task URL directly in browser
  const win = window.open(task.taskUrl, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    setTimeout(() => {
      window.location.href = task.taskUrl;
    }, 150);
  }
}

// Check pending verification when user returns to tab
function checkPendingVerification() {
  let pendingRaw = null;
  try {
    pendingRaw = localStorage.getItem('fm_pending_unlock_task');
  } catch (_) {}

  if (!pendingRaw) return;

  let pending;
  try {
    pending = JSON.parse(pendingRaw);
  } catch (_) {
    localStorage.removeItem('fm_pending_unlock_task');
    return;
  }

  if (!currentCampaign || pending.campaignId !== currentCampaign.id) {
    return;
  }

  const taskId = pending.taskId;

  // If already completed, simply clear pending item without error
  if (completedTaskIds.has(taskId)) {
    localStorage.removeItem('fm_pending_unlock_task');
    return;
  }

  const departedAt = pending.departedAt || pending.clickedAt || Date.now();
  const awaySeconds = Math.floor((Date.now() - departedAt) / 1000);

  const btn = document.getElementById(`unlockTaskBtn_${taskId}`);
  const feedback = document.getElementById(`unlockTaskFeedback_${taskId}`);
  const card = document.getElementById(`unlockTaskCard_${taskId}`);

  if (awaySeconds >= REQUIRED_VISIT_SECONDS) {
    // 10-second requirement satisfied internally
    completedTaskIds.add(taskId);
    localStorage.removeItem('fm_pending_unlock_task');

    // Persist progress immediately
    const progress = loadVisitorProgress(currentCampaign.id);
    progress.completedTasks = Array.from(completedTaskIds);
    const tasks = currentCampaign.tasks || [];
    if (tasks.every(t => completedTaskIds.has(t.id))) {
      progress.isUnlocked = true;
      isDestinationUnlocked = true;
      prefetchDestinationUrl(currentCampaign.id);
    }
    saveVisitorProgress(currentCampaign.id, progress);

    if (card) card.classList.add('verified');
    if (btn) {
      btn.className = 'visitor-unified-btn verified';
      btn.disabled = true;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        COMPLETED
      `;
    }
    if (feedback) {
      feedback.className = 'task-feedback-msg success';
      feedback.textContent = 'Step completed successfully!';
      feedback.style.display = 'block';
    }

    renderTasks();
    updateProgress();
    showToast('Step completed successfully!');
  } else {
    // Only show failure if user actually clicked and returned too quickly (> 1.5s away)
    const elapsedSinceClick = Date.now() - (pending.clickedAt || Date.now());
    if (elapsedSinceClick > 1500) {
      localStorage.removeItem('fm_pending_unlock_task');
      if (btn) {
        btn.classList.add('retry-state');
        btn.disabled = false;
        const task = (currentCampaign.tasks || []).find(t => t.id === taskId);
        if (task) {
          btn.textContent = getActionLabel(task);
        }
      }
      if (feedback) {
        feedback.className = 'task-feedback-msg error';
        feedback.textContent = 'Task not completed. Please complete the step and try again.';
        feedback.style.display = 'block';
      }
      showToast('Task not completed. Please try again.');
    }
  }
}

// Prefetch verified destination URL when all steps are completed
async function prefetchDestinationUrl(campaignId) {
  if (unlockedDestinationUrl) return unlockedDestinationUrl;
  try {
    const vid = getVisitorId();
    const res = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: vid })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.destinationUrl) {
        unlockedDestinationUrl = data.destinationUrl;
        const progress = loadVisitorProgress(campaignId);
        progress.isUnlocked = true;
        progress.destinationUrl = unlockedDestinationUrl;
        saveVisitorProgress(campaignId, progress);
        return unlockedDestinationUrl;
      }
    }
  } catch (_) {}
  return currentCampaign ? currentCampaign.destinationUrl : null;
}

// Update live progress bar & unlock status
function updateProgress() {
  if (!currentCampaign) return;
  const tasks = currentCampaign.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => completedTaskIds.has(t.id)).length;
  const allDone = (total === 0 || completed >= total || isDestinationUnlocked);
  const percent = total === 0 ? 100 : (allDone ? 100 : Math.round((completed / total) * 100));

  const textEl = document.getElementById('unlockProgressText');
  const percentEl = document.getElementById('unlockProgressPercent');
  const fillEl = document.getElementById('unlockProgressBarFill');

  if (textEl) textEl.textContent = `Tasks: ${allDone ? total : completed} / ${total} completed`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;

  // Destination Lock Card state (Clean single button design)
  const lockCard = document.getElementById('unlockDestinationLockCard');
  const lockClosed = document.getElementById('unlockLockClosedSvg');
  const lockOpen = document.getElementById('unlockLockOpenSvg');
  const heading = document.getElementById('unlockLockHeading');
  const desc = document.getElementById('unlockLockDescription');
  const proceedBtn = document.getElementById('unlockProceedBtn');
  const proceedText = document.getElementById('unlockProceedBtnText');
  const proceedIcon = document.getElementById('unlockProceedBtnIcon');

  if (allDone) {
    if (lockCard) lockCard.classList.add('unlocked');
    if (lockClosed) lockClosed.style.display = 'none';
    if (lockOpen) lockOpen.style.display = 'block';

    if (heading) heading.textContent = '✓ DESTINATION UNLOCKED!';
    if (desc) desc.textContent = 'All required steps completed successfully.';

    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.classList.add('ready');
    }
    if (proceedText) proceedText.textContent = 'GO TO DESTINATION';
    if (proceedIcon) {
      proceedIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      `;
    }
  } else {
    const remaining = total - completed;
    if (lockCard) lockCard.classList.remove('unlocked');
    if (lockClosed) lockClosed.style.display = 'block';
    if (lockOpen) lockOpen.style.display = 'none';

    if (heading) heading.textContent = 'DESTINATION IS LOCKED';
    if (desc) desc.textContent = 'Complete all the required steps above to unlock your destination.';

    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.classList.remove('ready');
    }
    if (proceedText) proceedText.textContent = `LOCKED (${remaining} REMAINING)`;
    if (proceedIcon) {
      proceedIcon.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      `;
    }
  }
}

// Handle final GO TO DESTINATION button click
async function handleUnlockProceed() {
  if (!currentCampaign) return;

  const btn = document.getElementById('unlockProceedBtn');
  if (btn) btn.disabled = true;

  // Retrieve destination URL
  let destinationUrl = unlockedDestinationUrl;

  if (!destinationUrl) {
    const progress = loadVisitorProgress(currentCampaign.id);
    if (progress && progress.destinationUrl) {
      destinationUrl = progress.destinationUrl;
    }
  }

  if (!destinationUrl) {
    destinationUrl = await prefetchDestinationUrl(currentCampaign.id);
  }

  if (!destinationUrl && currentCampaign.destinationUrl) {
    destinationUrl = currentCampaign.destinationUrl;
  }

  if (btn) btn.disabled = false;

  if (!destinationUrl) {
    showToast('Destination link could not be retrieved.');
    return;
  }

  // Save unlocked state permanently so refreshing never resets it
  isDestinationUnlocked = true;
  unlockedDestinationUrl = destinationUrl;
  const progress = loadVisitorProgress(currentCampaign.id);
  progress.isUnlocked = true;
  progress.destinationUrl = destinationUrl;
  saveVisitorProgress(currentCampaign.id, progress);

  // Directly open destination URL in browser
  const win = window.open(destinationUrl, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    window.location.href = destinationUrl;
  }
}

function showErrorState(msg) {
  const container = document.getElementById('unlockTasksList');
  if (container) {
    container.innerHTML = `
      <div style="background: #FEF2F2; border: 1.5px solid #F87171; border-radius: 12px; padding: 20px; text-align: center; color: #991B1B;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Destination Unavailable</h3>
        <p style="font-size: 13px;">${escapeHtml(msg)}</p>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
