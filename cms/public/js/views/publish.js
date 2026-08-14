import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { icon } from '../icons.js';

// تابع کمکی برای اعمال ابعاد ۱۶ در ۱۶ و تراز مناسب
function getIcon(name) {
  const svg = icon(name);
  if (!svg) return '';
  return svg.replace(
    '<svg',
    '<svg style="width:18px; height:18px; min-width:18px; min-height:18px; vertical-align:middle; display:inline-block;"'
  );
}

function parseGitChanges(changesText) {
  const lines = (changesText || '').split('\n').filter((l) => l.trim());
  let modified = 0;
  let added = 0;
  let deleted = 0;

  for (const line of lines) {
    if (line.startsWith('??')) {
      added++;
      continue;
    }

    const codes = line.slice(0, 2);
    if (codes.includes('D')) deleted++;
    else if (codes.includes('A') || codes.includes('?')) added++;
    else if (codes.includes('M') || codes.includes('R') || codes.includes('C')) modified++;
  }

  return { modified, added, deleted, lines };
}

function renderChangesSummary({ modified, added, deleted }) {
  const rows = [];
  if (modified > 0) rows.push(`${modified} فایل تغییر یافته`);
  if (added > 0) rows.push(`${added} فایل اضافه شده`);
  if (deleted > 0) rows.push(`${deleted} فایل حذف شده`);

  if (rows.length === 0) {
    return `<div style="color:#9ba6b5">تغییری ایجاد نشده</div>`;
  }

  return `
    <div class="msg ok" style="margin-bottom:12px">
      ${rows.map((row) => `<div>${row}</div>`).join('')}
    </div>
  `;
}

export async function renderPublish(resultHtml = '') {
  dom.content.innerHTML = `
    <h2>انتشار در گیت‌هاب</h2>
    <p class="sub">وضعیت تغییرات را ببینید و در صورت نیاز منتشر کنید.</p>
    <div style="display:grid; grid-template-columns: 1fr 320px; gap: 24px; align-items:start">
      <div>
        <div class="card" style="margin-bottom: 24px">
          <h3 style="margin-bottom:12px">تنظیمات آدرس سایت</h3>

          <div class="form-group">
            <select class="input" id="urlTypeSelect" style="width:100%" onchange="updateUrlConfig()">
              <option value="github" ${state.site.urlType !== 'custom' ? 'selected' : ''}>آدرس پیش‌فرض گیت‌هاب</option>
              <option value="custom" ${state.site.urlType === 'custom' ? 'selected' : ''}>دامنه اختصاصی</option>
            </select>
          </div>

          <div id="github-url-preview" style="margin-top: 8px; font-size: 0.85rem; color: var(--muted); direction: ltr; text-align: right; ${state.site.urlType !== 'custom' ? 'display:block' : 'display:none'}"></div>

          <div id="custom-domain-container" style="margin-top: 8px; ${state.site.urlType === 'custom' ? 'display:block' : 'display:none'}">
            <input type="text" id="custom-domain-input" class="input" style="width:100%" placeholder="https://example.com" value="${state.site.customDomain || ''}" dir="ltr" onchange="state.site.customDomain = this.value.replace(/^https?:\/\//i, '').split('/')[0]; saveUrlConfig()">
          </div>
        </div>

        <div class="row" style="margin-bottom:16px; display:flex; gap:8px;">
          <button class="btn" id="publish-btn" onclick="startPublish()" disabled style="display:inline-flex; align-items:center; gap:6px;">
            ${getIcon('cloud_upload')} انتشار
          </button>
          <button class="btn sec" id="local-test-btn" onclick="startLocalTest()" style="display:inline-flex; align-items:center; gap:6px;">
            ${getIcon('laptop_check')} تست محلی
          </button>
        </div>
        <div id="publish-report" style="margin-top:24px">${resultHtml}</div>
      </div>

      <aside>
        <div class="card" style="position:sticky; top:24px; display:flex; flex-direction:column;">
          <h3 style="margin-bottom:16px; font-size:1rem">وضعیت فایل ها</h3>
          <div id="publish-changes" style="flex:1"></div>
          <button class="btn sec" style="width:100%; justify-content:center; margin-top:16px; display:flex; align-items:center; gap:6px;" onclick="renderPublish()">
            ${getIcon('update')} بررسی دوباره
          </button>
        </div>
      </aside>
    </div>`;

  try {
    const status = await api('/api/git/status');
    const metaEl = document.getElementById('publish-meta-inner');
    const changesEl = document.getElementById('publish-changes');
    const btn = document.getElementById('publish-btn');
    if (!changesEl || !btn) return;

    if (metaEl) {
      metaEl.innerHTML = `
        <strong>شاخه:</strong> ${status.branch || '—'} &nbsp;|&nbsp; 
        <strong>ریموت:</strong> ${status.remote || 'تنظیم نشده'}
      `;
    }

    const githubPreviewEl = document.getElementById('github-url-preview');
    if (githubPreviewEl && status.remote) {
      const match = status.remote.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
      if (match) {
        const [, username, repo] = match;
        let siteUrl = 'https://' + username + '.github.io/' + repo + '/';
        if (repo === username + '.github.io') {
          siteUrl = 'https://' + username + '.github.io/';
        }
        githubPreviewEl.innerText = siteUrl;
      } else {
        githubPreviewEl.innerText = 'آدرس گیت‌هاب پیجز قابل تشخیص نیست.';
      }
    }

    let html = renderChangesSummary(parseGitChanges(status.changes));
    if (status.hasChanges) {
      html += `<pre style="background:var(--background);padding:12px;border-radius:8px;overflow:auto;max-height:220px;font-size:.8rem;margin:0">${status.changes || ''}</pre>`;
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    changesEl.innerHTML = html;
  } catch (_) {
    const metaEl = document.getElementById('publish-meta-inner');
    if (metaEl) metaEl.innerHTML = `<div class="msg err">خطا در دریافت وضعیت گیت</div>`;
  }
}

export async function updateUrlConfig() {
  const type = document.getElementById('urlTypeSelect').value;
  state.site.urlType = type;
  document.getElementById('custom-domain-container').style.display = type === 'custom' ? 'block' : 'none';
  const githubPreview = document.getElementById('github-url-preview');
  if (githubPreview) githubPreview.style.display = type !== 'custom' ? 'block' : 'none';
  await saveUrlConfig();
}

export async function saveUrlConfig() {
  try {
    await api('/api/site', {
      method: 'POST',
      body: JSON.stringify(state.site),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Failed to save URL config', err);
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
    html += `<h3 style="margin-bottom:8px">نتیجه انتشار</h3>`;
    html += `<div id="publish-meta-inner" style="margin-bottom:12px; font-size: 0.85rem; color: var(--muted);"></div>`;
    html += `<div class="msg ${r.ok ? 'ok' : 'err'}" style="margin-bottom:16px">انتشار ${r.ok ? 'موفق' : 'ناموفق'}${r.message ? ` — ${r.message}` : ''}</div>`;
    if (r.steps) {
      html += r.steps.map((s) => `<div style="margin-bottom:8px">✓ ${s.step} — ${s.ok ? 'موفق' : 'ناموفق'}${s.message ? ` (${s.message})` : ''}</div>`).join('');

      let logs = r.steps.map((s) => `### ${s.step}\n${s.output || '—'}`).join('\n\n');
      html += `<details style="margin-top:16px"><summary style="cursor:pointer; color:#9ba6b5">مشاهده جزئیات لاگ‌ها</summary><pre style="background:var(--background);padding:12px;border-radius:8px;overflow:auto;max-height:300px;font-size:.8rem;margin-top:8px;direction:ltr;text-align:left">${logs}</pre></details>`;
    }
    html += `</div>`;
  }

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
    html += `<div style="margin-bottom:8px">✓ Run tests</div>`;

    if (r.output) {
       html += `<details style="margin-top:16px"><summary style="cursor:pointer; color:#9ba6b5">مشاهده جزئیات لاگ‌ها</summary><pre style="background:var(--background);padding:12px;border-radius:8px;overflow:auto;max-height:300px;font-size:.8rem;margin-top:8px;direction:ltr;text-align:left">${r.output}</pre></details>`;
    }
    html += `</div>`;

    if (reportEl) reportEl.innerHTML = html;
    if (btn) btn.disabled = wasPublishDisabled;
    if (testBtn) testBtn.disabled = false;
  } catch (err) {
    if (reportEl) reportEl.innerHTML = `<div class="card"><div class="msg err">خطا در اجرای تست محلی</div></div>`;
    if (btn) btn.disabled = wasPublishDisabled;
    if (testBtn) testBtn.disabled = false;
  }
}