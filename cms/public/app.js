const api = (path, opts) => fetch(path, opts).then((r) => r.json());
let currentView = 'hero';
let projects = [];
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
  [site, categories, resume, projects] = await Promise.all([
    api('/api/site'), api('/api/categories'), api('/api/resume'), api('/api/projects'),
  ]);
  render();
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

function show(view) {
  currentView = view;
  document.querySelectorAll('.nav-item, .nav-child').forEach((el) => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + view);
  if (navEl) navEl.classList.add('active');
  // اگر view مربوط به گروه تنظیمات باشد، گروه را باز نگه دار
  if (['settings', 'theme', 'font'].includes(view)) {
    const group = document.getElementById('group-settings');
    if (group && !group.classList.contains('open')) group.classList.add('open');
  }
  render();
}

function render() {
  if (currentView === 'dashboard') return renderDashboard();
  if (currentView === 'projects') return renderProjects();
  if (currentView === 'categories') return renderCategories();
  if (currentView === 'resume') return renderResume();
  if (currentView === 'media') return renderMedia();
  if (currentView === 'settings') return renderSettings();
  if (currentView === 'theme') return renderTheme();
  if (currentView === 'font') return renderFont();
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
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">پروژه‌ها</h2>
        <p class="sub" style="margin-bottom:0">مدیریت نمونه‌کارها و پروژه‌ها.</p>
      </div>
      <button class="btn" onclick="newProject()">+ ایجاد پروژه جدید</button>
    </div>
    <div class="grid2">
      ${projects.map((p) => `
        <div class="card" style="display:flex; flex-direction:column; padding:0; overflow:hidden">
          <div style="height:140px; background:#172231; position:relative">
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
function editProject(slug) { editingProject = projects.find((p) => p.slug === slug); currentView = 'project-edit'; render(); }
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
  renderCoverPickerGrid();
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
    content: val('f-content'),
  };
  await api('/api/projects', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  await loadAll();

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
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">دسته‌ها</h2>
        <p class="sub" style="margin-bottom:0">مدیریت دسته‌بندی‌های پروژه‌ها.</p>
      </div>
      <button class="btn" onclick="openCatModal()">+ ایجاد دسته جدید</button>
    </div>
    <div class="grid2" id="cat-list"></div>`;
  renderCatList();
}

function renderCatList() {
  document.getElementById('cat-list').innerHTML = categories.map((c, i) => `
    <div class="card" style="padding:16px; display:flex; justify-content:space-between; align-items:center">
      <div>
        <strong style="font-size:1.1rem; display:block; margin-bottom:4px">${c.name || '(بدون نام)'}</strong>
        <span style="color:#9ba6b5; font-size:0.85rem">slug: ${c.slug}</span>
      </div>
      <div style="display:flex; gap:8px">
        <button class="btn sec" style="padding:8px" onclick="openCatModal(${i})" title="ویرایش">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn danger" style="padding:8px" onclick="deleteCat(${i})" title="حذف">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function openCatModal(index = -1) {
  const isEdit = index >= 0;
  const c = isEdit ? categories[index] : { name: '', slug: '', parent: null };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'cat-modal';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal-content" style="max-width:500px">
      <button class="modal-close" onclick="document.getElementById('cat-modal').remove()">بستن ×</button>
      <h3 style="margin-bottom:16px">${isEdit ? 'ویرایش دسته' : 'ایجاد دسته جدید'}</h3>

      <div style="margin-bottom:12px">
        <label style="margin-top:0">نام نمایشی</label>
        <input id="cat-name-input" value="${c.name}" placeholder="مثال: طراحی وب">
      </div>
      <div style="margin-bottom:12px">
        <label style="margin-top:0">شناسه (slug)</label>
        <input id="cat-slug-input" value="${c.slug}" placeholder="مثال: web-design">
      </div>
      <div style="margin-bottom:24px">
        <label style="margin-top:0">دسته والد</label>
        <select id="cat-parent-input">
          <option value="">بدون والد (دسته اصلی)</option>
          ${categories.filter((x) => x.slug !== c.slug).map((x) => `<option value="${x.slug}" ${c.parent === x.slug ? 'selected' : ''}>${x.name}</option>`).join('')}
        </select>
      </div>

      <div class="row">
        <button class="btn" style="flex:1; justify-content:center" onclick="saveCatModal(${index})">ذخیره</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function saveCatModal(index) {
  const name = document.getElementById('cat-name-input').value;
  const slug = document.getElementById('cat-slug-input').value;
  const parent = document.getElementById('cat-parent-input').value || null;

  if (!slug) return alert('شناسه (slug) الزامی است.');

  if (index >= 0) {
    categories[index] = { ...categories[index], name, slug, parent };
  } else {
    categories.push({ name, slug, parent, sort: categories.length + 1 });
  }

  document.getElementById('cat-modal').remove();
  renderCatList();
  saveCategories();
}

function deleteCat(i) { if(confirm('حذف شود؟')) { categories.splice(i,1); renderCatList(); saveCategories(); } }
async function saveCategories() { await api('/api/categories', { method: 'POST', body: JSON.stringify(categories), headers: { 'Content-Type': 'application/json' } }); }

function renderResume() {
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">رزومه</h2>
        <p class="sub" style="margin-bottom:0">اطلاعات رزومه خود را ویرایش و ذخیره کنید.</p>
      </div>
      <button class="btn" onclick="saveResume()">ذخیره تغییرات</button>
    </div>

    <div style="display:grid; grid-template-columns: 1fr; gap:24px; max-width:1000px">
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
        <h4 style="margin-bottom:12px; color:var(--muted)">شبکه‌های اجتماعی</h4>
        <div class="grid2">
          <div><label style="margin-top:0">تلگرام</label><input id="r-telegram" value="${resume.telegram || ''}" dir="ltr"></div>
          <div><label style="margin-top:0">لینکدین</label><input id="r-linkedin" value="${resume.linkedin || ''}" dir="ltr"></div>
          <div><label style="margin-top:0">گیت‌هاب</label><input id="r-github" value="${resume.github || ''}" dir="ltr"></div>
          <div><label style="margin-top:0">یوتیوب</label><input id="r-youtube" value="${resume.youtube || ''}" dir="ltr"></div>
          <div><label style="margin-top:0">توییتر (X)</label><input id="r-twitter" value="${resume.twitter || ''}" dir="ltr"></div>
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
  `;
  renderExp(); renderEdu();
}

function renderExp() {
  document.getElementById('r-exp').innerHTML = (resume.experience || []).length ? (resume.experience || []).map((e, i) => `
    <div style="border:1px solid #263243; padding:16px; border-radius:8px; background:#0b111b; position:relative">
      <button class="btn danger" style="position:absolute; top:12px; left:12px; padding:6px 12px; font-size:0.8rem" onclick="resume.experience.splice(${i},1);renderExp()">حذف</button>
      <div class="grid2" style="margin-bottom:12px">
        <div><label style="margin-top:0; font-size:0.8rem">عنوان شغلی</label><input value="${e.title}" onchange="resume.experience[${i}].title=this.value" placeholder="مثال: توسعه دهنده ارشد"></div>
        <div><label style="margin-top:0; font-size:0.8rem">نام شرکت/سازمان</label><input value="${e.company}" onchange="resume.experience[${i}].company=this.value" placeholder="مثال: گوگل"></div>
        <div><label style="margin-top:0; font-size:0.8rem">مدت زمان</label><input value="${e.period}" onchange="resume.experience[${i}].period=this.value" placeholder="مثال: ۱۴۰۰ - تاکنون"></div>
      </div>
      <div><label style="margin-top:0; font-size:0.8rem">توضیحات تکمیلی</label><textarea onchange="resume.experience[${i}].description=this.value" placeholder="شرح وظایف و دستاوردها..." style="min-height:60px">${e.description}</textarea></div>
    </div>
  `).join('') : '<p style="color:#9ba6b5; font-size:0.9rem">هیچ سابقه شغلی ثبت نشده است.</p>';
}

function addExp() { (resume.experience ||= []).push({ id: 'e' + Date.now(), title: '', company: '', period: '', description: '' }); renderExp(); }

function renderEdu() {
  document.getElementById('r-edu').innerHTML = (resume.education || []).length ? (resume.education || []).map((e, i) => `
    <div style="border:1px solid #263243; padding:16px; border-radius:8px; background:#0b111b; position:relative">
      <button class="btn danger" style="position:absolute; top:12px; left:12px; padding:6px 12px; font-size:0.8rem" onclick="resume.education.splice(${i},1);renderEdu()">حذف</button>
      <div class="grid2">
        <div><label style="margin-top:0; font-size:0.8rem">مقطع و رشته</label><input value="${e.title}" onchange="resume.education[${i}].title=this.value" placeholder="مثال: کارشناسی مهندسی کامپیوتر"></div>
        <div><label style="margin-top:0; font-size:0.8rem">دانشگاه/موسسه</label><input value="${e.school}" onchange="resume.education[${i}].school=this.value" placeholder="مثال: دانشگاه تهران"></div>
        <div><label style="margin-top:0; font-size:0.8rem">مدت زمان</label><input value="${e.period}" onchange="resume.education[${i}].period=this.value" placeholder="مثال: ۱۳۹۶ - ۱۴۰۰"></div>
      </div>
    </div>
  `).join('') : '<p style="color:#9ba6b5; font-size:0.9rem">هیچ سابقه تحصیلی ثبت نشده است.</p>';
}

function addEdu() { (resume.education ||= []).push({ id: 'd' + Date.now(), title: '', school: '', period: '' }); renderEdu(); }

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
      <div style="margin-top:16px"><button class="btn" onclick="saveSettings()">ذخیره</button></div>
    </div>`;
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

const PALETTES = {
  green: { primary: '#b8f542', background: '#0b111b', foreground: '#f5f7fa', muted: '#9ba6b5', border: '#263243', accent: '#8adcf0' },
  orange: { primary: '#f97316', background: '#1c1917', foreground: '#fafaf9', muted: '#a8a29e', border: '#292524', accent: '#fb923c' },
  blue: { primary: '#3b82f6', background: '#0f172a', foreground: '#f8fafc', muted: '#94a3b8', border: '#1e293b', accent: '#60a5fa' }
};

function renderTheme() {
  const t = site.theme || {};
  const isCustom = t.palette === 'custom' || !t.palette;

  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">پوسته و رنگ‌بندی</h2>
        <p class="sub" style="margin-bottom:0">پالت رنگی سایت را تنظیم کنید.</p>
      </div>
    </div>

    <div class="card" style="padding:24px; max-width:800px">
      <div class="grid2" style="margin-bottom:24px">
        <div>
          <label style="margin-top:0">حالت نمایش (تم)</label>
          <select id="t-mode">
            <option value="dark" ${t.mode === 'dark' ? 'selected' : ''}>تیره (پیش‌فرض)</option>
            <option value="light" ${t.mode === 'light' ? 'selected' : ''}>روشن</option>
            <option value="system" ${t.mode === 'system' ? 'selected' : ''}>تابع سیستم</option>
          </select>
        </div>
        <div>
          <label style="margin-top:0">پالت رنگی</label>
          <select id="t-palette" onchange="onPaletteChange(this.value)">
            <option value="green" ${t.palette === 'green' ? 'selected' : ''}>سبز نئون (پیش‌فرض)</option>
            <option value="orange" ${t.palette === 'orange' ? 'selected' : ''}>نارنجی گرم</option>
            <option value="blue" ${t.palette === 'blue' ? 'selected' : ''}>آبی اقیانوسی</option>
            <option value="custom" ${isCustom ? 'selected' : ''}>سفارشی...</option>
          </select>
        </div>
      </div>

      <div id="custom-colors" style="display: grid; gap:16px; border-top:1px solid #263243; padding-top:24px; opacity: ${isCustom ? '1' : '0.5'}; pointer-events: ${isCustom ? 'auto' : 'none'}" class="grid2">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">رنگ اصلی (Primary)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-primary-text" value="${t.primary || PALETTES.green.primary}" onchange="document.getElementById('t-primary').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-primary" value="${t.primary || PALETTES.green.primary}" onchange="document.getElementById('t-primary-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">پس‌زمینه (Background)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-bg-text" value="${t.background || PALETTES.green.background}" onchange="document.getElementById('t-background').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-background" value="${t.background || PALETTES.green.background}" onchange="document.getElementById('t-bg-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">متن (Foreground)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-fg-text" value="${t.foreground || PALETTES.green.foreground}" onchange="document.getElementById('t-foreground').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-foreground" value="${t.foreground || PALETTES.green.foreground}" onchange="document.getElementById('t-fg-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">متن کمرنگ (Muted)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-muted-text" value="${t.muted || PALETTES.green.muted}" onchange="document.getElementById('t-muted').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-muted" value="${t.muted || PALETTES.green.muted}" onchange="document.getElementById('t-muted-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">خطوط (Border)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-border-text" value="${t.border || PALETTES.green.border}" onchange="document.getElementById('t-border').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-border" value="${t.border || PALETTES.green.border}" onchange="document.getElementById('t-border-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center">
          <label style="margin:0">تأکیدی (Accent)</label>
          <div style="display:flex; gap:8px; align-items:center">
            <input type="text" id="t-accent-text" value="${t.accent || PALETTES.green.accent}" onchange="document.getElementById('t-accent').value=this.value" style="width:100px; padding:4px 8px; font-family:monospace; direction:ltr">
            <input type="color" id="t-accent" value="${t.accent || PALETTES.green.accent}" onchange="document.getElementById('t-accent-text').value=this.value" style="width:40px; height:40px; padding:0; border:none; border-radius:4px" ${!isCustom ? 'disabled' : ''}>
          </div>
        </div>
      </div>

      <div class="row" style="margin-top:24px; padding-top:24px; border-top:1px solid #263243">
        <button class="btn" onclick="saveTheme()">ذخیره تنظیمات پوسته</button>
        <button class="btn sec" onclick="resetTheme()">بازنشانی به پیش‌فرض</button>
      </div>
    </div>`;
}

function onPaletteChange(palette) {
  site.theme = site.theme || {};
  site.theme.palette = palette;

  if (palette !== 'custom' && PALETTES[palette]) {
    Object.assign(site.theme, PALETTES[palette]);
  }

  renderTheme();
}

function resetTheme() {
  if(!confirm('همه رنگ‌ها به حالت پیش‌فرض بازنشانی شوند؟')) return;
  site.theme = { mode: 'dark', palette: 'green', ...PALETTES.green };
  saveTheme();
}

function renderFont() {
  const fc = parseFontConfig();
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">فونت</h2>
        <p class="sub" style="margin-bottom:0">فونت سایت را تنظیم کنید.</p>
      </div>
    </div>
    <div class="card" style="padding:24px; max-width:800px">
      <div style="margin-bottom:24px">
        <label style="margin-top:0">منبع فونت</label>
        <select id="t-fontSource" onchange="onFontSourceChange()">
          <option value="builtin" ${fc.source === 'builtin' ? 'selected' : ''}>فونت‌های داخلی</option>
          <option value="google" ${fc.source === 'google' ? 'selected' : ''}>گوگل فونت (Google Fonts)</option>
          <option value="custom" ${fc.source === 'custom' ? 'selected' : ''}>فونت آپلودی</option>
        </select>
      </div>

      <div id="font-builtin" style="margin-bottom:24px">
        <label style="margin-top:0">انتخاب فونت داخلی</label>
        <select id="t-builtinFont">
          ${BUILTIN_FONTS.map((f) => `<option ${fc.name === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>

      <div id="font-google" style="margin-bottom:24px; display:none">
        <label style="margin-top:0">نام خانواده گوگل فونت</label>
        <input id="t-googleFamily" value="${fc.googleFamily || fc.name || ''}" placeholder="مثال: Vazirmatn">
        <p style="color:#9ba6b5;font-size:.85rem;margin-top:6px">نام خانواده را دقیق وارد کنید. پیشنهادها: ${GOOGLE_FONT_SUGGESTIONS.join('، ')}</p>
      </div>

      <div id="font-custom" style="margin-bottom:24px; display:none">
        <label style="margin-top:0">انتخاب فونت آپلودی</label>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
          <select id="t-customFont" style="flex:1" onchange="onCustomFontChange()"></select>
          <button class="btn sec" onclick="document.getElementById('font-upload-file').click()">آپلود فونت جدید</button>
          <input type="file" id="font-upload-file" accept=".woff2,.woff,.ttf,.otf" style="display:none" onchange="uploadFont()">
        </div>
        <div id="font-axis-info" style="margin-top:12px"></div>
      </div>

      <div style="border-top:1px solid #263243; margin-top:24px; padding-top:24px">
        <button class="btn" onclick="saveFont()">ذخیره تنظیمات فونت</button>
      </div>
    </div>`;
  onFontSourceChange();
  if (fc.source === 'custom') { loadFonts().then(() => populateCustomFonts(fc.customFont?.path)); }
}

function onFontSourceChange() {
  const source = val('t-fontSource');
  document.getElementById('font-builtin').style.display = source === 'builtin' ? 'block' : 'none';
  document.getElementById('font-google').style.display = source === 'google' ? 'block' : 'none';
  document.getElementById('font-custom').style.display = source === 'custom' ? 'block' : 'none';
  if (source === 'custom' && fonts.length === 0) loadFonts().then(populateCustomFonts);
}

function populateCustomFonts(selectedPath) {
  const sel = document.getElementById('t-customFont');
  if (!sel) return;
  if (!fonts.length) { sel.innerHTML = '<option value="">هیچ فونتی آپلود نشده</option>'; return; }
  sel.innerHTML = fonts.map((f) => `<option value="${f.path}" ${selectedPath === f.path ? 'selected' : ''}>${f.name} (${f.format})</option>`).join('');
  onCustomFontChange();
}

function onCustomFontChange() {
  const sel = document.getElementById('t-customFont');
  if (!sel) return;
  const fontPath = sel.value;
  if (!fontPath) { document.getElementById('font-axis-info').innerHTML = ''; return; }
  const font = fonts.find((f) => f.path === fontPath);
  if (!font) return;
  const isVar = font.name.toLowerCase().includes('variable') || font.format === 'woff2';
  const info = `<div style="padding:10px;border:1px solid #263243;border-radius:8px;background:#0b111b">
    <strong>ساختار فونت:</strong> ${isVar ? 'فونت متغیر (Variable)' : 'فونت معمولی'}<br>
    <strong>فرمت:</strong> ${font.format}<br>
    <strong>حجم:</strong> ${Math.round(font.size / 1024)} کیلوبایت
  </div>`;
  document.getElementById('font-axis-info').innerHTML = info;
}

async function uploadFont() {
  const file = document.getElementById('font-upload-file').files[0];
  if (!file) return;
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!FONT_EXTENSIONS.includes(ext)) { alert('فرمت پشتیبانی نمی‌شود. فقط: ' + FONT_EXTENSIONS.join(', ')); return; }
  const buffer = await file.arrayBuffer();
  await fetch('/api/fonts?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadFonts();
  populateCustomFonts(`/fonts/${file.name}`);
}

async function saveTheme() {
  const palette = val('t-palette');
  const t = { mode: val('t-mode'), palette };

  if (palette === 'custom') {
    t.primary = val('t-primary');
    t.background = val('t-background');
    t.foreground = val('t-foreground');
    t.muted = val('t-muted');
    t.border = val('t-border');
    t.accent = val('t-accent');
  } else {
    Object.assign(t, PALETTES[palette]);
  }

  site.theme = t;
  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  await loadAll();
  if (typeof applyTheme === 'function') applyTheme();

  const btn = document.querySelector('button[onclick="saveTheme()"]');
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = 'ذخیره شد ✓';
    btn.classList.add('ok');
    setTimeout(() => { btn.innerHTML = origText; btn.classList.remove('ok'); }, 2000);
  }
}

async function saveFont() {
  const source = val('t-fontSource');
  let fontConfig;
  if (source === 'builtin') {
    fontConfig = { source: 'builtin', name: val('t-builtinFont') };
  } else if (source === 'google') {
    const family = val('t-googleFamily').trim();
    if (!family) { alert('نام خانواده گوگل فونت الزامی است'); return; }
    fontConfig = { source: 'google', name: family, googleFamily: family };
  } else {
    const fontPath = val('t-customFont');
    if (!fontPath) { alert('ابتدا یک فونت آپلود کنید'); return; }
    const font = fonts.find((f) => f.path === fontPath);
    const isVar = font && (font.name.toLowerCase().includes('variable') || font.format === 'woff2');
    const name = font ? font.name.replace(/\.[^.]+$/, '') : 'CustomFont';
    fontConfig = { source: 'custom', name, customFont: { path: fontPath, format: font ? font.format : 'woff2', isVariable: isVar, weights: isVar ? [100, 900] : [400] } };
  }
  site.font = JSON.stringify(fontConfig);
  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  await loadAll();
  if (typeof applyTheme === 'function') applyTheme();
  show('font');
}

async function renderMedia() {
  await loadMedia();
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
      <div>
        <h2 style="margin-bottom:4px">رسانه</h2>
        <p class="sub" style="margin-bottom:0">مدیریت فایل‌های آپلود شده.</p>
      </div>
      <div style="display:flex; gap:8px; align-items:center; background:#111a27; padding:8px 16px; border-radius:8px; border:1px solid #263243">
        <input type="file" id="media-upload" style="background:transparent; border:none; padding:0; width:auto">
        <button class="btn" onclick="uploadMedia()">آپلود فایل</button>
      </div>
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
  content.innerHTML = `<h2>صفحه اصلی (Hero)</h2><p class="sub">اطلاعات نمایش داده‌شده در بخش اول صفحه اصلی.</p>
    <div class="card">
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
      </div>
      <div class="row" style="margin-top:20px"><button class="btn" onclick="saveHero()">ذخیره</button></div>
    </div>`;
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
