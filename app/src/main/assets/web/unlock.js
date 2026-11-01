/**
 * FACONMODS Standalone Public Visitor Unlock Engine
 * Handles silent 10-second background visit verification and safe destination release
 */

const REQUIRED_VISIT_SECONDS = 10;
let currentCampaign = null;
let completedTaskIds = new Set();
let pendingVerification = null;

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
        data.departedAt = Date.now();
        localStorage.setItem('fm_pending_unlock_task', JSON.stringify(data));
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
  let campaignId = params.get('c');
  const pathParts = window.location.pathname.split('/');
  if (!campaignId && pathParts.length > 2 && (pathParts[1] === 'p' || pathParts[1] === 'unlock')) {
    campaignId = pathParts[2];
  }

  const encodedData = params.get('d') || params.get('data');

  if (!campaignId && !encodedData) {
    showErrorState('No campaign specified. Please check your link.');
    return;
  }

  // Record arrival click metric
  if (campaignId) {
    fetch(`/api/campaigns/${campaignId}/click`, { method: 'POST' }).catch(() => {});
  }

  // 1. Try server fetch for sanitized public campaign data
  if (campaignId) {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setupCampaign(data);
        return;
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to client cache/payload:', e);
    }
  }

  // 2. Fallback to encoded payload if offline / static host
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

  // 3. Fallback to localStorage cache
  if (campaignId) {
    try {
      const saved = JSON.parse(localStorage.getItem('faconmods_campaigns_v2') || '[]');
      const found = saved.find(c => c.id === campaignId);
      if (found) {
        setupCampaign(found);
        return;
      }
    } catch (_) {}
  }

  showErrorState(`Campaign ${campaignId || ''} could not be loaded.`);
}

function setupCampaign(campaign) {
  currentCampaign = campaign;
  const subtitle = document.getElementById('unlockCampaignSubtitle');
  if (subtitle && campaign.title) {
    subtitle.textContent = `Complete the required steps to unlock: ${campaign.title}`;
  }

  // Load previously completed tasks for this campaign on this device
  completedTaskIds.clear();
  try {
    const stored = JSON.parse(localStorage.getItem(`fm_completed_${campaign.id}`) || '[]');
    if (Array.isArray(stored)) {
      stored.forEach(id => completedTaskIds.add(id));
    }
  } catch (_) {}

  renderTasks();
  updateProgress();
  checkPendingVerification();
}

function renderTasks() {
  const container = document.getElementById('unlockTasksList');
  if (!container || !currentCampaign) return;

  container.innerHTML = '';
  const tasks = currentCampaign.tasks || [];

  if (tasks.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">No tasks required. You can unlock immediately.</div>`;
    return;
  }

  tasks.forEach((task, index) => {
    const isDone = completedTaskIds.has(task.id);
    const card = document.createElement('div');
    card.id = `unlockTaskCard_${task.id}`;
    card.className = `visitor-task-card ${isDone ? 'verified' : ''}`;

    const actionText = getActionLabel(task);
    const iconHtml = getPlatformIcon(task.platform);

    card.innerHTML = `
      <div class="visitor-task-main">
        <div class="visitor-task-info">
          <div class="platform-badge ${task.platform || 'youtube'}">
            ${iconHtml}
          </div>
          <div>
            <div class="visitor-task-title">${escapeHtml(task.label || task.title || 'Task ' + (index + 1))}</div>
            <div class="visitor-task-desc">${escapeHtml(task.desc || 'Visit link to proceed')}</div>
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

  const btn = document.getElementById(`unlockTaskBtn_${taskId}`);
  const feedback = document.getElementById(`unlockTaskFeedback_${taskId}`);

  if (feedback) {
    feedback.className = 'task-feedback-msg';
    feedback.style.display = 'none';
  }

  // Save pending verification state in localStorage
  const pending = {
    campaignId: currentCampaign.id,
    taskId: taskId,
    clickedAt: Date.now(),
    departedAt: Date.now()
  };
  localStorage.setItem('fm_pending_unlock_task', JSON.stringify(pending));

  // Open task URL in the SAME tab so user leaves to the destination
  setTimeout(() => {
    window.location.href = task.taskUrl;
  }, 100);
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
  const departedAt = pending.departedAt || pending.clickedAt || Date.now();
  const awaySeconds = Math.floor((Date.now() - departedAt) / 1000);

  const btn = document.getElementById(`unlockTaskBtn_${taskId}`);
  const feedback = document.getElementById(`unlockTaskFeedback_${taskId}`);
  const card = document.getElementById(`unlockTaskCard_${taskId}`);

  if (awaySeconds >= REQUIRED_VISIT_SECONDS) {
    // 10-second requirement satisfied
    completedTaskIds.add(taskId);
    try {
      localStorage.setItem(`fm_completed_${currentCampaign.id}`, JSON.stringify(Array.from(completedTaskIds)));
    } catch (_) {}
    localStorage.removeItem('fm_pending_unlock_task');

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
    showToast('Task completed! Keep going.');
  } else {
    // Returned in less than 10 seconds: task remains incomplete
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
      feedback.textContent = 'Task not completed. Please visit the link for at least 10 seconds.';
      feedback.style.display = 'block';
    }
    showToast('Task not completed. Please try again.');
  }
}

// Update live progress bar & unlock status
function updateProgress() {
  if (!currentCampaign) return;
  const tasks = currentCampaign.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => completedTaskIds.has(t.id)).length;
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

  const textEl = document.getElementById('unlockProgressText');
  const percentEl = document.getElementById('unlockProgressPercent');
  const fillEl = document.getElementById('unlockProgressBarFill');

  if (textEl) textEl.textContent = `Tasks: ${completed} / ${total} completed`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;

  // Destination Lock Card state
  const lockCard = document.getElementById('unlockDestinationLockCard');
  const lockClosed = document.getElementById('unlockLockClosedSvg');
  const lockOpen = document.getElementById('unlockLockOpenSvg');
  const heading = document.getElementById('unlockLockHeading');
  const desc = document.getElementById('unlockLockDescription');
  const proceedBtn = document.getElementById('unlockProceedBtn');
  const proceedText = document.getElementById('unlockProceedBtnText');

  const allDone = (completed >= total);

  if (allDone) {
    if (lockCard) lockCard.classList.add('unlocked');
    if (lockClosed) lockClosed.style.display = 'none';
    if (lockOpen) lockOpen.style.display = 'block';
    if (heading) heading.textContent = 'DESTINATION UNLOCKED!';
    if (desc) desc.textContent = 'All tasks completed successfully. Click below to access your destination.';
    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.classList.add('ready');
    }
    if (proceedText) proceedText.textContent = 'UNLOCK & PROCEED';
  } else {
    const remaining = total - completed;
    if (lockCard) lockCard.classList.remove('unlocked');
    if (lockClosed) lockClosed.style.display = 'block';
    if (lockOpen) lockOpen.style.display = 'none';
    if (heading) heading.textContent = 'DESTINATION IS LOCKED';
    if (desc) desc.textContent = 'Complete all the required steps above to unlock the destination link.';
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.classList.remove('ready');
    }
    if (proceedText) proceedText.textContent = `LOCKED (${remaining} REMAINING)`;
  }
}

// Handle final Unlock & Proceed button click
async function handleUnlockProceed() {
  if (!currentCampaign) return;

  const btn = document.getElementById('unlockProceedBtn');
  if (btn) btn.disabled = true;

  showToast('Unlocking destination link...');

  let destinationUrl = currentCampaign.destinationUrl;

  // Fetch verified destination URL from server
  try {
    const res = await fetch(`/api/campaigns/${currentCampaign.id}/unlock`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.destinationUrl) {
        destinationUrl = data.destinationUrl;
      }
    }
  } catch (err) {
    console.warn('Unlock API error, using available destination:', err);
  }

  if (!destinationUrl) {
    showToast('Error retrieving destination. Please contact campaign creator.');
    if (btn) btn.disabled = false;
    return;
  }

  // Display revealed destination card
  const revealedBox = document.getElementById('destinationRevealedBox');
  const revealedInput = document.getElementById('revealedDestinationUrl');
  const revealedBtn = document.getElementById('revealedDestinationBtn');

  if (revealedBox && revealedInput && revealedBtn) {
    revealedInput.value = destinationUrl;
    revealedBtn.href = destinationUrl;
    revealedBox.style.display = 'block';
    revealedBox.scrollIntoView({ behavior: 'smooth' });
  }

  showToast('Destination unlocked! Redirecting in 1.5 seconds...');

  setTimeout(() => {
    window.location.href = destinationUrl;
  }, 1500);
}

function showErrorState(msg) {
  const container = document.getElementById('unlockTasksList');
  if (container) {
    container.innerHTML = `
      <div style="background: #FEF2F2; border: 1.5px solid #F87171; border-radius: 12px; padding: 20px; text-align: center; color: #991B1B;">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Link Not Found</h3>
        <p style="font-size: 13px;">${escapeHtml(msg)}</p>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
