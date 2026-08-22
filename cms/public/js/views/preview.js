import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';

const PREVIEW_URL = 'http://localhost:3000';
const START_TIMEOUT_MS = 90000;
const POLL_INTERVAL_MS = 800;

const STEP_LABELS = {
  starting: 'شروع سرور پیش‌نمایش',
  waiting: 'در انتظار آماده شدن سرور',
  ready: 'پیش‌نمایش آماده',
};

// Session state for the preview flow
const flow = {
  running: false,
  startedByUs: false,
  polling: false,
  cancelRequested: false,
  pollTimer: null,
};

function spinnerHTML() {
  return `<span class="update-spinner"></span>`;
}

function checkHTML() {
  return `<span style="color: var(--primary); font-size: 1.2rem;">✓</span>`;
}

function errorHTML() {
  return `<span style="color: #ef4444; font-size: 1.2rem;">✗</span>`;
}

function pendingHTML() {
  return `<span style="color: var(--muted); opacity: 0.4;">○</span>`;
}

function renderStep(key, status, extra) {
  const label = STEP_LABELS[key] || key;
  let iconHtml = pendingHTML();
  if (status === 'running') iconHtml = spinnerHTML();
  else if (status === 'done') iconHtml = checkHTML();
  else if (status === 'error') iconHtml = errorHTML();

  return `
    <div class="update-step ${status}" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:8px; margin-bottom:4px; border:1px solid transparent; transition:all 0.3s; ${status === 'running' ? 'border-color: var(--primary); background: rgba(184,245,66,0.05);' : ''} ${status === 'error' ? 'border-color:#ef4444; background: rgba(239,68,68,0.08);' : ''}">
      <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${iconHtml}</div>
      <span class="update-step-label" style="flex:1; font-size:0.95rem;">${label}</span>
      ${extra && status === 'error' ? `<span style="font-size:0.8rem; color:#ef4444; max-width:40%; text-align:left;">${extra}</span>` : ''}
    </div>`;
}

function renderStepUI(stepKey, status, extra) {
  const panel = document.getElementById('preview-steps');
  if (!panel) return;
  const stepDivs = panel.querySelectorAll('.update-step');
  const keys = Object.keys(STEP_LABELS);
  const idx = keys.indexOf(stepKey);
  if (idx < 0 || idx >= stepDivs.length) return;
  const stepDiv = stepDivs[idx];
  stepDiv.outerHTML = renderStep(stepKey, status, extra);
}

function stopPolling() {
  flow.polling = false;
  if (flow.pollTimer) {
    clearTimeout(flow.pollTimer);
    flow.pollTimer = null;
  }
}

export function renderPreview() {
  // A fresh visit should never carry a stale cancel intent
  flow.running = false;
  flow.cancelRequested = false;
  stopPolling();

  dom.content.innerHTML = `
    <h2>پیش‌نمایش</h2>
    <p class="sub">برای دیدن سایت، سرور توسعه محلی Next.js را اجرا کنید.</p>

    <div class="card" id="preview-card" style="max-width:640px;">
      <p style="margin-bottom:16px; color: var(--muted);">
        با کلیک روی «ساخت پیش‌نمایش»، سرور توسعه محلی راه‌اندازی می‌شود و می‌توانید سایت را به‌صورت زنده ببینید. این عملیات چند ثانیه طول می‌کشد.
      </p>
      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn" id="preview-start-btn">ساخت پیش‌نمایش</button>
      </div>
    </div>
  `;

  const startBtn = document.getElementById('preview-start-btn');
  if (startBtn) startBtn.addEventListener('click', startPreview);

  // If a preview is already running, show it right away
  checkAlreadyRunning();
}

async function checkAlreadyRunning() {
  try {
    const res = await api('/api/preview/status');
    if (res && res.running) {
      renderReadyState();
    }
  } catch (_) {
    // Ignore — stay in initial state
  }
}

export async function startPreview() {
  if (flow.running) return;
  flow.running = true;
  flow.cancelRequested = false;

  const card = document.getElementById('preview-card');
  if (!card) return;

  card.innerHTML = `
    <h3 style="margin-bottom:16px;">راه‌اندازی پیش‌نمایش</h3>
    <div id="preview-steps">
      ${renderStep('starting', 'running')}
      ${renderStep('waiting', 'pending')}
      ${renderStep('ready', 'pending')}
    </div>
    <div id="preview-actions" style="margin-top:16px; display:flex; gap:12px; align-items:center;">
      <button class="btn sec" id="preview-cancel-btn">لغو</button>
    </div>
    <div id="preview-msg" style="margin-top:12px; font-size:0.85rem; color: var(--muted); min-height:20px;"></div>
  `;

  const cancelBtn = document.getElementById('preview-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', cancelPreview);

  try {
    const res = await api('/api/preview/start', { method: 'POST' });

    if (res && res.error) {
      throw new Error(res.error);
    }

    flow.startedByUs = !!(res && res.started);

    if (res && res.alreadyRunning) {
      // Server was already up — mark everything done
      renderStepUI('starting', 'done');
      renderStepUI('waiting', 'done');
      renderStepUI('ready', 'done');
      renderReadyState();
      return;
    }

    // We (re)started the process — step 1 complete, wait for the server
    renderStepUI('starting', 'done');
    renderStepUI('waiting', 'running');
    setMsg('در انتظار آماده شدن سرور پیش‌نمایش...');

    await waitForServer();
  } catch (err) {
    if (flow.cancelRequested) {
      resetToInitial();
      return;
    }
    renderStepUI('starting', 'error', '');
    renderStepUI('waiting', 'error', '');
    renderErrorState(err.message || String(err));
  }
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    flow.polling = true;

    const poll = async () => {
      if (flow.cancelRequested || !flow.polling) {
        return reject(new Error('cancelled'));
      }
      try {
        const res = await api('/api/preview/status');
        if (res && res.running) {
          stopPolling();
          renderStepUI('waiting', 'done');
          renderStepUI('ready', 'done');
          renderReadyState();
          return resolve();
        }
      } catch (_) {
        // keep polling
      }

      if (Date.now() - start > START_TIMEOUT_MS) {
        stopPolling();
        return reject(new Error('زمان انتظار برای راه‌اندازی سرور به پایان رسید.'));
      }

      flow.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
  });
}

export async function cancelPreview() {
  flow.cancelRequested = true;
  stopPolling();

  // Only terminate a process we started ourselves
  if (flow.startedByUs) {
    try {
      await api('/api/preview/stop', { method: 'POST' });
    } catch (_) {
      // ignore
    }
  }

  flow.startedByUs = false;
  flow.running = false;
  resetToInitial();
}

function setMsg(text) {
  const el = document.getElementById('preview-msg');
  if (el) el.textContent = text;
}

function renderReadyState() {
  flow.running = false;
  const card = document.getElementById('preview-card');
  if (!card) return;

  card.innerHTML = `
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <span style="color: var(--primary); font-size: 1.6rem; line-height:1.4;">✓</span>
      <div style="flex:1;">
        <h3 style="margin-bottom:6px; color: var(--primary);">پیش‌نمایش آماده است</h3>
        <a href="${PREVIEW_URL}" target="_blank" rel="noopener" style="display:inline-block; direction:ltr; color: var(--primary); font-size:1.05rem; text-decoration:underline; text-underline-offset:4px; word-break:break-all;">${PREVIEW_URL}</a>
        <div style="margin-top:16px; display:flex; gap:12px;">
          <button class="btn" onclick="openPreviewTab()">باز کردن پیش‌نمایش</button>
          <button class="btn sec" onclick="show('preview')">تازه‌سازی</button>
        </div>
      </div>
    </div>
  `;
}

function renderErrorState(message) {
  flow.running = false;
  const card = document.getElementById('preview-card');
  if (!card) return;

  card.innerHTML = `
    <div style="display:flex; align-items:flex-start; gap:14px;">
      <span style="color:#ef4444; font-size:1.6rem; line-height:1.4;">✗</span>
      <div style="flex:1;">
        <h3 style="margin-bottom:6px; color:#ef4444;">راه‌اندازی پیش‌نمایش ناموفق بود</h3>
        <p style="color: var(--muted); font-size:0.9rem; margin-bottom:16px;">${message || 'خطای ناشناخته رخ داد.'}</p>
        <div style="display:flex; gap:12px;">
          <button class="btn" id="preview-retry-btn">تلاش دوباره</button>
        </div>
      </div>
    </div>
  `;

  const retryBtn = document.getElementById('preview-retry-btn');
  if (retryBtn) retryBtn.addEventListener('click', startPreview);
}

function resetToInitial() {
  flow.running = false;
  renderPreview();
}

export function openPreviewTab() {
  window.open(PREVIEW_URL, '_blank', 'noopener');
}
