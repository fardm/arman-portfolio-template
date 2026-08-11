function addMenuItem() {
  siteMenu.push({ label: 'لینک جدید', href: '/new-link-' + Date.now() });
  renderMenuList();
  saveMenuAuto();
}

function deleteMenuItem(i) {
  siteMenu.splice(i, 1);
  renderMenuList();
  saveMenuAuto();
}
function hexToHsl(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

function generateThemeColors(baseColorHex) {
    const [h, s, l] = hexToHsl(baseColorHex);
    // Complementary hue: opposite side of the color wheel
    const hComp = (h + 180) % 360;
    // Near-achromatic saturation for neutral surfaces (background, muted, border, card)
    const bgS = Math.min(s, 5);
    // Moderate saturation for secondary (complementary) color
    const secS = Math.max(35, Math.min(s, 60));
    // Reduced saturation for light-mode primary (softer, less vivid)
    const lightPriS = Math.round(s * 0.65);
    return {
        baseColor: baseColorHex,
        light: {
            primary: hslToHex(h, lightPriS, Math.max(22, l - 12)),
            secondary: hslToHex(hComp, secS, 36),
            background: hslToHex(h, bgS, 97),
            foreground: hslToHex(h, bgS, 11),
            muted: hslToHex(h, bgS, 48),
            border: hslToHex(h, bgS, 85),
            card: hslToHex(h, bgS, 94),
            cardHover: hslToHex(h, bgS, 89)
        },
        dark: {
            // Dark primary: reduced saturation (×0.7) to avoid harshness
            primary: hslToHex(h, Math.round(s * 0.7), Math.min(70, l + 12)),
            // Dark secondary: slightly desaturated complementary
            secondary: hslToHex(hComp, Math.round(secS * 0.85), 60),
            // Charcoal gray background — near-zero hue influence
            background: hslToHex(h, bgS, 9),
            foreground: hslToHex(h, bgS, 94),
            // Muted: neutral mid-gray, clearly lighter than background
            muted: hslToHex(h, bgS, 54),
            // Border: neutral dark-gray
            border: hslToHex(h, bgS, 21),
            card: hslToHex(h, bgS, 12),
            cardHover: hslToHex(h, bgS, 17)
        }
    };
}

const api = (path, opts) => fetch(path, opts).then((r) => r.json());
let currentView = 'pages';
let projects = [];
let pagesList = [];
let siteMenu = [];
let editingPage = null;
let categories = [];
let site = {};
let resume = {};
let media = [];
let fonts = [];
let editingProject = null;
let publishStatus = '';

const content = document.getElementById('content');

const BUILTIN_FONTS = ['Vazirmatn', 'Tahoma', 'Vazirmatn-Variable', 'Arial', 'Georgia'];
const GOOGLE_FONT_SUGGESTIONS = ['Vazirmatn', 'Cairo', 'Tajawal', 'Almarai', 'Amiri', 'Reem Kufi', 'Noto Naskh Arabic', 'Noto Kufi Arabic', 'Markazi Text', 'Scheherazade New'];
const FONT_EXTENSIONS = ['.woff2', '.woff', '.ttf', '.otf'];

function parseFontConfig() {
  const font = site.font || 'Vazirmatn';
  if (typeof font === 'string' && font.startsWith('{')) {
    try { return JSON.parse(font); } catch { return { source: 'builtin', name: font }; }
  }
  return { source: 'builtin', name: font };
}

async function loadAll() {
  [site, categories, resume, projects, pagesList, siteMenu] = await Promise.all([
    api('/api/site'), api('/api/categories'), api('/api/resume'), api('/api/projects'), api('/api/pages').catch(()=>[]), api('/api/menu').catch(()=>[])
  ]);
  const hash = window.location.hash.slice(1);
  if (hash) {
    show(hash, false);
  } else {
    render();
  }
}

async function loadFonts() {
  fonts = await api('/api/fonts');
}

async function loadMedia() {
  media = await api('/api/media');
}

function toggleGroup(id) {
  const group = document.getElementById('group-' + id);
  if (group) group.classList.toggle('open');
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && hash !== currentView) {
    show(hash, false);
  }
});

function show(view, updateHash = true) {
  currentView = view;
  if (updateHash) {
    window.location.hash = view;
  }
  document.querySelectorAll('.nav-item, .nav-child').forEach((el) => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + view);
  if (navEl) navEl.classList.add('active');
  // اگر view مربوط به گروه تنظیمات باشد، گروه را باز نگه دار
  if (['settings', 'color-scheme', 'typography'].includes(view)) {
    const group = document.getElementById('group-settings');
    if (group && !group.classList.contains('open')) group.classList.add('open');
  }
  render();
}

function render() {
  if (currentView === 'dashboard') return renderDashboard();
  if (currentView === 'pages') return renderPages();
  if (currentView === 'menu') return renderMenu();
  if (currentView === 'page-edit') return renderPageEdit();
  if (currentView === 'projects') return renderProjects();
  if (currentView === 'categories') return renderCategories();
  if (currentView === 'resume') return renderResume();
  if (currentView === 'media') return renderMedia();
  if (currentView === 'settings') return renderSettings();
  if (currentView === 'theme' || currentView === 'color-scheme') return renderTheme();
    if (currentView === 'typography') return renderTypography();
  if (currentView === 'publish') return renderPublish();
  if (currentView === 'project-edit') return renderProjectEdit();
  if (currentView === 'hero') return renderHero();
}

function renderDashboard() {
  content.innerHTML = `<h2>داشبورد</h2><p class="sub">خلاصه‌ای از وضعیت محتوای شما.</p>
    <div class="grid2">
      <div class="card"><h3>${projects.length}</h3><p>پروژه‌ها</p></div>
      <div class="card"><h3>${categories.length}</h3><p>دسته‌ها</p></div>
    </div>
    `;
}

function renderProjects() {
  content.innerHTML = `
    <div style="margin-bottom:24px">
        <h2 style="margin-bottom:4px">پروژه‌ها</h2>
        <p class="sub" style="margin-bottom:0">مدیریت نمونه‌کارها و پروژه‌ها.</p>
      </div>
    <button class="btn" style="margin-bottom:24px" onclick="newProject()">+ ایجاد پروژه جدید</button>
    <div class="grid2">
      ${projects.map((p) => `
        <div class="card" style="display:flex; flex-direction:column; padding:0; overflow:hidden">
          <div style="height:140px; background:var(--card); position:relative">
             ${p.cover ? `<img src="${p.cover}" style="width:100%; height:100%; object-fit:cover">` : '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#9ba6b5">بدون تصویر</div>'}
             <span class="tag" style="position:absolute; top:8px; right:8px; background:rgba(23, 48, 59, 0.9)">${p.template === 'video' ? 'ویدیو' : 'تصویر'}</span>
          </div>
          <div style="padding:16px; flex:1; display:flex; flex-direction:column">
            <h3 style="margin-bottom:8px; font-size:1.1rem">${p.title || '(بدون عنوان)'}</h3>
            <p style="color:#9ba6b5; font-size:0.85rem; margin-bottom:16px; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden">${p.description || 'بدون توضیح'}</p>
            <div class="row" style="margin-top:auto">
              <button class="btn sec" style="flex:1; justify-content:center" onclick="editProject('${p.slug}')">ویرایش</button>
              <button class="btn sec" style="padding:10px" onclick="duplicateProject('${p.slug}')" title="کپی"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
              <button class="btn danger" style="padding:10px" onclick="deleteProject('${p.slug}')" title="حذف"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function newProject() { editingProject = { title: '', slug: '', description: '', content: '', cover: '', year: '', client: '', technologies: [], categories: [], template: 'image', videoUrl: '' }; currentView = 'project-edit'; render(); }
function editProject(slug) { editingProject = projects.find((p) => p.slug === slug); editingProject.originalSlug = slug; currentView = 'project-edit'; render(); }
async function duplicateProject(slug) { const p = projects.find((x) => x.slug === slug); const copy = { ...p, slug: p.slug + '-copy', title: p.title + ' (کپی)' }; await api('/api/projects', { method: 'POST', body: JSON.stringify(copy), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('projects'); }
async function deleteProject(slug) { if (!confirm('حذف شود؟')) return; await api('/api/projects', { method: 'DELETE', body: JSON.stringify({ slug }), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('projects'); }

function renderProjectEdit() {
  const p = editingProject;

  const selectedCats = categories.filter(c => p.categories.includes(c.slug));
  const unselectedCats = categories.filter(c => !p.categories.includes(c.slug));

  const catsHtml = `
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
      ${selectedCats.map(c => `<span class="tag">${c.name} <span style="cursor:pointer;color:#ef4444;margin-inline-start:4px" onclick="toggleCat('${c.slug}', false)">×</span></span>`).join('')}
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap">
      ${unselectedCats.map(c => `<button class="btn sec" style="padding:4px 8px;font-size:0.8rem" onclick="toggleCat('${c.slug}', true)">+ ${c.name}</button>`).join('')}
    </div>
  `;

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
      <h2>${p.slug ? 'ویرایش پروژه' : 'پروژه جدید'}</h2>
    </div>
    <div style="display:grid; grid-template-columns: 1fr 320px; gap: 24px;">
      <div>
        <div class="card">
          <div class="grid2">
            <div><label>عنوان</label><input id="f-title" value="${p.title || ''}"></div>
            <div><label>شناسه (slug)</label><input id="f-slug" value="${p.slug || ''}"></div>
          </div>
          <label>توضیح کوتاه</label><input id="f-description" value="${p.description || ''}">
          <div class="grid2" style="margin-top:12px">
            <div><label>سال</label><input id="f-year" value="${p.year || ''}"></div>
            <div><label>مشتری</label><input id="f-client" value="${p.client || ''}"></div>
          </div>

          <label style="margin-top:12px">محتوای کامل (Markdown)</label>
          <textarea id="f-content" style="min-height:300px">${p.content || ''}</textarea>
        </div>
      </div>

      <aside>
        <div class="card" style="position:sticky; top:24px;">
          <div class="row" style="margin-bottom:16px">
            <button class="btn" onclick="saveProject()" style="flex:1; justify-content:center">ذخیره</button>
            <button class="btn sec" onclick="show('projects')" style="flex:1; justify-content:center">انصراف</button>
          </div>

          <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #263243">
            <label style="margin-top:0">قالب پروژه</label>
            <select id="f-template" onchange="onTemplateChange(this.value)">
              <option value="image" ${p.template !== 'video' ? 'selected' : ''}>تصویری</option>
              <option value="video" ${p.template === 'video' ? 'selected' : ''}>ویدئویی</option>
            </select>
            ${p.template === 'video' ? `
              <label style="margin-top:12px">منبع ویدئو</label>
              <select id="f-videoSource" onchange="onVideoSourceChange(this.value)">
                <option value="host" ${p.videoSource === 'host' || !p.videoSource ? 'selected' : ''}>هاست شخصی (MP4)</option>
                <option value="youtube" ${p.videoSource === 'youtube' ? 'selected' : ''}>یوتیوب</option>
                <option value="aparat" ${p.videoSource === 'aparat' ? 'selected' : ''}>آپارات / iframe</option>
                <option value="embed" ${p.videoSource === 'embed' ? 'selected' : ''}>کد امبد (Embed)</option>
              </select>
              ${p.videoSource === 'embed' ?
                `<label style="margin-top:12px">کد امبد</label><textarea id="f-videoUrl" style="min-height:100px;font-family:monospace;direction:ltr;text-align:left" onchange="editingProject.videoUrl=this.value">${p.videoUrl || ''}</textarea>`
                :
                `<label style="margin-top:12px">لینک ویدئو</label><input id="f-videoUrl" style="direction:ltr;text-align:left" value="${p.videoUrl || ''}" onchange="editingProject.videoUrl=this.value">`
              }
            ` : ''}
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

async function openCoverPickerModal() {
  await loadMedia();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'cover-modal';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };

  const gridHtml = media.length ? media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectCover('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('') : '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>';

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="document.getElementById('cover-modal').remove()">بستن ×</button>
      <h3 style="margin-bottom:16px">انتخاب تصویر بند انگشتی</h3>
      <div class="row" style="margin-bottom:16px">
        <input type="file" id="modal-upload-file" accept="image/*" style="flex:1">
        <button class="btn" onclick="uploadCoverFromModal()">آپلود و انتخاب</button>
      </div>
      <div class="grid2" id="modal-media-grid">
        ${gridHtml}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function selectCover(path) {
  const fCover = document.getElementById('f-cover');
  if(fCover) {
    fCover.value = path;
    editingProject.cover = path;
  }
  const preview = document.getElementById('cover-preview');
  if(preview) preview.innerHTML = `<img src="${path}" class="preview">`;

  const modal = document.getElementById('cover-modal');
  if (modal) modal.remove();
}

async function uploadCoverFromModal() {
  const file = document.getElementById('modal-upload-file').files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadMedia();
  const gridHtml = media.length ? media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectCover('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('') : '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>';
  const grid = document.getElementById('modal-media-grid');
  if (grid) grid.innerHTML = gridHtml;
  selectCover(`/media/${file.name}`);
}

function syncEditingProject() {
  editingProject.title = val('f-title');
  editingProject.slug = val('f-slug');
  editingProject.description = val('f-description');
  editingProject.cover = val('f-cover');
  editingProject.year = val('f-year');
  editingProject.client = val('f-client');
  editingProject.content = val('f-content');
  const videoSourceEl = document.getElementById('f-videoSource');
  if (videoSourceEl) editingProject.videoSource = videoSourceEl.value;
  const videoUrlEl = document.getElementById('f-videoUrl');
  if (videoUrlEl) editingProject.videoUrl = videoUrlEl.value;
}

function toggleCat(slug, checked) {
  syncEditingProject();
  if (checked) editingProject.categories.push(slug);
  else editingProject.categories = editingProject.categories.filter((c) => c !== slug);
  renderProjectEdit();
}

function onTemplateChange(value) {
  syncEditingProject();
  editingProject.template = value;
  renderProjectEdit();
}

function onVideoSourceChange(value) {
  syncEditingProject();
  editingProject.videoSource = value;
  renderProjectEdit();
}

async function saveProject() {
  const videoSourceEl = document.getElementById('f-videoSource');
  const videoUrlEl = document.getElementById('f-videoUrl');
  const data = {
    ...editingProject,
    title: val('f-title'), slug: val('f-slug'), description: val('f-description'), cover: val('f-cover'),
    year: val('f-year'), client: val('f-client'),
    template: val('f-template'),
    videoSource: videoSourceEl ? videoSourceEl.value : (editingProject.videoSource || 'host'),
    videoUrl: videoUrlEl ? videoUrlEl.value : (editingProject.videoUrl || ''),
    content: val('f-content'), originalSlug: editingProject.originalSlug,
  };
  await api('/api/projects', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

  editingProject = projects.find(p => p.slug === data.slug) || data;
  editingProject.originalSlug = data.slug;
  renderProjectEdit();

  const btn = document.querySelector('button[onclick="saveProject()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}

function renderCategories() {
  content.innerHTML = `
    <div style="margin-bottom:24px">
        <h2 style="margin-bottom:4px">دسته‌ها</h2>
      <p class="sub" style="margin-bottom:0">مدیریت ساختار درختی دسته‌بندی‌ها. برای ویرایش یا حذف دسته ها روی آن کلیک کنید.</p>
      </div>
    <button class="btn" style="margin-bottom:24px" onclick="openCatModal()">+ ایجاد دسته جدید</button>
    <div id="cat-list" style="max-width: 600px;"></div>`;
  renderCatList();
}

function renderCatNode(c, i, depth = 0, isLast = false) {
  const children = categories.filter(child => child.parent === c.slug);
  const indent = depth * 28;

  // Connector lines: a horizontal stub coming off the vertical rail
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
        onclick="openCatModal(${i})"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>
        <span style="color:var(--foreground); font-size:.9rem">${c.name || '(بدون نام)'}</span>
      </div>
    </div>`;

  if (children.length > 0) {
    // Vertical rail running down beside the children
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
      const childIndex = categories.findIndex(cat => cat.slug === child.slug);
      html += renderCatNode(child, childIndex, depth + 1, ci === children.length - 1);
    });
    html += `</div>`;
  }

  return html;
}

function renderCatList() {
  const list = document.getElementById('cat-list');
  if (!list) return;
  list.innerHTML = '';

  const rootCats = categories.filter(c => !c.parent);
  if (rootCats.length === 0) {
    list.innerHTML = '<p class="sub">هنوز دسته‌ای ایجاد نشده است.</p>';
    return;
  }

  let html = '<div style="padding-top:4px;">';
  rootCats.forEach((c, ri) => {
    const i = categories.findIndex(cat => cat.slug === c.slug);
    html += renderCatNode(c, i, 0, ri === rootCats.length - 1);
  });
  html += '</div>';
  list.innerHTML = html;
}

function openCatModal(index = -1) {
  const isEdit = index > -1;
  const c = isEdit ? categories[index] : { name: '', slug: '', parent: '' };
  const m = document.createElement('div');
  m.className = 'modal-overlay';

  // Exclude current category and its children from parent options
  let parentOptions = '<option value="">(بدون والد - ریشه)</option>';
  categories.forEach(cat => {
    if (isEdit && cat.slug === c.slug) return;
    parentOptions += `<option value="${cat.slug}" ${c.parent === cat.slug ? 'selected' : ''}>${cat.name}</option>`;
  });

  const delBtnHtml = isEdit ? `<button class="btn danger" style="margin-right:auto;" onclick="deleteCat(${index}); this.parentElement.parentElement.parentElement.remove()">حذف</button>` : '';

  m.innerHTML = `
    <div class="modal-content" style="max-width:400px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
        <h3 style="margin:0">${isEdit ? 'ویرایش دسته' : 'ایجاد دسته جدید'}</h3>
        <button class="modal-close" style="color:var(--foreground); margin:0" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>

      <div style="margin-bottom:16px">
        <label style="margin-top:0">نام دسته</label>
        <input type="text" id="cat-name" value="${c.name}" ${!isEdit ? 'onkeyup="document.getElementById(\'cat-slug\').value=this.value.toLowerCase().replace(/\\s+/g,\'-\')"' : ''}>
      </div>
      <div style="margin-bottom:16px">
        <label style="margin-top:0">شناسه (URL Slug)</label>
        <input type="text" id="cat-slug" value="${c.slug}" dir="ltr">
        <input type="hidden" id="cat-original-slug" value="${c.slug}">
      </div>
      <div style="margin-bottom:24px">
        <label style="margin-top:0">دسته والد</label>
        <select id="cat-parent">${parentOptions}</select>
      </div>

      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn" onclick="saveCat(${index}, this.parentElement.parentElement.parentElement)">ذخیره دسته</button>
        ${delBtnHtml}
      </div>
    </div>
  `;
  document.body.appendChild(m);
}

async function saveCat(index, modalNode) {
  const name = val('cat-name'), slug = val('cat-slug'), parent = val('cat-parent');
  const originalSlug = val('cat-original-slug');
  if (!name || !slug) return showMsg('نام و شناسه الزامی است', true);

  if (index === -1) {
    if (categories.find(c => c.slug === slug)) return showMsg('این شناسه قبلاً استفاده شده است', true);
    categories.push({ name, slug, parent });
  } else {
    categories[index] = { name, slug, parent, originalSlug };
  }

  try {
    await api('/api/categories', { method: 'POST', body: JSON.stringify(categories), headers: { 'Content-Type': 'application/json' } });
    await loadAll();
    modalNode.remove();
    showMsg('دسته با موفقیت ذخیره شد');
    renderCategories();
  } catch(e) {
    showMsg('خطا در ذخیره دسته', true);
  }
}

async function deleteCat(i) {
  if(confirm('حذف شود؟ با حذف این دسته، تمامی زیردسته‌های آن نیز حذف خواهند شد.')) {
    const deletedSlug = categories[i].slug;

    // Find all children to delete
    let toDelete = new Set([deletedSlug]);
    let added = true;
    while(added) {
      added = false;
      categories.forEach(c => {
        if(toDelete.has(c.parent) && !toDelete.has(c.slug)) {
          toDelete.add(c.slug);
          added = true;
        }
      });
    }

    // Filter categories
    const newCategories = categories.filter(c => !toDelete.has(c.slug));

    // Update projects
    for (const project of projects) {
      if (project.categories && project.categories.some(c => toDelete.has(c))) {
        project.categories = project.categories.filter(c => !toDelete.has(c));
        await api('/api/projects', { method: 'POST', body: JSON.stringify(project), headers: { 'Content-Type': 'application/json' } });
      }
    }

    categories.length = 0;
    categories.push(...newCategories);

    renderCatList();
    saveCategories();
  }
}
async function saveCategories() { await api('/api/categories', { method: 'POST', body: JSON.stringify(categories), headers: { 'Content-Type': 'application/json' } }); }

function renderResume() {
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">رزومه</h2>
        <p class="sub" style="margin-bottom:0">اطلاعات رزومه خود را ویرایش و ذخیره کنید.</p>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 320px; gap:24px;">
      <div>
        <div class="card" style="padding:24px">
          <h3 style="margin-bottom:16px; color:var(--primary)">اطلاعات کلی و مهارت‌ها</h3>
          <label style="margin-top:0">خلاصه (درباره من در رزومه)</label>
          <textarea id="r-summary" style="min-height:100px; margin-bottom:16px">${resume.summary || ''}</textarea>

          <div class="grid2">
            <div><label style="margin-top:0">مهارت‌های اصلی (با کاما جدا کنید)</label><input id="r-skills" value="${(resume.skills || []).join(', ')}"></div>
            <div><label style="margin-top:0">ابزارها و فناوری‌ها (با کاما)</label><input id="r-tools" value="${(resume.tools || []).join(', ')}"></div>
            <div><label style="margin-top:0">زبان‌ها (با کاما)</label><input id="r-langs" value="${(resume.languages || []).join(', ')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <h3 style="margin-bottom:16px; color:var(--primary)">اطلاعات شخصی و تماس</h3>
          <div class="grid2">
            <div><label style="margin-top:0">لوکیشن</label><input id="r-location" value="${resume.location || ''}"></div>
            <div><label style="margin-top:0">وضعیت تاهل</label><input id="r-marital" value="${resume.maritalStatus || ''}"></div>
            <div><label style="margin-top:0">وضعیت سربازی</label><input id="r-military" value="${resume.militaryService || ''}"></div>
            <div><label style="margin-top:0">تاریخ تولد</label><input id="r-birth" value="${resume.birthDate || ''}"></div>
            <div><label style="margin-top:0">شماره تماس</label><input id="r-phone" value="${resume.phone || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">ایمیل</label><input id="r-email" value="${resume.email || ''}" dir="ltr"></div>
          </div>
          <hr>
          <h4 style="margin-bottom:12px; color:var(--muted)">لینک‌ها</h4>
          <div class="grid2">
            <div><label style="margin-top:0">تلگرام (آیدی)</label><input id="r-telegram" value="${resume.telegram || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">لینکدین (آیدی)</label><input id="r-linkedin" value="${resume.linkedin || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">گیت‌هاب (آیدی)</label><input id="r-github" value="${resume.github || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">یوتیوب (آیدی)</label><input id="r-youtube" value="${resume.youtube || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">توییتر (X) (آیدی)</label><input id="r-twitter" value="${resume.twitter || ''}" dir="ltr"></div>
            <div><label style="margin-top:0">لینک دلخواه (URL کامل)</label><input id="r-customLink" value="${resume.customLink || ''}" dir="ltr"></div>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
            <h3 style="color:var(--primary); margin:0">سوابق شغلی و تجربه‌ها</h3>
            <button class="btn sec" onclick="addExp()">+ افزودن تجربه جدید</button>
          </div>
          <div id="r-exp" style="display:flex; flex-direction:column; gap:16px"></div>
        </div>

        <div class="card" style="padding:24px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
            <h3 style="color:var(--primary); margin:0">سوابق تحصیلی</h3>
            <button class="btn sec" onclick="addEdu()">+ افزودن تحصیلات جدید</button>
          </div>
          <div id="r-edu" style="display:flex; flex-direction:column; gap:16px"></div>
        </div>
      </div>

      <aside>
        <div style="position:sticky; top:24px; padding:16px; border-radius:12px; background:var(--card); border:1px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,0.05)">
          <div style="display:flex; flex-direction:column; gap:12px">
            <button class="btn" onclick="saveResume()" style="width:100%; justify-content:center; padding:12px">ذخیره</button>
            <button class="btn sec" onclick="cancelResume()" style="width:100%; justify-content:center; padding:12px">انصراف</button>
          </div>
        </div>
      </aside>
    </div>
  `;
  renderExp(); renderEdu();
}

function renderExp() {
  document.getElementById('r-exp').innerHTML = (resume.experience || []).length ? (resume.experience || []).map((e, i) => `
    <div style="border:1px solid var(--border); padding:16px; border-radius:8px; background:var(--background); position:relative">
      <button class="btn danger" style="position:absolute; top:12px; left:12px; padding:6px; border-radius:6px; display:flex; align-items:center; justify-content:center" title="حذف" onclick="resume.experience.splice(${i},1);renderExp()"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      <div class="grid2" style="margin-bottom:12px">
        <div><label style="margin-top:0; font-size:0.8rem">عنوان شغلی</label><input value="${e.title}" onchange="resume.experience[${i}].title=this.value" placeholder="مثال: توسعه دهنده ارشد"></div>
        <div><label style="margin-top:0; font-size:0.8rem">نام شرکت/سازمان</label><input value="${e.company}" onchange="resume.experience[${i}].company=this.value" placeholder="مثال: گوگل"></div>
        <div><label style="margin-top:0; font-size:0.8rem">مدت زمان</label><input value="${e.period}" onchange="resume.experience[${i}].period=this.value" placeholder="مثال: ۱۴۰۰ - تاکنون"></div>
      </div>
      <div><label style="margin-top:0; font-size:0.8rem">توضیحات تکمیلی</label><textarea onchange="resume.experience[${i}].description=this.value" placeholder="شرح وظایف و دستاوردها..." style="min-height:60px">${e.description}</textarea></div>
    </div>
  `).join('') : '<p style="color:var(--muted); font-size:0.9rem">هیچ سابقه شغلی ثبت نشده است.</p>';
}

function addExp() { (resume.experience ||= []).push({ id: 'e' + Date.now(), title: '', company: '', period: '', description: '' }); renderExp(); }

function renderEdu() {
  document.getElementById('r-edu').innerHTML = (resume.education || []).length ? (resume.education || []).map((e, i) => `
    <div style="border:1px solid var(--border); padding:16px; border-radius:8px; background:var(--background); position:relative">
      <button class="btn danger" style="position:absolute; top:12px; left:12px; padding:6px 12px; font-size:0.8rem; border-radius:6px; display:flex; align-items:center; justify-content:center" title="حذف" onclick="resume.education.splice(${i},1);renderEdu()"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      <div class="grid2">
        <div><label style="margin-top:0; font-size:0.8rem">مقطع و رشته</label><input value="${e.title}" onchange="resume.education[${i}].title=this.value" placeholder="مثال: کارشناسی مهندسی کامپیوتر"></div>
        <div><label style="margin-top:0; font-size:0.8rem">دانشگاه/موسسه</label><input value="${e.school}" onchange="resume.education[${i}].school=this.value" placeholder="مثال: دانشگاه تهران"></div>
        <div><label style="margin-top:0; font-size:0.8rem">مدت زمان</label><input value="${e.period}" onchange="resume.education[${i}].period=this.value" placeholder="مثال: ۱۳۹۶ - ۱۴۰۰"></div>
      </div>
    </div>
  `).join('') : '<p style="color:var(--muted); font-size:0.9rem">هیچ سابقه تحصیلی ثبت نشده است.</p>';
}

function addEdu() { (resume.education ||= []).push({ id: 'd' + Date.now(), title: '', school: '', period: '' }); renderEdu(); }

async function cancelResume() {
  resume = await api('/api/resume');
  show('pages');
}

async function saveResume() {
  resume.summary = val('r-summary');
  resume.skills = val('r-skills').split(',').map((s) => s.trim()).filter(Boolean);
  resume.tools = val('r-tools').split(',').map((s) => s.trim()).filter(Boolean);
  resume.languages = val('r-langs').split(',').map((s) => s.trim()).filter(Boolean);
  resume.location = val('r-location');
  resume.maritalStatus = val('r-marital');
  resume.militaryService = val('r-military');
  resume.birthDate = val('r-birth');
  resume.phone = val('r-phone');
  resume.email = val('r-email');
  resume.telegram = val('r-telegram');
  resume.linkedin = val('r-linkedin');
  resume.github = val('r-github');
  resume.youtube = val('r-youtube');
  resume.twitter = val('r-twitter');
  resume.customLink = val('r-customLink');
  await api('/api/resume', { method: 'POST', body: JSON.stringify(resume), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

  const btn = document.querySelector('button[onclick="saveResume()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}

function renderSettings() {
  content.innerHTML = `<h2>تنظیمات سایت</h2><p class="sub">اطلاعات اصلی و سئو.</p>
    <div class="card">
      <label>نام</label><input id="s-name" value="${site.name || ''}">
      <label>فاوآیکون</label>
      <div class="row">
        <input id="s-favicon" value="${site.favicon || ''}" style="flex:1" placeholder="/media/favicon.ico">
        <button class="btn sec" onclick="openFaviconPicker()">انتخاب از رسانه</button>
      </div>
      <div id="favicon-preview" style="margin-top:8px">${site.favicon ? `<img src="${site.favicon}" style="width:32px;height:32px;border-radius:4px;border:1px solid #263243;object-fit:contain;background:#0b111b;padding:2px">` : ''}</div>
      <div id="favicon-picker" style="display:none;margin-top:12px">
        <div class="row" style="margin-bottom:8px">
          <input type="file" id="favicon-upload-file" accept="image/*,.ico" style="flex:1">
          <button class="btn" onclick="uploadFavicon()">آپلود و انتخاب</button>
        </div>
        <div class="grid2" id="favicon-picker-grid"></div>
      </div>
      <label>عنوان سئو</label><input id="s-seoTitle" value="${site.seoTitle || ''}">
      <label>توضیح سئو</label><textarea id="s-seoDesc">${site.seoDescription || ''}</textarea>
      <div style="margin-top:16px"></div>
    </div>
    <button class="btn" onclick="saveSettings()">ذخیره</button>
    `;
}

async function openFaviconPicker() {
  const picker = document.getElementById('favicon-picker');
  if (picker.style.display === 'none') {
    await loadMedia();
    picker.style.display = 'block';
    const grid = document.getElementById('favicon-picker-grid');
    if (!media.length) { grid.innerHTML = '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>'; return; }
    grid.innerHTML = media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectFavicon('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
  } else {
    picker.style.display = 'none';
  }
}

function selectFavicon(path) {
  document.getElementById('s-favicon').value = path;
  document.getElementById('favicon-preview').innerHTML = `<img src="${path}" style="width:32px;height:32px;border-radius:4px;border:1px solid #263243;object-fit:contain;background:#0b111b;padding:2px">`;
  document.getElementById('favicon-picker').style.display = 'none';
}

async function uploadFavicon() {
  const file = document.getElementById('favicon-upload-file').files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadMedia();
  const grid = document.getElementById('favicon-picker-grid');
  grid.innerHTML = media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectFavicon('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
  selectFavicon(`/media/${file.name}`);
}
async function saveSettings() { site.name = val('s-name'); site.favicon = val('s-favicon'); site.seoTitle = val('s-seoTitle'); site.seoDescription = val('s-seoDesc'); await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('settings'); }


async function saveTheme(skipMsg = false) {
  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  applyTheme();

  if (!skipMsg) {
    const btn = document.querySelector('button[onclick="saveTheme()"]');
    if (btn) {
      const origText = btn.innerHTML;
      btn.innerHTML = 'ذخیره شد ✓';
      btn.classList.add('ok');
      setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
    }
  }
}

function renderTheme() {
  const t = site.theme || { baseColor: '#b8f542', isCustom: false };
  const isCustom = !!t.isCustom;
  const c = isCustom ? t : generateThemeColors(t.baseColor || '#b8f542');
  const d = c.dark || {};
  const l = c.light || {};

  // Derive panel colors from the theme values themselves
  const dBg    = d.background || '#0b111b';
  const dCard  = d.card       || '#131b2a';
  const dBdr   = d.border     || '#263243';
  const dFg    = d.foreground || '#f5f7fa';
  const dMuted = d.muted      || '#9ba6b5';

  const lBg    = l.background || '#fafbf9';
  const lCard  = l.card       || '#f3f5f0';
  const lBdr   = l.border     || '#dbe0d1';
  const lFg    = l.foreground || '#292e1f';
  const lMuted = l.muted      || '#6d7a52';

  // Input field styles reused per panel
  const dInput = `flex:1; padding:4px 8px; font-family:monospace; direction:ltr; background:${dCard}; color:${dFg}; border:1px solid ${dBdr}`;
  const lInput = `flex:1; padding:4px 8px; font-family:monospace; direction:ltr; background:${lCard}; color:${lFg}; border:1px solid ${lBdr}`;

  const colorRow = (mode, key, id, label, defaultVal) => {
    const val   = mode === 'd' ? (d[key] || defaultVal) : (l[key] || defaultVal);
    const style = mode === 'd' ? dInput : lInput;
    const muted = mode === 'd' ? dMuted : lMuted;
    return `
      <div style="margin-bottom:12px">
        <label style="margin:0 0 4px 0; color:${muted}">${label}</label>
        <div style="display:flex; gap:8px; align-items:center">
          <input type="text"  id="t-${id}-text"  value="${val}" onchange="document.getElementById('t-${id}').value=this.value; syncCustomColors()" style="${style}">
          <input type="color" id="t-${id}" value="${val}" onchange="document.getElementById('t-${id}-text').value=this.value; syncCustomColors()" style="width:40px; height:32px; padding:0; border:none; border-radius:4px">
        </div>
      </div>`;
  };

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">رنگ‌بندی</h2>
        <p class="sub" style="margin-bottom:0">یک رنگ پایه انتخاب کنید، بقیه رنگ‌ها برای هر دو حالت تاریک و روشن خودکار ساخته می‌شوند. برای ویرایش رنگ ها باید گزینه تنظیم دستی را فعال کنید.</p>
      </div>
    </div>

    <div>
      <div class="card" style="padding:24px">
        <div style="margin-bottom:24px">
          <label style="margin-top:0">رنگ پایه (Base Color)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text"  id="t-basecolor-text" value="${c.baseColor || '#b8f542'}" onchange="onPrimaryChange(this.value)" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-basecolor"      value="${c.baseColor || '#b8f542'}" onchange="onPrimaryChange(this.value)" style="width:40px; height:40px; padding:0; border:none; border-radius:4px">
          </div>
        </div>

        <div style="margin-bottom:24px; display:flex; align-items:center; justify-content:flex-start; gap:8px">
          <input type="checkbox" id="t-custom-checkbox" ${isCustom ? 'checked' : ''} onchange="onCustomToggle(this.checked)" style="width:16px; height:16px; margin:0; cursor:pointer">
          <label for="t-custom-checkbox" style="margin:0; cursor:pointer; line-height:1">تنظیم دستی رنگ‌ها (استفاده از مقادیر سفارشی)</label>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; opacity:${isCustom ? '1' : '0.6'}; pointer-events:${isCustom ? 'auto' : 'none'}">

          <!-- Dark Mode panel -->
          <div style="background:${dBg}; padding:16px; border-radius:12px; border:1px solid ${dBdr}">
            <h3 style="margin-bottom:16px; color:${dFg}">رنگ‌های حالت تاریک (Dark)</h3>
            ${colorRow('d', 'primary',    'dark-primary',    'رنگ اصلی (Primary)',       d.primary    || '#b8f542')}
            ${colorRow('d', 'secondary',  'dark-secondary',  'رنگ ثانویه (Secondary)',   d.secondary  || '#000000')}
            ${colorRow('d', 'background', 'dark-bg',         'پس‌زمینه (Background)',    d.background || '#000000')}
            ${colorRow('d', 'foreground', 'dark-fg',         'متن (Foreground)',          d.foreground || '#ffffff')}
            ${colorRow('d', 'muted',      'dark-muted',      'متن کمرنگ (Muted)',        d.muted      || '#000000')}
            ${colorRow('d', 'border',     'dark-border',     'خطوط (Border)',             d.border     || '#000000')}
            ${colorRow('d', 'card',       'dark-card',       'کارت (Card)',               d.card       || '#000000')}
          </div>

          <!-- Light Mode panel -->
          <div style="background:${lBg}; padding:16px; border-radius:12px; border:1px solid ${lBdr}">
            <h3 style="margin-bottom:16px; color:${lFg}">رنگ‌های حالت روشن (Light)</h3>
            ${colorRow('l', 'primary',    'light-primary',    'رنگ اصلی (Primary)',       l.primary    || '#000000')}
            ${colorRow('l', 'secondary',  'light-secondary',  'رنگ ثانویه (Secondary)',   l.secondary  || '#000000')}
            ${colorRow('l', 'background', 'light-bg',         'پس‌زمینه (Background)',    l.background || '#ffffff')}
            ${colorRow('l', 'foreground', 'light-fg',         'متن (Foreground)',          l.foreground || '#000000')}
            ${colorRow('l', 'muted',      'light-muted',      'متن کمرنگ (Muted)',        l.muted      || '#000000')}
            ${colorRow('l', 'border',     'light-border',     'خطوط (Border)',             l.border     || '#000000')}
            ${colorRow('l', 'card',       'light-card',       'کارت (Card)',               l.card       || '#ffffff')}
          </div>

        </div>
      </div>
      <div class="row" style="margin-bottom:16px">
        <button class="btn" onclick="saveTheme()" style="justify-content:center">ذخیره</button>
        <button class="btn sec" onclick="resetTheme()" style="justify-content:center">بازنشانی پیش‌فرض</button>
      </div>
    </div>`;
}

function onPrimaryChange(val) {
    site.theme = site.theme || {};
    site.theme.baseColor = val;
    if (!site.theme.isCustom) {
        Object.assign(site.theme, generateThemeColors(val));
    }
    renderTheme();
}

function onCustomToggle(checked) {
    site.theme = site.theme || {};
    site.theme.isCustom = checked;
    if (checked) {
        syncCustomColors();
    } else {
        Object.assign(site.theme, generateThemeColors(site.theme.baseColor || '#b8f542'));
    }
    renderTheme();
}

function syncCustomColors() {
    site.theme = site.theme || {};
    site.theme.isCustom = true;
    site.theme.baseColor = document.getElementById('t-basecolor').value;
    site.theme.dark = {
        primary: document.getElementById('t-dark-primary').value,
        secondary: document.getElementById('t-dark-secondary').value,
        background: document.getElementById('t-dark-bg').value,
        foreground: document.getElementById('t-dark-fg').value,
        muted: document.getElementById('t-dark-muted').value,
        border: document.getElementById('t-dark-border').value,
        card: document.getElementById('t-dark-card').value,
    };
    site.theme.light = {
        primary: document.getElementById('t-light-primary').value,
        secondary: document.getElementById('t-light-secondary').value,
        background: document.getElementById('t-light-bg').value,
        foreground: document.getElementById('t-light-fg').value,
        muted: document.getElementById('t-light-muted').value,
        border: document.getElementById('t-light-border').value,
        card: document.getElementById('t-light-card').value,
    };
}

async function resetTheme() {
  if(!confirm('همه رنگ‌ها به حالت پیش‌فرض بازنشانی شوند؟')) return;

  site.theme = {
    baseColor: '#b8f542',
    isCustom: true,
    light: {
      primary:    '#8ec421',
      secondary:  '#18a1c3',
      background: '#fafbf9',
      foreground: '#292e1f',
      muted:      '#6d7a52',
      border:     '#dbe0d1',
      card:       '#f3f5f0'
    },
    dark: {
      primary:    '#b8f542',
      secondary:  '#8adcf0',
      background: '#0b111b',
      foreground: '#f5f7fa',
      muted:      '#9ba6b5',
      border:     '#263243',
      card:       '#131b2a'
    }
  };

  // Update inputs instantly, then persist in background (no message on save btn)
  renderTheme();
  applyTheme();
  await saveTheme(true);

  // Show confirmation on the reset button
  const btn = document.querySelector('button[onclick="resetTheme()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'بازنشانی شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}

function renderFont() {
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">فونت‌ها</h2>
        <p class="sub" style="margin-bottom:0">فونت‌های قابل استفاده در سایت را مدیریت کنید.</p>
      </div>
      <button class="btn" onclick="openFontModal()">+ افزودن فونت</button>
    </div>

    <div class="grid2" id="font-list"></div>
  `;
  renderFontList();
}

function getSiteFonts() {
    return Array.isArray(site.fonts) ? site.fonts : [];
}

function renderFontList() {
    const list = getSiteFonts();
    const container = document.getElementById('font-list');
    if (!list.length) {
        container.innerHTML = '<div class="card" style="grid-column:1/-1; text-align:center; color:#9ba6b5">هیچ فونتی اضافه نشده است.</div>';
        return;
    }

    container.innerHTML = list.map((f, i) => `
      <div class="card" style="padding:16px; display:flex; justify-content:space-between; align-items:center">
        <div>
          <strong style="font-size:1.1rem; display:block; margin-bottom:4px">${f.name}</strong>
          <span style="color:#9ba6b5; font-size:0.85rem">منبع: ${f.source === 'google' ? 'Google Fonts' : 'آپلود شده'}</span>
        </div>
        <button class="btn danger" style="padding:8px" onclick="deleteSiteFont(${i})" title="حذف">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `).join('');
}

function openFontModal() {
  const existing = document.getElementById('font-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'font-modal';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal-content" style="max-width:480px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
        <h3 style="margin:0">افزودن فونت</h3>
        <button class="modal-close" style="color:var(--foreground); margin:0" onclick="document.getElementById('font-modal').remove()">×</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:24px">
        <label id="fsrc-google-label" style="display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:8px; border:2px solid var(--primary); background:color-mix(in srgb, var(--primary) 10%, transparent); cursor:pointer; font-weight:600; transition:all .15s">
          <input type="radio" name="font-source" value="google" checked onchange="toggleFontSourceModal(this.value)" style="display:none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Google Font
        </label>
        <label id="fsrc-upload-label" style="display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:8px; border:2px solid var(--border); cursor:pointer; font-weight:600; transition:all .15s">
          <input type="radio" name="font-source" value="custom" onchange="toggleFontSourceModal(this.value)" style="display:none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          آپلود فونت
        </label>
      </div>

      <div id="modal-font-google" style="margin-bottom:24px">
        <label style="margin-top:0">نام فونت (دقیقاً مطابق Google Fonts)</label>
        <input id="modal-google-name" placeholder="مثال: Vazirmatn" style="margin-bottom:4px">
        <p style="color:var(--muted); font-size:.8rem; margin:0">نام فونت را دقیقاً همان‌طور که در <a href="https://fonts.google.com" target="_blank" style="color:var(--primary)">fonts.google.com</a> نوشته شده وارد کنید.</p>
      </div>

      <div id="modal-font-custom" style="margin-bottom:24px; display:none">
        <label style="margin-top:0">فایل فونت</label>
        <div id="font-drop-zone" style="border:2px dashed var(--border); border-radius:10px; padding:32px 16px; text-align:center; cursor:pointer; transition:border-color .15s" ondragover="event.preventDefault(); this.style.borderColor='var(--primary)'" ondragleave="this.style.borderColor='var(--border)'" ondrop="handleFontDrop(event)">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p style="color:var(--muted); margin:0 0 10px; font-size:.9rem">فایل را اینجا بکشید یا کلیک کنید</p>
          <input type="file" id="modal-custom-file" accept=".woff2,.woff,.ttf,.otf" style="display:none" onchange="onFontFileSelected(this)">
          <button class="btn sec" type="button" style="padding:7px 16px; font-size:.85rem" onclick="document.getElementById('modal-custom-file').click()">انتخاب فایل</button>
          <p id="font-file-name" style="color:var(--primary); font-size:.85rem; margin:10px 0 0; display:none"></p>
        </div>
        <p style="color:var(--muted); font-size:.8rem; margin:6px 0 0">فرمت‌های پشتیبانی‌شده: WOFF2، WOFF، TTF، OTF</p>
      </div>

      <button class="btn" style="width:100%; justify-content:center; padding:12px" onclick="saveFontModal()">افزودن</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

function toggleFontSourceModal(val) {
  document.getElementById('modal-font-google').style.display = val === 'google' ? 'block' : 'none';
  document.getElementById('modal-font-custom').style.display = val === 'custom' ? 'block' : 'none';
  // Update pill highlight
  const googleLabel = document.getElementById('fsrc-google-label');
  const uploadLabel = document.getElementById('fsrc-upload-label');
  if (val === 'google') {
    googleLabel.style.borderColor = 'var(--primary)';
    googleLabel.style.background = 'color-mix(in srgb, var(--primary) 10%, transparent)';
    uploadLabel.style.borderColor = 'var(--border)';
    uploadLabel.style.background = 'transparent';
  } else {
    uploadLabel.style.borderColor = 'var(--primary)';
    uploadLabel.style.background = 'color-mix(in srgb, var(--primary) 10%, transparent)';
    googleLabel.style.borderColor = 'var(--border)';
    googleLabel.style.background = 'transparent';
  }
}

function onFontFileSelected(input) {
  const file = input.files[0];
  if (!file) return;
  const label = document.getElementById('font-file-name');
  label.textContent = file.name;
  label.style.display = 'block';
}

function handleFontDrop(event) {
  event.preventDefault();
  const zone = document.getElementById('font-drop-zone');
  zone.style.borderColor = 'var(--border)';
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const input = document.getElementById('modal-custom-file');
  // Transfer file to the hidden input via DataTransfer
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  onFontFileSelected(input);
}

async function saveFontModal() {
  const source = document.querySelector('input[name="font-source"]:checked').value;
  let newFont = null;

  if (source === 'google') {
    const name = document.getElementById('modal-google-name').value.trim();
    if (!name) return alert('لطفاً نام فونت را وارد کنید.');
    newFont = { source: 'google', name, googleFamily: name };
  } else {
    const fileInput = document.getElementById('modal-custom-file');
    const file = fileInput.files[0];
    if (!file) return alert('لطفاً یک فایل فونت انتخاب کنید.');

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!FONT_EXTENSIONS.includes(ext)) { alert('فرمت پشتیبانی نمی‌شود.'); return; }

    const buffer = await file.arrayBuffer();
    await fetch('/api/fonts?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });

    const isVar = file.name.toLowerCase().includes('variable');
    const name = file.name.replace(/\.[^.]+$/, '');
    const format = ext.slice(1);
    newFont = {
      source: 'custom',
      name,
      customFont: { path: `/fonts/${file.name}`, format, isVariable: isVar, weights: isVar ? [100, 900] : [400] }
    };
  }

  if (!Array.isArray(site.fonts)) site.fonts = [];
  if (site.fonts.find(f => f.name === newFont.name)) {
    return alert(`فونت "${newFont.name}" از قبل وجود دارد.`);
  }
  site.fonts.push(newFont);

  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  document.getElementById('font-modal').remove();

  // Refresh whichever view is active
  if (currentView === 'typography') {
    renderTypography();
  } else {
    renderFontList();
  }
}

async function deleteSiteFont(i) {
    const list = getSiteFonts();
    const font = list[i];
    if (!font) return;

    // Guard: in use
    const typo = site.typography || {};
    if (typo.bodyFont === font.name || typo.headingFont === font.name) {
        alert('این فونت در بخش تایپوگرافی در حال استفاده است. ابتدا آن را تغییر دهید.');
        return;
    }

    if (!confirm(`فونت "${font.name}" حذف شود؟`)) return;

    // Remove from site.fonts in memory and persist
    list.splice(i, 1);
    site.fonts = list;
    await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });

    // Also delete the physical font file for uploaded fonts
    if (font.source === 'custom' && font.customFont?.path) {
        await fetch('/api/fonts', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: font.customFont.path })
        });
    }

    // Refresh the active view
    if (currentView === 'typography') {
        renderTypography();
    } else {
        renderFontList();
    }
}

function renderTypography() {
  const typo = site.typography || { bodyFont: '', headingFont: '' };
  const list = getSiteFonts();

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">تنظیم فونت</h2>
        <p class="sub" style="margin-bottom:0">ابتدا فونت دلخواه خود را اضافه کنید سپس فونت متن و تیتر را تنظیم کنید.</p>
      </div>
    </div>

    <div style="display:flex; flex-direction: column; gap:24px;">

      <!-- Fonts Manager -->
      <div>
        <div class="card" style="padding:24px; display:flex; flex-direction:column; gap:16px;">
          <h3 style="margin-bottom:0px; font-size:1.1rem; color:var(--primary)">مدیریت فونت‌ها</h3>
          <p class="sub" style="margin-bottom:0">فونت های موجود:</p>
          <div id="fonts-list" style="display:flex; flex-direction:column; gap:8px;">
            ${list.length === 0 ? '<p class="sub" style="font-size:0.9rem">هیچ فونتی یافت نشد.</p>' : ''}
            ${list.map((f, i) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--background); border-radius:8px; border:1px solid var(--border);">
                <span style="font-family: ${f.name}, Tahoma">${f.name}</span>
                <button class="btn sec" style="padding:4px; border:none; color:#ef4444" onclick="deleteSiteFont(${i})">حذف</button>
              </div>
            `).join('')}
          </div>
          <button class="btn sec" onclick="openFontModal()">+ افزودن فونت جدید</button>
        </div>
      </div>

      <!-- Typography Settings -->
      <div>
        <div class="card" style="padding:24px">
          <h3 style="margin-bottom:16px; font-size:1.1rem; color:var(--primary)">انتخاب فونت سایت</h3>
          <div style="margin-bottom:24px">
            <label style="margin-top:0">فونت متن سایت</label>
            <select id="typo-body" onchange="updateTypoAuto('bodyFont', this.value)">
              <option value="">(پیش‌فرض سیستم)</option>
              ${list.map(f => `<option value="${f.name}" ${typo.bodyFont === f.name ? 'selected' : ''}>${f.name}</option>`).join('')}
            </select>
          </div>

          <div style="margin-bottom:24px">
            <label style="margin-top:0">فونت تیترها</label>
            <select id="typo-heading" onchange="updateTypoAuto('headingFont', this.value)">
              <option value="">(همان فونت متن)</option>
              ${list.map(f => `<option value="${f.name}" ${typo.headingFont === f.name ? 'selected' : ''}>${f.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>



    </div>
  `;
}

async function updateTypoAuto(key, value) {
  site.typography = site.typography || { bodyFont: '', headingFont: '' };
  site.typography[key] = value;

  if (site.typography.bodyFont) {
    site.font = site.typography.bodyFont;
  } else {
    site.font = 'Tahoma';
  }

  try {
    await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
    await loadAll();
    applyTheme();
  } catch(e) {
    showMsg('خطا در ذخیره تایپوگرافی', true);
  }
}

async function renderMedia() {
  await loadMedia();
  content.innerHTML = `
      <h2 style="margin-bottom:4px">رسانه</h2>
      <p class="sub" style="margin-bottom:24px">مدیریت فایل‌های آپلود شده.</p>
      <div style="margin-bottom:24px; width:fit-content; display:flex; gap:8px; align-items:center; background:var(--card); padding:8px 16px; border-radius:8px; border:1px solid var(--border)">
        <input type="file" id="media-upload" style="background:transparent; border:none; padding:0; width:auto">
        <button class="btn" onclick="uploadMedia()">آپلود فایل</button>
      </div>
    <div class="grid2" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px">
      ${media.map((m) => `
        <div class="card" style="padding:12px; position:relative; display:flex; flex-direction:column; align-items:center; text-align:center">
          <button onclick="deleteMedia('${m.path}')" style="position:absolute; top:8px; left:8px; background:rgba(239, 68, 68, 0.9); color:white; border:none; border-radius:4px; padding:4px; cursor:pointer" title="حذف">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
          <div style="width:100%; height:120px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#0b111b; border-radius:8px; margin-bottom:12px; overflow:hidden" onclick="openLightbox('${m.path}')">
            <img src="${m.path}" style="max-width:100%; max-height:100%; object-fit:contain">
          </div>
          <strong style="word-break:break-all; font-size:0.9rem; line-height:1.4; margin-bottom:4px; width:100%">${m.name}</strong>
          <span style="color:#9ba6b5; font-size:0.8rem">${Math.round(m.size / 1024)} کیلوبایت</span>
        </div>
      `).join('')}
    </div>
  `;
}
async function uploadMedia() { const file = document.getElementById('media-upload').files[0]; if (!file) return; const buffer = await file.arrayBuffer(); await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer }); renderMedia(); }
async function deleteMedia(p) { if(confirm('این فایل حذف شود؟')) { await api('/api/media', { method: 'DELETE', body: JSON.stringify({ path: p }), headers: { 'Content-Type': 'application/json' } }); renderMedia(); } }

function openLightbox(url) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'lightbox-modal';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="position:relative; max-width:90%; max-height:90vh; display:flex; flex-direction:column; align-items:center">
      <button class="modal-close" style="position:absolute; top:-40px; right:0; font-size:2rem" onclick="document.getElementById('lightbox-modal').remove()">×</button>
      <img src="${url}" class="lightbox-img">
    </div>
  `;
  document.body.appendChild(overlay);
}

async function waitForPreview(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch('http://localhost:3000', { mode: 'no-cors', cache: 'no-store' });
      return true;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

async function openPreview() {
  const win = window.open('about:blank', '_blank');
  try {
    await api('/api/dev', { method: 'POST' });
    const ready = await waitForPreview();
    if (!ready) {
      if (win) win.close();
      alert('پیش‌نمایش آماده نشد. چند ثانیه بعد دوباره امتحان کنید.');
      return;
    }
    if (win) win.location.href = 'http://localhost:3000';
    else window.open('http://localhost:3000', '_blank');
  } catch (_) {
    if (win) win.close();
    alert('خطا در اجرای پیش‌نمایش');
  }
}

async function renderPublish(resultHtml = '') {
  content.innerHTML = `<h2>انتشار در گیت‌هاب</h2><p class="sub">وضعیت تغییرات را ببینید و در صورت نیاز منتشر کنید.</p>
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

async function startPublish() {
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

function val(id) { return document.getElementById(id).value; }
loadAll();

// ─── Hero Section ───
function renderHero() {
  const h = site.hero || {};
  content.innerHTML = `
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
            <div><label>اسم</label><input id="h-name" value="${h.name || site.name || ''}"></div>
            <div><label>عنوان شغلی</label><input id="h-jobTitle" value="${h.jobTitle || site.title || ''}"></div>
          </div>
          <label>متن درباره من</label><textarea id="h-about" style="min-height:120px">${h.about || site.bio || ''}</textarea>
          <label>تصویر پروفایل</label>
          <div class="row">
            <input id="h-profileImage" value="${h.profileImage || site.profileImage || ''}" style="flex:1">
            <button class="btn sec" onclick="openHeroImagePicker()">انتخاب از رسانه</button>
          </div>
          <div id="h-image-preview" style="margin-top:8px">${(h.profileImage || site.profileImage) ? `<img src="${h.profileImage || site.profileImage}" class="preview">` : ''}</div>
          <div id="h-image-picker" style="display:none;margin-top:12px">
            <div class="row" style="margin-bottom:8px">
              <input type="file" id="h-upload-file" accept="image/*" style="flex:1">
              <button class="btn" onclick="uploadHeroImage()">آپلود و انتخاب</button>
            </div>
            <div class="grid2" id="h-picker-grid"></div>
          </div>
          <hr>
          <h3 style="margin-bottom:12px">شبکه‌های اجتماعی</h3>
          <div class="grid2">
            <div><label>GitHub</label><input id="h-github" value="${h.github ?? ''}" placeholder="https://github.com/username"></div>
            <div><label>LinkedIn</label><input id="h-linkedin" value="${h.linkedin ?? ''}" placeholder="https://linkedin.com/in/username"></div>
            <div><label>Instagram</label><input id="h-instagram" value="${h.instagram ?? ''}" placeholder="https://instagram.com/username"></div>
            <div><label>Telegram</label><input id="h-telegram" value="${h.telegram ?? ''}" placeholder="https://t.me/username"></div>
            <div><label>YouTube</label><input id="h-youtube" value="${h.youtube ?? ''}" placeholder="https://youtube.com/@username"></div>
            <div><label>Twitter (X)</label><input id="h-twitter" value="${h.twitter ?? ''}" placeholder="https://twitter.com/username"></div>
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
}

async function cancelHero() {
  await loadAll();
  show('pages');
}

async function openHeroImagePicker() {
  const picker = document.getElementById('h-image-picker');
  if (picker.style.display === 'none') {
    await loadMedia();
    picker.style.display = 'block';
    const grid = document.getElementById('h-picker-grid');
    if (!media.length) { grid.innerHTML = '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>'; return; }
    grid.innerHTML = media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectHeroImage('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
  } else {
    picker.style.display = 'none';
  }
}

function selectHeroImage(path) {
  document.getElementById('h-profileImage').value = path;
  document.getElementById('h-image-preview').innerHTML = `<img src="${path}" class="preview">`;
  document.getElementById('h-image-picker').style.display = 'none';
}

async function uploadHeroImage() {
  const file = document.getElementById('h-upload-file').files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadMedia();
  const grid = document.getElementById('h-picker-grid');
  grid.innerHTML = media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectHeroImage('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
  selectHeroImage(`/media/${file.name}`);
}

async function saveHero() {
  site.hero = {
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
  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

  const btn = document.querySelector('button[onclick="saveHero()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}



function renderPages() {
  content.innerHTML = `
    <h2 style="margin-bottom:18px">برگه‌ها</h2>
    <button class="btn" style="margin-bottom:24px" onclick="newPage()">+ ایجاد برگه جدید</button>
    <div class="grid2">
      <!-- System Pages -->
      <div class="card" style="display:flex; flex-direction:column; padding:16px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <strong style="font-size:1.1rem">صفحه اصلی</strong>
          <span class="tag" style="background:#2a1515; color:#ef4444">اختصاصی (سیستمی)</span>
        </div>
        <p style="color:#9ba6b5; font-size:0.85rem; margin-bottom:16px">مدیریت محتوای هیرو و شبکه‌های اجتماعی صفحه اول.</p>
        <button class="btn sec" style="margin-top:auto" onclick="show('hero')">ویرایش صفحه اصلی</button>
      </div>

      <div class="card" style="display:flex; flex-direction:column; padding:16px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <strong style="font-size:1.1rem">رزومه</strong>
          <span class="tag" style="background:#2a1515; color:#ef4444">اختصاصی (سیستمی)</span>
        </div>
        <p style="color:#9ba6b5; font-size:0.85rem; margin-bottom:16px">مدیریت سوابق شغلی، تحصیلی و اطلاعات تماس.</p>
        <button class="btn sec" style="margin-top:auto" onclick="show('resume')">ویرایش رزومه</button>
      </div>



      <!-- Normal Pages -->
      ${pagesList.map((p) => `
        <div class="card" style="display:flex; flex-direction:column; padding:16px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <strong style="font-size:1.1rem">${p.title || '(بدون عنوان)'}</strong>
            <span class="tag" style="background:#17303b; color:#8adcf0">عادی</span>
          </div>
          <p style="color:#9ba6b5; font-size:0.85rem; margin-bottom:16px">آدرس: /${p.slug}</p>
          <div class="row" style="margin-top:auto">
            <button class="btn sec" style="flex:1; justify-content:center" onclick="editPage('${p.slug}')">ویرایش</button>
            <button class="btn danger" style="padding:10px" onclick="deletePage('${p.slug}')" title="حذف"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function newPage() { editingPage = { title: '', slug: '', content: '' }; currentView = 'page-edit'; render(); }
function editPage(slug) { editingPage = pagesList.find((p) => p.slug === slug); currentView = 'page-edit'; render(); }
async function deletePage(slug) { if (!confirm('حذف شود؟')) return; await api('/api/pages', { method: 'DELETE', body: JSON.stringify({ slug }), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('pages'); }

function renderPageEdit() {
  const p = editingPage;
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">${p.slug ? 'ویرایش برگه' : 'ایجاد برگه جدید'}</h2>
      </div>
      <div class="row">
        <button class="btn sec" onclick="show('pages')">انصراف</button>
        <button class="btn" onclick="savePage()">ذخیره برگه</button>
      </div>
    </div>

    <div class="card" style="padding:24px">
      <div class="grid2" style="margin-bottom:16px">
        <div><label style="margin-top:0">عنوان برگه</label><input id="p-title" value="${p.title || ''}"></div>
        <div><label style="margin-top:0">شناسه (slug)</label><input id="p-slug" value="${p.slug || ''}" dir="ltr"></div>
      </div>
      <label>محتوای برگه (Markdown)</label>
      <textarea id="p-content" style="min-height:400px">${p.content || ''}</textarea>
    </div>
  `;
}

async function savePage() {
  const data = {
    title: document.getElementById('p-title').value,
    slug: document.getElementById('p-slug').value,
    content: document.getElementById('p-content').value,
  };
  await api('/api/pages', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  await loadAll();
  show('pages');
}



function renderMenu() {
  content.innerHTML = `
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

let draggedMenuIndex = null;

function renderMenuList() {
  const container = document.getElementById('menu-list');
  if (!siteMenu || !siteMenu.length) {
    siteMenu = [
      { label: 'خانه', href: '/' },
      { label: 'پروژه‌ها', href: '/projects' },
      { label: 'رزومه', href: '/resume' }
    ];
    saveMenu(); // Auto save default menu
    return;
  }
  if (!siteMenu.length) {
    container.innerHTML = '<p style="color:#9ba6b5">منوی سایت خالی است.</p>';
    return;
  }

  // Make items draggable
  container.innerHTML = siteMenu.map((m, i) => {
    const isSystemPage = m.href === '/' || m.href === '/projects' || m.href === '/resume';
    return `
    <div class="card menu-item-card" draggable="true" data-index="${i}" style="padding:16px; margin:0; display:flex; gap:16px; align-items:center; cursor:grab;" ondragstart="handleDragStartMenu(event, ${i})" ondragover="handleDragOverMenu(event)" ondrop="handleDropMenu(event, ${i})" ondragend="handleDragEndMenu(event)">
      <div style="color:var(--muted); cursor:grab; padding:8px" title="جابجایی">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
      </div>
      <div style="flex:1">
        <label style="margin-top:0">عنوان لینک</label>
        <input value="${m.label}" onchange="siteMenu[${i}].label=this.value; saveMenuAuto();" placeholder="مثال: درباره من" style="cursor:text;">
      </div>
      <div style="flex:2">
        <label style="margin-top:0">آدرس (URL)</label>
        <input value="${m.href}" onchange="siteMenu[${i}].href=this.value; saveMenuAuto();" dir="ltr" placeholder="مثال: /about" ${isSystemPage ? 'disabled' : ''} style="cursor:text;">
      </div>
      <div style="display:flex; gap:8px; align-items:flex-end; padding-top:24px">
        <button class="btn danger" style="padding:8px" onclick="deleteMenuItem(${i})" title="حذف" ${isSystemPage ? 'disabled' : ''}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      </div>
    </div>
  `}).join('');
}

function handleDragStartMenu(e, index) {
  draggedMenuIndex = index;
  e.target.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOverMenu(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDropMenu(e, dropIndex) {
  e.preventDefault();
  if (draggedMenuIndex === null || draggedMenuIndex === dropIndex) return;

  const temp = siteMenu[draggedMenuIndex];
  siteMenu.splice(draggedMenuIndex, 1);
  siteMenu.splice(dropIndex, 0, temp);

  renderMenuList();
  saveMenuAuto();
}

function handleDragEndMenu(e) {
  e.target.style.opacity = '1';
  draggedMenuIndex = null;
}



async function saveMenuAuto() {
  try {
    await api('/api/menu', { method: 'POST', body: JSON.stringify(siteMenu), headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    showMsg('خطا در ذخیره خودکار منو', true);
  }
}

async function saveMenu() {
  await api('/api/menu', { method: 'POST', body: JSON.stringify(siteMenu), headers: { 'Content-Type': 'application/json' } });
  await loadAll();
  const btn = document.querySelector('button[onclick="saveMenu()"]');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2000);
  }
}
