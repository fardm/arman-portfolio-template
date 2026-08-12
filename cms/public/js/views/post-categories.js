import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { loadAll } from '../core/data.js';
import { val, showMsg } from '../utils/helpers.js';

export function renderPostCategories() {
  dom.content.innerHTML = `
    <div style="margin-bottom:24px">
        <h2 style="margin-bottom:4px">دسته پست‌ها</h2>
      <p class="sub" style="margin-bottom:0">مدیریت ساختار درختی دسته‌بندی پست‌ها. برای ویرایش یا حذف دسته‌ها روی آن کلیک کنید.</p>
      </div>
    <button class="btn" style="margin-bottom:24px" onclick="openPostCatModal()">+ ایجاد دسته پست جدید</button>
    <div id="cat-list" style="max-width: 600px;"></div>`;
  renderCatList();
}

function renderCatNode(c, i, depth = 0, isLast = false) {
  const children = state.postCategories.filter(child => child.parent === c.slug);
  const indent = depth * 28;

  const connector = depth > 0 ? `
    <div style="
      position:absolute;
      right:${indent - 20}px;
      top:50%;
      width:16px;
      height:0;
      border-top:1px solid var(--border);
    "></div>` : '';

  let html = `
    <div style="position:relative; margin-bottom:6px;">
      ${connector}
      <div
        style="
          margin-right:${indent}px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:7px 12px;
          border-radius:8px;
          border:1px solid var(--border);
          background:var(--card);
          cursor:pointer;
          transition:border-color .15s, background .15s;
          min-width:160px;
        "
        onmouseenter="this.style.borderColor='var(--primary)'; this.style.background='var(--card-hover)'"
        onmouseleave="this.style.borderColor='var(--border)'; this.style.background='var(--card)'"
        onclick="openPostCatModal(${i})"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>
        <span style="color:var(--foreground); font-size:.9rem">${c.name || '(بدون نام)'}</span>
      </div>
    </div>`;

  if (children.length > 0) {
    const railRight = indent + 8;
    html += `<div style="position:relative; margin-bottom:2px;">
      <div style="
        position:absolute;
        right:${railRight}px;
        top:0;
        bottom:6px;
        width:0;
        border-right:1px solid var(--border);
      "></div>`;
    children.forEach((child, ci) => {
      const childIndex = state.postCategories.findIndex(cat => cat.slug === child.slug);
      html += renderCatNode(child, childIndex, depth + 1, ci === children.length - 1);
    });
    html += `</div>`;
  }

  return html;
}

export function renderCatList() {
  const list = document.getElementById('cat-list');
  if (!list) return;
  list.innerHTML = '';

  const rootCats = state.postCategories.filter(c => !c.parent);
  if (rootCats.length === 0) {
    list.innerHTML = '<p class="sub">هنوز دسته‌ای ایجاد نشده است.</p>';
    return;
  }

  let html = '<div style="padding-top:4px;">';
  rootCats.forEach((c, ri) => {
    const i = state.postCategories.findIndex(cat => cat.slug === c.slug);
    html += renderCatNode(c, i, 0, ri === rootCats.length - 1);
  });
  html += '</div>';
  list.innerHTML = html;
}

export function openPostCatModal(index = -1) {
  const isEdit = index > -1;
  const c = isEdit ? state.postCategories[index] : { name: '', slug: '', parent: '' };
  const m = document.createElement('div');
  m.className = 'modal-overlay';

  let parentOptions = '<option value="">(بدون والد - ریشه)</option>';
  state.postCategories.forEach(cat => {
    if (isEdit && cat.slug === c.slug) return;
    parentOptions += `<option value="${cat.slug}" ${c.parent === cat.slug ? 'selected' : ''}>${cat.name}</option>`;
  });

  const delBtnHtml = isEdit ? `<button class="btn danger" style="margin-right:auto;" onclick="deletePostCat(${index}); this.parentElement.parentElement.parentElement.remove()">حذف</button>` : '';

  m.innerHTML = `
    <div class="modal-content" style="max-width:400px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
        <h3 style="margin:0">${isEdit ? 'ویرایش دسته پست' : 'ایجاد دسته پست جدید'}</h3>
        <button class="modal-close" style="color:var(--foreground); margin:0" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>

      <div style="margin-bottom:16px">
        <label style="margin-top:0">نام دسته پست</label>
        <input type="text" id="cat-name" value="${c.name}" ${!isEdit ? 'onkeyup="document.getElementById(\'cat-slug\').value=this.value.toLowerCase().replace(/\\s+/g,\'-\')" ' : ''}>
      </div>
      <div style="margin-bottom:16px">
        <label style="margin-top:0">شناسه (URL Slug)</label>
        <input type="text" id="cat-slug" value="${c.slug}" dir="ltr">
        <input type="hidden" id="cat-original-slug" value="${c.slug}">
      </div>
      <div style="margin-bottom:24px">
        <label style="margin-top:0">دسته پست والد</label>
        <select id="cat-parent">${parentOptions}</select>
      </div>

      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn" onclick="savePostCat(${index}, this.parentElement.parentElement.parentElement)">ذخیره دسته پست</button>
        ${delBtnHtml}
      </div>
    </div>
  `;
  document.body.appendChild(m);
}

export async function savePostCat(index, modalNode) {
  const name = val('cat-name'), slug = val('cat-slug'), parent = val('cat-parent');
  const originalSlug = val('cat-original-slug');
  if (!name || !slug) return showMsg('نام و شناسه الزامی است', true);

  if (index === -1) {
    if (state.postCategories.find(c => c.slug === slug)) return showMsg('این شناسه قبلاً استفاده شده است', true);
    state.postCategories.push({ name, slug, parent });
  } else {
    state.postCategories[index] = { name, slug, parent, originalSlug };
  }

  try {
    await api('/api/post_categories', { method: 'POST', body: JSON.stringify(state.postCategories), headers: { 'Content-Type': 'application/json' } });
    await loadAll();
    modalNode.remove();
    showMsg('دسته پست با موفقیت ذخیره شد');
    renderPostCategories();
  } catch(e) {
    showMsg('خطا در ذخیره دسته پست', true);
  }
}

export async function deletePostCat(i) {
  if(confirm('حذف شود؟ با حذف این دسته پست، تمامی زیردسته پست‌های آن نیز حذف خواهند شد.')) {
    const deletedSlug = state.postCategories[i].slug;

    let toDelete = new Set([deletedSlug]);
    let added = true;
    while(added) {
      added = false;
      state.postCategories.forEach(c => {
        if(toDelete.has(c.parent) && !toDelete.has(c.slug)) {
          toDelete.add(c.slug);
          added = true;
        }
      });
    }

    const newCategories = state.postCategories.filter(c => !toDelete.has(c.slug));

    for (const post of state.posts) {
      if (post.categories && post.categories.some(c => toDelete.has(c))) {
        post.categories = post.categories.filter(c => !toDelete.has(c));
        await api('/api/posts', { method: 'POST', body: JSON.stringify(post), headers: { 'Content-Type': 'application/json' } });
      }
    }

    state.postCategories.length = 0;
    state.postCategories.push(...newCategories);

    renderCatList();
    savePostCategories();
  }
}
export async function savePostCategories() { await api('/api/post_categories', { method: 'POST', body: JSON.stringify(state.postCategories), headers: { 'Content-Type': 'application/json' } }); }
