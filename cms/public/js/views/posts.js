import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { loadAll, loadMedia } from '../core/data.js';
import { show, render } from '../core/router.js';
import { val } from '../utils/helpers.js';

export function renderPosts() {
  dom.content.innerHTML = `
    <div style="margin-bottom:24px">
        <h2 style="margin-bottom:4px">پست‌ها</h2>
        <p class="sub" style="margin-bottom:0">مدیریت نمونه‌کارها و پست‌ها.</p>
      </div>
    <button class="btn" style="margin-bottom:24px" onclick="newPost()">+ ایجاد پست جدید</button>
    <div class="grid2">
      ${state.posts.map((p) => `
        <div class="card" style="display:flex; flex-direction:column; padding:0; overflow:hidden">
          <div style="height:140px; background:var(--card); position:relative">
             ${p.cover ? `<img src="${p.cover}" style="width:100%; height:100%; object-fit:cover">` : '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#9ba6b5">بدون تصویر</div>'}
             <span class="tag" style="position:absolute; top:8px; right:8px; background:rgba(23, 48, 59, 0.9)">${p.template === 'video' ? 'ویدیو' : 'تصویر'}</span>
          </div>
          <div style="padding:16px; flex:1; display:flex; flex-direction:column">
            <h3 style="margin-bottom:8px; font-size:1.1rem">${p.title || '(بدون عنوان)'}</h3>
            <p style="color:#9ba6b5; font-size:0.85rem; margin-bottom:16px; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">${p.description || 'بدون توضیح'}</p>
            <div class="row" style="margin-top:auto">
              <button class="btn sec" style="flex:1; justify-content:center" onclick="editPost('${p.slug}')">ویرایش</button>
              <button class="btn sec" style="padding:10px" onclick="duplicatePost('${p.slug}')" title="کپی"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
              <button class="btn danger" style="padding:10px" onclick="deletePost('${p.slug}')" title="حذف"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function newPost() { state.editingPost = { title: '', slug: '', description: '', content: '', cover: '', year: '', client: '', technologies: [], categories: [], images: [], template: 'image', videoUrl: '' }; show('post-edit', false); render(); }
export function editPost(slug) { state.editingPost = state.posts.find((p) => p.slug === slug); state.editingPost.originalSlug = slug; show('post-edit', false); render(); }
export async function duplicatePost(slug) { const p = state.posts.find((x) => x.slug === slug); const copy = { ...p, slug: p.slug + '-copy', title: p.title + ' (کپی)' }; await api('/api/posts', { method: 'POST', body: JSON.stringify(copy), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('posts'); }
export async function deletePost(slug) { if (!confirm('حذف شود؟')) return; await api('/api/posts', { method: 'DELETE', body: JSON.stringify({ slug }), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('posts'); }

export function renderPostEdit() {

  const p = state.editingPost;

  const selectedCats = state.postCategories.filter(c => p.categories.includes(c.slug));
  const unselectedCats = state.postCategories.filter(c => !p.categories.includes(c.slug));


  const imagesHtml = (p.template === 'image' && p.images && p.images.length) ? p.images.map((img, idx) => `
    <div style="display:flex; align-items:center; gap:8px; background:var(--card); padding:8px; border:1px solid var(--border); border-radius:8px; margin-bottom:8px;" draggable="true" ondragstart="event.dataTransfer.setData('text/plain', ${idx})" ondragover="event.preventDefault()" ondrop="event.preventDefault(); window.reorderPostImage(${idx}, event.dataTransfer.getData('text/plain'))">
      <div style="cursor:grab; opacity:0.5"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></div>
      <img src="${img}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
      <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; direction:ltr; text-align:left; font-size:0.8rem;">${img}</div>
      <button class="btn sec" style="padding:4px 8px; color:var(--error); border-color:var(--error);" onclick="window.removePostImage(${idx})"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
    </div>
  `).join('') : '';

  const catsHtml = `
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
      ${selectedCats.map(c => `<span class="tag">${c.name} <span style="cursor:pointer;color:#ef4444;margin-inline-start:4px" onclick="toggleCat('${c.slug}', false)">×</span></span>`).join('')}
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">
      ${unselectedCats.map(c => `<button class="btn sec" style="padding:4px 8px;font-size:0.8rem" onclick="toggleCat('${c.slug}', true)">+ ${c.name}</button>`).join('')}
    </div>
  `;

  // Table of Contents logic based on post content headings
  let tocHtml = '<p style="color:#9ba6b5;font-size:0.9rem">هیچ تیتری یافت نشد.</p>';
  if (p.content) {
    const headings = p.content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### '));
    if (headings.length > 0) {
      tocHtml = '<ul style="margin:0; padding-right:16px; font-size:0.9rem;">' + headings.map(h => {
        const isH3 = h.startsWith('### ');
        const text = isH3 ? h.slice(4) : h.slice(3);
        return `<li style="margin-bottom:4px; color:var(--muted); ${isH3 ? 'padding-right:12px;' : ''}">${text}</li>`;
      }).join('') + '</ul>';
    }
  }

  dom.content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <h2 style="margin:0">${p.originalSlug ? 'ویرایش پست' : 'پست جدید'}</h2>
      <button class="btn sec" onclick="show('posts')">بازگشت</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 320px; gap: 24px;">
      <div>
        <div class="card" style="margin-bottom:16px">
          <label style="margin-top:0">عنوان پست</label>
          <input id="f-title" value="${p.title || ''}" onchange="if(!document.getElementById('f-slug').value) { const s = this.value.trim().toLowerCase().replace(/\s+/g, '-'); document.getElementById('f-slug').value = s; state.editingPost.slug = s; }">
          <label style="margin-top:12px">نامک (Slug)</label>
          <input id="f-slug" value="${p.slug || ''}" style="direction:ltr; text-align:left">
          <label style="margin-top:12px">توضیحات کوتاه</label>
          <textarea id="f-description" style="min-height:80px">${p.description || ''}</textarea>
        </div>
        <div class="card">
          <label style="margin-top:12px">محتوای کامل (Markdown)</label>
          <textarea id="f-content" style="min-height:300px" oninput="window.updateToc()">${p.content || ''}</textarea>
        </div>
      </div>

      <aside>
        <div class="card" style="position:sticky; top:24px;">
          <div class="row" style="margin-bottom:16px">
            <button class="btn" onclick="savePost()" style="flex:1; justify-content:center">ذخیره</button>
            <button class="btn sec" onclick="show('posts')" style="flex:1; justify-content:center">انصراف</button>
          </div>

          <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #263243">
            <label style="margin-top:0">فهرست مطالب</label>
            <div id="post-toc" style="margin-top:8px">${tocHtml}</div>
          </div>

          <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #263243">
            <label style="margin-top:0">دسته‌ها</label>
            <div>${catsHtml}</div>
          </div>

          <div>
            <label style="margin-top:0">تصویر بند انگشتی</label>
            <div id="cover-preview" style="margin-bottom:8px">${p.cover ? `<img src="${p.cover}" class="preview" style="width:100%; max-width:100%; height:auto">` : ''}</div>
            <div class="row">
              <input id="f-cover" value="${p.cover || ''}" style="display:none">
              <button class="btn sec" style="width:100%; justify-content:center" onclick="openCoverPickerModal()">انتخاب تصویر</button>
            </div>
          </div>
        </div>
      </aside>
    </div>`;
}

export async function openCoverPickerModal() {
  await loadMedia();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'cover-modal';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };

  const gridHtml = state.media.length ? state.media.map((m) => `<div class="card" style="cursor:pointer; position:relative; padding:0; border: 2px solid transparent; border-radius:8px; overflow:hidden; aspect-ratio:1; display:flex; flex-direction:column;" onclick="selectCover('${m.path}')">
      <img src="${m.path}" style="width:100%; height:100%; object-fit:cover; margin:0; flex:1;">
      <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); padding:4px 8px; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; direction:ltr; text-align:left;">${m.name}</div>
    </div>`).join('') : '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>';

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="document.getElementById('cover-modal').remove()">بستن ×</button>
      <h3 style="margin-bottom:16px">انتخاب تصویر بند انگشتی</h3>
      <div class="row" style="margin-bottom:16px">
        <input type="file" id="modal-upload-file" accept="image/*" style="flex:1">
        <button class="btn" onclick="uploadCoverFromModal()">آپلود و انتخاب</button>
      </div>
      <div class="grid2" id="modal-media-grid" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));">
        ${gridHtml}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

export function selectCover(path) {
  const fCover = document.getElementById('f-cover');
  if(fCover) {
    fCover.value = path;
    state.editingPost.cover = path;
  }
  const preview = document.getElementById('cover-preview');
  if(preview) preview.innerHTML = `<img src="${path}" class="preview">`;

  const modal = document.getElementById('cover-modal');
  if (modal) modal.remove();
}

export async function uploadCoverFromModal() {
  const file = document.getElementById('modal-upload-file').files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadMedia();
  const gridHtml = state.media.length ? state.media.map((m) => `<div class="card" style="cursor:pointer; position:relative; padding:0; border: 2px solid transparent; border-radius:8px; overflow:hidden; aspect-ratio:1; display:flex; flex-direction:column;" onclick="selectCover('${m.path}')">
      <img src="${m.path}" style="width:100%; height:100%; object-fit:cover; margin:0; flex:1;">
      <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); padding:4px 8px; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; direction:ltr; text-align:left;">${m.name}</div>
    </div>`).join('') : '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>';
  const grid = document.getElementById('modal-media-grid');
  if (grid) grid.innerHTML = gridHtml;
  selectCover(`/media/${file.name}`);
}

export function syncEditingPost() {
  state.editingPost.title = val('f-title');
  state.editingPost.slug = val('f-slug');
  state.editingPost.description = val('f-description');
  state.editingPost.cover = val('f-cover');
  state.editingPost.content = val('f-content');
}

window.updateToc = function() {
  const content = document.getElementById('f-content').value;
  const headings = content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### '));
  let tocHtml = '<p style="color:#9ba6b5;font-size:0.9rem">هیچ تیتری یافت نشد.</p>';
  if (headings.length > 0) {
    tocHtml = '<ul style="margin:0; padding-right:16px; font-size:0.9rem;">' + headings.map(h => {
      const isH3 = h.startsWith('### ');
      const text = isH3 ? h.slice(4) : h.slice(3);
      return `<li style="margin-bottom:4px; color:var(--muted); ${isH3 ? 'padding-right:12px;' : ''}">${text}</li>`;
    }).join('') + '</ul>';
  }
  const tocEl = document.getElementById('post-toc');
  if (tocEl) tocEl.innerHTML = tocHtml;
};

export function toggleCat(slug, checked) {
  syncEditingPost();
  if (checked) state.editingPost.categories.push(slug);
  else state.editingPost.categories = state.editingPost.categories.filter((c) => c !== slug);
  renderPostEdit();
}

export async function savePost() {
  const data = {
    ...state.editingPost,
    title: val('f-title'), slug: val('f-slug'), description: val('f-description'), cover: val('f-cover'),
    content: val('f-content'), originalSlug: state.editingPost.originalSlug,
  };
  await api('/api/posts', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

  state.editingPost = state.posts.find(p => p.slug === data.slug) || data;
  state.editingPost.originalSlug = data.slug;
  renderPostEdit();

  const btn = document.querySelector('button[onclick="savePost()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}
