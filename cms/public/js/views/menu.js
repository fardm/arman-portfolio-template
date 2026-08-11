import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { loadAll } from '../core/data.js';
import { showMsg } from '../utils/helpers.js';

export function renderMenu() {
  dom.content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">منوی سایت</h2>
        <p class="sub" style="margin-bottom:0">لینک‌های نمایش داده شده در Header سایت را مدیریت کنید.</p>
      </div>
    </div>

    <div style="max-width:800px">
      <div style="margin-bottom:24px">
        <button class="btn" onclick="addMenuItem()">+ افزودن لینک جدید</button>
      </div>
      <div id="menu-list" style="display:flex; flex-direction:column; gap:12px;"></div>
    </div>
  `;
  renderMenuList();
}

export function renderMenuList() {
  const container = document.getElementById('menu-list');
  if (!state.siteMenu || !state.siteMenu.length) {
    state.siteMenu = [
      { label: 'خانه', href: '/' },
      { label: 'پروژه‌ها', href: '/projects' },
      { label: 'رزومه', href: '/resume' }
    ];
    saveMenuAuto(); // Auto save default menu
    return;
  }
  if (!state.siteMenu.length) {
    container.innerHTML = '<p style="color:#9ba6b5">منوی سایت خالی است.</p>';
    return;
  }

  container.innerHTML = state.siteMenu.map((m, i) => {
    const isSystemPage = m.href === '/' || m.href === '/projects' || m.href === '/resume';
    return `
    <div class="card menu-item-card" draggable="true" data-index="${i}" style="padding:16px; margin:0; display:flex; gap:16px; align-items:center; cursor:grab;" ondragstart="handleDragStartMenu(event, ${i})" ondragover="handleDragOverMenu(event)" ondrop="handleDropMenu(event, ${i})" ondragend="handleDragEndMenu(event)">
      <div style="color:var(--muted); cursor:grab; padding:8px" title="جابجایی">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
      </div>
      <div style="flex:1">
        <label style="margin-top:0">عنوان لینک</label>
        <input value="${m.label}" onchange="state.siteMenu[${i}].label=this.value; saveMenuAuto();" placeholder="مثال: درباره من" style="cursor:text;">
      </div>
      <div style="flex:2">
        <label style="margin-top:0">آدرس (URL)</label>
        <input value="${m.href}" onchange="state.siteMenu[${i}].href=this.value; saveMenuAuto();" dir="ltr" placeholder="مثال: /about" ${isSystemPage ? 'disabled' : ''} style="cursor:text;">
      </div>
      <div style="display:flex; gap:8px; align-items:flex-end; padding-top:24px">
        <button class="btn danger" style="padding:8px" onclick="deleteMenuItem(${i})" title="حذف" ${isSystemPage ? 'disabled' : ''}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      </div>
    </div>
  `}).join('');
}

export function handleDragStartMenu(e, index) {
  state.draggedMenuIndex = index;
  e.target.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

export function handleDragOverMenu(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function handleDropMenu(e, dropIndex) {
  e.preventDefault();
  if (state.draggedMenuIndex === null || state.draggedMenuIndex === dropIndex) return;

  const temp = state.siteMenu[state.draggedMenuIndex];
  state.siteMenu.splice(state.draggedMenuIndex, 1);
  state.siteMenu.splice(dropIndex, 0, temp);

  renderMenuList();
  saveMenuAuto();
}

export function handleDragEndMenu(e) {
  e.target.style.opacity = '1';
  state.draggedMenuIndex = null;
}

export function addMenuItem() {
  state.siteMenu.push({ label: 'لینک جدید', href: '/new-link-' + Date.now() });
  renderMenuList();
  saveMenuAuto();
}

export function deleteMenuItem(i) {
  state.siteMenu.splice(i, 1);
  renderMenuList();
  saveMenuAuto();
}

export async function saveMenuAuto() {
  try {
    await api('/api/menu', { method: 'POST', body: JSON.stringify(state.siteMenu), headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    showMsg('خطا در ذخیره خودکار منو', true);
  }
}

export async function saveMenu() {
  await api('/api/menu', { method: 'POST', body: JSON.stringify(state.siteMenu), headers: { 'Content-Type': 'application/json' } });
  await loadAll();
  const btn = document.querySelector('button[onclick="saveMenu()"]');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2000);
  }
}
