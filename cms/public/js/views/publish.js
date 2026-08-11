import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';

export async function renderPublish(resultHtml = '') {
  dom.content.innerHTML = `<h2>انتشار در گیت‌هاب</h2><p class="sub">وضعیت تغییرات را ببینید و در صورت نیاز منتشر کنید.</p>
    <div class="card" id="publish-status"><p class="sub">در حال بررسی وضعیت...</p></div>
    <div class="row" style="margin-bottom:16px">
      <button class="btn" id="publish-btn" onclick="startPublish()" disabled>انتشار</button>
      <button class="btn sec" onclick="renderPublish()">بررسی مجدد</button>
    </div>
    <div id="publish-result">${resultHtml}</div>`;

  try {
    const status = await api('/api/git/status');
    const statusEl = document.getElementById('publish-status');
    const btn = document.getElementById('publish-btn');
    if (!statusEl || !btn) return;

    let html = `<p><strong>شاخه:</strong> ${status.branch || '—'}</p>`;
    html += `<p><strong>ریموت:</strong> ${status.remote || 'تنظیم نشده'}</p>`;
    if (status.hasChanges) {
      html += `<div class="msg ok" style="margin-top:12px">تغییرات آماده انتشار هستند.</div>`;
      html += `<pre style="background:#0b111b;padding:12px;border-radius:8px;overflow:auto;max-height:220px;font-size:.8rem;margin-top:8px">${status.changes || ''}</pre>`;
      btn.disabled = false;
    } else {
      html += `<div class="card" style="margin-top:12px;color:#9ba6b5">تغییری ایجاد نشده</div>`;
      btn.disabled = true;
    }
    statusEl.innerHTML = html;
  } catch (_) {
    const statusEl = document.getElementById('publish-status');
    if (statusEl) statusEl.innerHTML = `<div class="msg err">خطا در دریافت وضعیت گیت</div>`;
  }
}

export async function startPublish() {
  const btn = document.getElementById('publish-btn');
  if (btn) btn.disabled = true;
  const resultEl = document.getElementById('publish-result');
  if (resultEl) resultEl.innerHTML = `<div class="card"><p class="sub">در حال انتشار...</p></div>`;

  const r = await api('/api/publish', { method: 'POST' });
  let html = '';
  if (r.noChanges) {
    html = `<div class="msg err">${r.message || 'تغییری ایجاد نشده'}</div>`;
  } else {
    html = `<div class="msg ${r.ok ? 'ok' : 'err'}">انتشار ${r.ok ? 'موفق' : 'ناموفق'}${r.message ? ` — ${r.message}` : ''}</div>`;
    if (r.steps) {
      html += r.steps.map((s) => `<div class="card"><h3>${s.step} — ${s.ok ? 'موفق' : 'ناموفق'}${s.message ? ` (${s.message})` : ''}</h3><pre style="background:#0b111b;padding:12px;border-radius:8px;overflow:auto;max-height:200px;font-size:.8rem">${s.output || '—'}</pre></div>`).join('');
    }
  }
  await renderPublish(html);
}
