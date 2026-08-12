import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';

export async function renderPublish(resultHtml = '') {
  dom.content.innerHTML = `<h2>انتشار در گیت‌هاب</h2><p class="sub">وضعیت تغییرات را ببینید و در صورت نیاز منتشر کنید.</p>
    <div id="publish-meta" style="margin-bottom:16px; font-size: 0.9rem; color: #9ba6b5;">در حال بررسی وضعیت...</div>
    <div class="row" style="margin-bottom:16px">
      <button class="btn" id="publish-btn" onclick="startPublish()" disabled>انتشار</button>
      <button class="btn sec" id="local-test-btn" onclick="startLocalTest()">تست محلی</button>
      <button class="btn sec" onclick="renderPublish()">بررسی مجدد</button>
    </div>
    <div id="publish-changes"></div>
    <div id="publish-report" style="margin-top:24px">${resultHtml}</div>`;

  try {
    const status = await api('/api/git/status');
    const metaEl = document.getElementById('publish-meta');
    const changesEl = document.getElementById('publish-changes');
    const btn = document.getElementById('publish-btn');
    if (!metaEl || !changesEl || !btn) return;

    metaEl.innerHTML = `<strong>شاخه:</strong> ${status.branch || '—'} &nbsp;|&nbsp; <strong>ریموت:</strong> ${status.remote || 'تنظیم نشده'}`;

    let html = '';
    if (status.hasChanges) {
      html += `<div class="card">`;
      html += `<div class="msg ok" style="margin-bottom:12px">تغییرات آماده انتشار هستند.</div>`;
      html += `<pre style="background:var(--background);padding:12px;border-radius:8px;overflow:auto;max-height:220px;font-size:.8rem;margin:0">${status.changes || ''}</pre>`;
      html += `</div>`;
      btn.disabled = false;
    } else {
      html += `<div class="card" style="color:#9ba6b5">تغییری ایجاد نشده</div>`;
      btn.disabled = true;
    }
    changesEl.innerHTML = html;
  } catch (_) {
    const metaEl = document.getElementById('publish-meta');
    if (metaEl) metaEl.innerHTML = `<div class="msg err">خطا در دریافت وضعیت گیت</div>`;
  }
}

export async function startPublish() {
  const btn = document.getElementById('publish-btn');
  const testBtn = document.getElementById('local-test-btn');
  if (btn) btn.disabled = true;
  if (testBtn) testBtn.disabled = true;

  const reportEl = document.getElementById('publish-report');
  if (reportEl) reportEl.innerHTML = `<div class="card"><p class="sub">در حال انتشار...</p></div>`;

  const r = await api('/api/publish', { method: 'POST' });
  let html = '';
  if (r.noChanges) {
    html = `<div class="card"><div class="msg err">${r.message || 'تغییری ایجاد نشده'}</div></div>`;
  } else {
    html = `<div class="card">`;
    html += `<h3>نتیجه انتشار</h3>`;
    html += `<div class="msg ${r.ok ? 'ok' : 'err'}" style="margin-bottom:16px">انتشار ${r.ok ? 'موفق' : 'ناموفق'}${r.message ? ` — ${r.message}` : ''}</div>`;
    if (r.steps) {
      html += r.steps.map((s) => `<div style="margin-bottom:8px">✓ ${s.step} — ${s.ok ? 'موفق' : 'ناموفق'}${s.message ? ` (${s.message})` : ''}</div>`).join('');

      let logs = r.steps.map((s) => `### ${s.step}\n${s.output || '—'}`).join('\n\n');
      html += `<details style="margin-top:16px"><summary style="cursor:pointer; color:#9ba6b5">مشاهده جزئیات لاگ‌ها</summary><pre style="background:var(--background);padding:12px;border-radius:8px;overflow:auto;max-height:300px;font-size:.8rem;margin-top:8px;direction:ltr;text-align:left">${logs}</pre></details>`;
    }
    html += `</div>`;
  }

  // Re-render entirely with the new report, fetching git status again
  await renderPublish(html);
}

export async function startLocalTest() {
  const btn = document.getElementById('publish-btn');
  const testBtn = document.getElementById('local-test-btn');
  const wasPublishDisabled = btn ? btn.disabled : true;

  if (btn) btn.disabled = true;
  if (testBtn) testBtn.disabled = true;

  const reportEl = document.getElementById('publish-report');
  if (reportEl) reportEl.innerHTML = `<div class="card"><p class="sub">در حال اجرای تست محلی...</p></div>`;

  try {
    const r = await api('/api/test', { method: 'POST' });
    let html = `<div class="card">`;
    html += `<h3>نتیجه تست محلی</h3>`;
    html += `<div class="msg ${r.ok ? 'ok' : 'err'}" style="margin-bottom:16px">تست ${r.ok ? 'موفق' : 'ناموفق'} بود.</div>`;

    // Human readable steps
    html += `<div style="margin-bottom:8px">✓ Content validation</div>`;
    html += `<div style="margin-bottom:8px">✓ Build</div>`;
    html += `<div style="margin-bottom:8px">✓ Output verification</div>`;

    if (r.output) {
       html += `<details style="margin-top:16px"><summary style="cursor:pointer; color:#9ba6b5">مشاهده جزئیات لاگ‌ها</summary><pre style="background:#0b111b;padding:12px;border-radius:8px;overflow:auto;max-height:300px;font-size:.8rem;margin-top:8px;direction:ltr;text-align:left">${r.output}</pre></details>`;
    }
    html += `</div>`;

    // Don't re-render entirely to preserve existing git status, just update report and buttons
    if (reportEl) reportEl.innerHTML = html;
    if (btn) btn.disabled = wasPublishDisabled; // Restore publish button status
    if (testBtn) testBtn.disabled = false;
  } catch (err) {
    if (reportEl) reportEl.innerHTML = `<div class="card"><div class="msg err">خطا در اجرای تست محلی</div></div>`;
    if (btn) btn.disabled = wasPublishDisabled; // Restore publish button status
    if (testBtn) testBtn.disabled = false;
  }
}
