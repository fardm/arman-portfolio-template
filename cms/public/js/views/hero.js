import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { loadAll } from '../core/data.js';
import { show } from '../core/router.js';
import { val } from '../utils/helpers.js';


export function renderHero() {
  if (!state.site.homeLayout || !state.site.homeLayout.length) {
    state.site.homeLayout = [
      { id: 'hero' },
      { id: 'projects', display: true, maxItems: 6, grid: 3 },
      { id: 'posts', display: true, maxItems: 6, grid: 3 }
    ];
  }

  const h = state.site.hero || {};

  dom.content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">صفحه اصلی (Hero)</h2>
        <p class="sub" style="margin-bottom:0">اطلاعات نمایش داده‌شده در بخش اول صفحه اصلی.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 320px; gap:24px;">
      <div>
        <div class="card" style="padding:24px">
          <div class="grid2">
            <div><label>اسم</label><input id="h-name" value="${h.name || state.site.name || ''}"></div>
            <div><label>عنوان شغلی</label><input id="h-jobTitle" value="${h.jobTitle || state.site.title || ''}"></div>
          </div>
          <label>متن درباره من</label><textarea id="h-about" style="min-height:120px">${h.about || state.site.bio || ''}</textarea>
          <label>تصویر پروفایل</label>
          <div class="row">
            <input id="h-profileImage" value="${h.profileImage || state.site.profileImage || ''}" style="flex:1">
            <button class="btn sec" onclick="openMediaModal((path) => { document.getElementById('h-profileImage').value = path; document.getElementById('h-image-preview').innerHTML = '<img src=&quot;' + path + '&quot; class=&quot;preview&quot;>'; })">انتخاب از رسانه</button>
          </div>
          <div id="h-image-preview" style="margin-top:8px">${(h.profileImage || state.site.profileImage) ? `<img src="${h.profileImage || state.site.profileImage}" class="preview">` : ''}</div>

          <hr>
          <h3 style="margin-bottom:12px">شبکه‌های اجتماعی</h3>
          <div class="grid2">
            <div><label>GitHub</label><input id="h-github" value="${h.github ?? ''}" placeholder="https://github.com/username"></div>
            <div><label>LinkedIn</label><input id="h-linkedin" value="${h.linkedin ?? ''}" placeholder="https://linkedin.com/in/username"></div>
            <div><label>Instagram</label><input id="h-instagram" value="${h.instagram ?? ''}" placeholder="https://instagram.com/username"></div>
            <div><label>Telegram</label><input id="h-telegram" value="${h.telegram ?? ''}" placeholder="https://t.me/username"></div>
            <div><label>YouTube</label><input id="h-youtube" value="${h.youtube ?? ''}" placeholder="https://youtube.com/@username"></div>
            <div><label>Twitter (X)</label><input id="h-twitter" value="${h.twitter ?? ''}" placeholder="https://twitter.com/username"></div>

          <hr>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
            <h3 style="margin:0">ترتیب و تنظیمات صفحه اصلی</h3>
          </div>
          <div id="h-layout-list" style="display:flex; flex-direction:column; gap:12px"></div>
</div>
        </div>
      </div>

      <aside>
        <div class="card" style="position:sticky; top:24px;">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <button class="btn" onclick="saveHero()" style="justify-content:center">ذخیره</button>
            <button class="btn sec" onclick="cancelHero()" style="justify-content:center">انصراف</button>
          </div>
        </div>
      </aside>
    </div>`;
  renderHomeLayout();
}

export async function cancelHero() {
  await loadAll();
  show('pages');
}

export async function saveHero() {
  state.site.hero = {
    name: val('h-name'),
    jobTitle: val('h-jobTitle'),
    about: val('h-about'),
    profileImage: val('h-profileImage'),
    github: val('h-github'),
    linkedin: val('h-linkedin'),
    instagram: val('h-instagram'),
    telegram: val('h-telegram'),
    youtube: val('h-youtube'),
    twitter: val('h-twitter')
  };

  // Sync inputs before saving homeLayout
  state.site.homeLayout.forEach((item, i) => {
    if (item.id === 'hero') return;
    const displayEl = document.getElementById('h-layout-' + item.id + '-display');
    if (displayEl) item.display = displayEl.checked;
  });
  await api('/api/site', { method: 'POST', body: JSON.stringify(state.site), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

  const btn = document.querySelector('button[onclick="saveHero()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}

export function renderHomeLayout() {
  const container = document.getElementById('h-layout-list');
  if (!container) return;

  const names = { hero: 'بخش Hero (غیرقابل جابجایی)', projects: 'پروژه‌ها', posts: 'پست‌ها' };

  container.innerHTML = state.site.homeLayout.map((item, i) => {
    if (item.id === 'hero') {
      return `
        <div class="card" style="padding:16px; margin:0; display:flex; gap:16px; align-items:center; opacity:0.8">
          <div style="flex:1">
            <strong>${names[item.id]}</strong>
          </div>
        </div>
      `;
    }

    return `
    <div class="card" draggable="true" data-index="${i}" style="padding:16px; margin:0; display:flex; gap:16px; align-items:center; cursor:grab;" ondragstart="handleDragStartHome(event, ${i})" ondragover="handleDragOverHome(event)" ondrop="handleDropHome(event, ${i})" ondragend="handleDragEndHome(event)">
      <div style="color:var(--muted); cursor:grab; padding:8px" title="جابجایی">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
      </div>
      <div style="flex:1; display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; align-items:center;">
        <div>
          <strong>${names[item.id]}</strong>
        </div>
        <div style="display:flex; align-items:center; gap:8px">
          <input type="checkbox" id="h-layout-${item.id}-display" ${item.display ? 'checked' : ''} onchange="state.site.homeLayout[${i}].display=this.checked">
          <label style="margin:0" for="h-layout-${item.id}-display">نمایش</label>
        </div>
        <div>
          <label style="margin:0; font-size:0.8rem">حداکثر آیتم</label>
          <input type="number" value="${item.maxItems || 6}" onchange="state.site.homeLayout[${i}].maxItems=parseInt(this.value)">
        </div>
        <div>
          <label style="margin:0; font-size:0.8rem">ستون‌ها (۲، ۳، ۴)</label>
          <input type="number" min="2" max="4" value="${item.grid || 3}" onchange="let v=parseInt(this.value); if(v>=2 && v<=4) state.site.homeLayout[${i}].grid=v; else this.value=state.site.homeLayout[${i}].grid;">
        </div>
      </div>
    </div>
  `}).join('');
}

export function handleDragStartHome(e, index) {
  state.draggedHomeIndex = index;
  e.target.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

export function handleDragOverHome(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function handleDropHome(e, dropIndex) {
  e.preventDefault();
  if (state.draggedHomeIndex === null || state.draggedHomeIndex === dropIndex) return;
  if (dropIndex === 0) return; // Cannot replace hero

  const temp = state.site.homeLayout[state.draggedHomeIndex];
  state.site.homeLayout.splice(state.draggedHomeIndex, 1);
  state.site.homeLayout.splice(dropIndex, 0, temp);

  renderHomeLayout();
}

export function handleDragEndHome(e) {
  e.target.style.opacity = '1';
  state.draggedHomeIndex = null;
}
