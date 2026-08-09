const api = (path, opts) => fetch(path, opts).then((r) => r.json());
let currentView = 'dashboard';
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

function show(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.remove('active'));
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
  if (currentView === 'project-edit') return renderProjectEdit();
}

function renderDashboard() {
  content.innerHTML = `<h2>داشبورد</h2><p class="sub">خلاصه‌ای از وضعیت محتوای شما.</p>
    <div class="grid2">
      <div class="card"><h3>${projects.length}</h3><p>پروژه‌ها</p></div>
      <div class="card"><h3>${categories.length}</h3><p>دسته‌ها</p></div>
    </div>
    <div class="card"><p>برای پیش‌نمایش زنده، روی «اجرای پیش‌نمایش» در منو کلیک کنید. سایت در آدرس http://localhost:3000 باز می‌شود.</p></div>`;
}

function renderProjects() {
  content.innerHTML = `<h2>پروژه‌ها</h2><p class="sub">مدیریت نمونه‌کارها.</p>
    <button class="btn" onclick="newProject()">+ پروژه جدید</button>
    <div style="margin-top:16px">${projects.map((p) => `<div class="list-item"><div><strong>${p.title || ''}</strong></div><div class="row"><button class="btn sec" onclick="editProject('${p.slug}')">ویرایش</button><button class="btn sec" onclick="duplicateProject('${p.slug}')">کپی</button><button class="btn danger" onclick="deleteProject('${p.slug}')">حذف</button></div></div>`).join('')}</div>`;
}

function newProject() { editingProject = { title: '', slug: '', description: '', content: '', cover: '', year: '', client: '', role: '', technologies: [], categories: [], videoMode: 'none', videoUrl: '' }; currentView = 'project-edit'; render(); }
function editProject(slug) { editingProject = projects.find((p) => p.slug === slug); currentView = 'project-edit'; render(); }
async function duplicateProject(slug) { const p = projects.find((x) => x.slug === slug); const copy = { ...p, slug: p.slug + '-copy', title: p.title + ' (کپی)' }; await api('/api/projects', { method: 'POST', body: JSON.stringify(copy), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('projects'); }
async function deleteProject(slug) { if (!confirm('حذف شود؟')) return; await api('/api/projects', { method: 'DELETE', body: JSON.stringify({ slug }), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('projects'); }

function renderProjectEdit() {
  const p = editingProject;
  const catCheckboxes = categories.map((c) => `<label style="display:inline-flex;align-items:center;gap:6px;margin-inline-end:12px"><input type="checkbox" ${p.categories.includes(c.slug) ? 'checked' : ''} onchange="toggleCat('${c.slug}', this.checked)"> ${c.name}</label>`).join('');
  content.innerHTML = `<h2>${p.slug ? 'ویرایش پروژه' : 'پروژه جدید'}</h2>
    <div class="card">
      <div class="grid2">
        <div><label>عنوان</label><input id="f-title" value="${p.title || ''}"></div>
        <div><label>شناسه (slug)</label><input id="f-slug" value="${p.slug || ''}"></div>
      </div>
      <label>توضیح کوتاه</label><input id="f-description" value="${p.description || ''}">
      <label>تصویر کاور</label>
      <div class="row">
        <input id="f-cover" value="${p.cover || ''}" style="flex:1">
        <button class="btn sec" onclick="openCoverPicker()">انتخاب از رسانه</button>
      </div>
      <div id="cover-preview" style="margin-top:8px">${p.cover ? `<img src="${p.cover}" class="preview">` : ''}</div>
      <div id="cover-picker" style="display:none;margin-top:12px">
        <div class="row" style="margin-bottom:8px">
          <input type="file" id="cover-upload-file" accept="image/*" style="flex:1">
          <button class="btn" onclick="uploadCoverFromPicker()">آپلود و انتخاب</button>
        </div>
        <div class="grid2" id="cover-picker-grid"></div>
      </div>
      <div class="grid2">
        <div><label>سال</label><input id="f-year" value="${p.year || ''}"></div>
        <div><label>مشتری</label><input id="f-client" value="${p.client || ''}"></div>
      </div>
      <div class="grid2">
        <div><label>نقش</label><input id="f-role" value="${p.role || ''}"></div>
        <div><label>فناوری‌ها (با کاما)</label><input id="f-tech" value="${(p.technologies || []).join(', ')}"></div>
      </div>
      <label>دسته‌ها</label><div>${catCheckboxes}</div>
      <div class="grid2">
        <div><label>حالت ویدیو</label><select id="f-videoMode"><option value="none" ${p.videoMode === 'none' ? 'selected' : ''}>بدون ویدیو</option><option value="youtube" ${p.videoMode === 'youtube' ? 'selected' : ''}>یوتیوب</option><option value="embed" ${p.videoMode === 'embed' ? 'selected' : ''}>کد امبد</option></select></div>
        <div><label>آدرس/کد ویدیو</label><input id="f-videoUrl" value="${p.videoUrl || ''}"></div>
      </div>
      <label>محتوای کامل (Markdown)</label><textarea id="f-content" style="min-height:200px">${p.content || ''}</textarea>
      <div class="row" style="margin-top:16px"><button class="btn" onclick="saveProject()">ذیره</button><button class="btn sec" onclick="show('projects')">انصراف</button></div>
    </div>`;
}

async function openCoverPicker() {
  const picker = document.getElementById('cover-picker');
  if (picker.style.display === 'none') {
    await loadMedia();
    picker.style.display = 'block';
    renderCoverPickerGrid();
  } else {
    picker.style.display = 'none';
  }
}

function renderCoverPickerGrid() {
  const grid = document.getElementById('cover-picker-grid');
  if (!media.length) { grid.innerHTML = '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>'; return; }
  grid.innerHTML = media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectCover('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
}

function selectCover(path) {
  document.getElementById('f-cover').value = path;
  document.getElementById('cover-preview').innerHTML = `<img src="${path}" class="preview">`;
  document.getElementById('cover-picker').style.display = 'none';
}

async function uploadCoverFromPicker() {
  const file = document.getElementById('cover-upload-file').files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer });
  await loadMedia();
  renderCoverPickerGrid();
  selectCover(`/media/${file.name}`);
}

function toggleCat(slug, checked) { if (checked) editingProject.categories.push(slug); else editingProject.categories = editingProject.categories.filter((c) => c !== slug); }

async function saveProject() {
  const data = {
    ...editingProject,
    title: val('f-title'), slug: val('f-slug'), description: val('f-description'), cover: val('f-cover'),
    year: val('f-year'), client: val('f-client'), role: val('f-role'),
    technologies: val('f-tech').split(',').map((t) => t.trim()).filter(Boolean),
    videoMode: val('f-videoMode'), videoUrl: val('f-videoUrl'),
    content: val('f-content'),
  };
  await api('/api/projects', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  await loadAll(); show('projects');
}

function renderCategories() {
  content.innerHTML = `<h2>دسته‌ها</h2><p class="sub">دسته‌بندی سلسله‌مراتبی پروژه‌ها.</p>
    <div class="card"><div id="cat-list"></div><button class="btn" onclick="addCat()">+ دسته جدید</button></div>
    <div class="row" style="margin-top:16px"><button class="btn" onclick="saveCategories()">ذخیره تغییرات</button></div>`;
  renderCatList();
}
function renderCatList() {
  document.getElementById('cat-list').innerHTML = categories.map((c, i) => `<div class="list-item">
    <div class="row">
      <input value="${c.name}" onchange="categories[${i}].name=this.value" style="width:140px">
      <input value="${c.slug}" onchange="categories[${i}].slug=this.value" style="width:140px">
      <select onchange="categories[${i}].parent=this.value||null" style="width:160px"><option value="">بدون والد</option>${categories.filter((x) => x.slug !== c.slug).map((x) => `<option value="${x.slug}" ${c.parent === x.slug ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
      <input type="number" value="${c.sort}" onchange="categories[${i}].sort=+this.value" style="width:70px">
    </div>
    <button class="btn danger" onclick="categories.splice(${i},1);renderCatList()">حذف</button>
  </div>`).join('');
}
function addCat() { categories.push({ name: 'دسته جدید', slug: 'new-' + Date.now(), description: '', parent: null, sort: categories.length + 1 }); renderCatList(); }
async function saveCategories() { await api('/api/categories', { method: 'POST', body: JSON.stringify(categories), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('categories'); }

function renderResume() {
  content.innerHTML = `<h2>رزومه</h2><p class="sub">اطلاعات رزومه ویرایش و ذخیره می‌شود.</p>
    <div class="card">
      <label>خلاصه</label><textarea id="r-summary">${resume.summary || ''}</textarea>
      <h3 style="margin-top:16px">تجربه‌ها</h3><div id="r-exp"></div><button class="btn sec" onclick="addExp()">+ تجربه</button>
      <h3 style="margin-top:16px">تحصیلات</h3><div id="r-edu"></div><button class="btn sec" onclick="addEdu()">+ تحصیل</button>
      <label style="margin-top:16px">مهارت‌ها (کاما)</label><input id="r-skills" value="${(resume.skills || []).join(', ')}">
      <label>ابزارها (کاما)</label><input id="r-tools" value="${(resume.tools || []).join(', ')}">
      <label>زبان‌ها (کاما)</label><input id="r-langs" value="${(resume.languages || []).join(', ')}">
      <div style="margin-top:16px"><button class="btn" onclick="saveResume()">ذخیره</button></div>
    </div>`;
  renderExp(); renderEdu();
}
function renderExp() { document.getElementById('r-exp').innerHTML = (resume.experience || []).map((e, i) => `<div class="list-item"><div class="grid2" style="flex:1"><input value="${e.title}" onchange="resume.experience[${i}].title=this.value" placeholder="عنوان"><input value="${e.company}" onchange="resume.experience[${i}].company=this.value" placeholder="شرکت"><input value="${e.period}" onchange="resume.experience[${i}].period=this.value" placeholder="دوره"><input value="${e.description}" onchange="resume.experience[${i}].description=this.value" placeholder="توضیح"></div><button class="btn danger" onclick="resume.experience.splice(${i},1);renderExp()">حذف</button></div>`).join(''); }
function addExp() { (resume.experience ||= []).push({ id: 'e' + Date.now(), title: '', company: '', period: '', description: '' }); renderExp(); }
function renderEdu() { document.getElementById('r-edu').innerHTML = (resume.education || []).map((e, i) => `<div class="list-item"><div class="grid2" style="flex:1"><input value="${e.title}" onchange="resume.education[${i}].title=this.value" placeholder="عنوان"><input value="${e.school}" onchange="resume.education[${i}].school=this.value" placeholder="دانشگاه"><input value="${e.period}" onchange="resume.education[${i}].period=this.value" placeholder="دوره"></div><button class="btn danger" onclick="resume.education.splice(${i},1);renderEdu()">حذف</button></div>`).join(''); }
function addEdu() { (resume.education ||= []).push({ id: 'd' + Date.now(), title: '', school: '', period: '' }); renderEdu(); }
async function saveResume() { resume.summary = val('r-summary'); resume.skills = val('r-skills').split(',').map((s) => s.trim()).filter(Boolean); resume.tools = val('r-tools').split(',').map((s) => s.trim()).filter(Boolean); resume.languages = val('r-langs').split(',').map((s) => s.trim()).filter(Boolean); await api('/api/resume', { method: 'POST', body: JSON.stringify(resume), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('resume'); }

function renderSettings() {
  content.innerHTML = `<h2>تنظیمات سایت</h2><p class="sub">اطلاعات اصلی و سئو.</p>
    <div class="card">
      <div class="grid2"><div><label>نام</label><input id="s-name" value="${site.name || ''}"></div><div><label>عنوان حرفه‌ای</label><input id="s-title" value="${site.title || ''}"></div></div>
      <label>بیو</label><textarea id="s-bio">${site.bio || ''}</textarea>
      <div class="grid2"><div><label>ایمیل</label><input id="s-email" value="${site.email || ''}"></div><div><label>تصویر پروفایل</label><input id="s-profile" value="${site.profileImage || ''}"></div></div>
      <div class="grid2"><div><label>گیت‌هاب</label><input id="s-github" value="${(site.socials && site.socials.github) || ''}"></div><div><label>لینکدین</label><input id="s-linkedin" value="${(site.socials && site.socials.linkedin) || ''}"></div></div>
      <label>عنوان سئو</label><input id="s-seoTitle" value="${site.seoTitle || ''}">
      <label>توضیح سئو</label><textarea id="s-seoDesc">${site.seoDescription || ''}</textarea>
      <div style="margin-top:16px"><button class="btn" onclick="saveSettings()">ذخیره</button></div>
    </div>`;
}
async function saveSettings() { site.name = val('s-name'); site.title = val('s-title'); site.bio = val('s-bio'); site.email = val('s-email'); site.profileImage = val('s-profile'); site.socials = { github: val('s-github'), linkedin: val('s-linkedin'), website: site.socials?.website || '' }; site.seoTitle = val('s-seoTitle'); site.seoDescription = val('s-seoDesc'); await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } }); await loadAll(); show('settings'); }

function renderTheme() {
  const t = site.theme || {};
  const fc = parseFontConfig();
  content.innerHTML = `<h2>پوسته و فونت</h2><p class="sub">رنگ‌ها و فونت سایت را تنظیم کنید.</p>
    <div class="card">
      <h3 style="margin-bottom:12px">فونت</h3>
      <label>منبع فونت</label>
      <select id="t-fontSource" onchange="onFontSourceChange()">
        <option value="builtin" ${fc.source === 'builtin' ? 'selected' : ''}>فونت‌های داخلی</option>
        <option value="google" ${fc.source === 'google' ? 'selected' : ''}>گوگل فونت</option>
        <option value="custom" ${fc.source === 'custom' ? 'selected' : ''}>فونت آپلودی</option>
      </select>
      <div id="font-builtin" style="margin-top:8px">
        <label>فونت داخلی</label>
        <select id="t-builtinFont">
          ${BUILTIN_FONTS.map((f) => `<option ${fc.name === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div id="font-google" style="margin-top:8px;display:none">
        <label>نام خانواده گوگل فونت</label>
        <input id="t-googleFamily" value="${fc.googleFamily || fc.name || ''}" placeholder="مثال: Vazirmatn">
        <label>نام نمایشی فونت</label>
        <input id="t-googleName" value="${fc.source === 'google' ? fc.name : ''}" placeholder="نام دلخواه">
        <p style="color:#9ba6b5;font-size:.8rem;margin-top:4px">نام خانواده را دقیق وارد کنید. پیشنهادها: ${GOOGLE_FONT_SUGGESTIONS.join('، ')}</p>
      </div>
      <div id="font-custom" style="margin-top:8px;display:none">
        <label>فونت آپلودی</label>
        <div class="row">
          <select id="t-customFont" onchange="onCustomFontChange()"></select>
          <button class="btn sec" onclick="document.getElementById('font-upload-file').click()">آپلود فونت</button>
          <input type="file" id="font-upload-file" accept=".woff2,.woff,.ttf,.otf" style="display:none" onchange="uploadFont()">
        </div>
        <label>نام نمایشی فونت</label>
        <input id="t-customName" value="${fc.source === 'custom' ? fc.name : ''}" placeholder="نام دلخواه">
        <div id="font-axis-info" style="margin-top:8px"></div>
      </div>
      <h3 style="margin-top:20px">رنگ‌ها</h3>
      <div class="grid2">
        <div><label>حالت</label><select id="t-mode"><option value="dark" ${t.mode === 'dark' ? 'selected' : ''}>تیره</option><option value="light" ${t.mode === 'light' ? 'selected' : ''}>روشن</option><option value="system" ${t.mode === 'system' ? 'selected' : ''}>سیستم</option></select></div>
        <div style="display:none"><label>placeholder</label></div>
        <div><label>رنگ اصلی</label><input type="color" id="t-primary" value="${t.primary || '#b8f542'}"></div>
        <div><label>پس‌زمینه</label><input type="color" id="t-background" value="${t.background || '#0b111b'}"></div>
        <div><label>متن</label><input type="color" id="t-foreground" value="${t.foreground || '#f5f7fa'}"></div>
        <div><label>متحرک</label><input type="color" id="t-muted" value="${t.muted || '#9ba6b5'}"></div>
        <div><label>مرز</label><input type="color" id="t-border" value="${t.border || '#263243'}"></div>
        <div><label>تأکیدی</label><input type="color" id="t-accent" value="${t.accent || '#8adcf0'}"></div>
      </div>
      <div style="margin-top:16px"><button class="btn" onclick="saveTheme()">ذخیره</button></div>
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
  const source = val('t-fontSource');
  let fontConfig;
  if (source === 'builtin') {
    fontConfig = { source: 'builtin', name: val('t-builtinFont') };
  } else if (source === 'google') {
    const family = val('t-googleFamily').trim();
    const name = val('t-googleName').trim() || family;
    if (!family) { alert('نام خانواده گوگل فونت الزامی است'); return; }
    fontConfig = { source: 'google', name, googleFamily: family };
  } else {
    const fontPath = val('t-customFont');
    if (!fontPath) { alert('ابتدا یک فونت آپلود کنید'); return; }
    const font = fonts.find((f) => f.path === fontPath);
    const isVar = font && (font.name.toLowerCase().includes('variable') || font.format === 'woff2');
    const name = val('t-customName').trim() || (font ? font.name.replace(/\.[^.]+$/, '') : 'CustomFont');
    fontConfig = { source: 'custom', name, customFont: { path: fontPath, format: font ? font.format : 'woff2', isVariable: isVar, weights: isVar ? [100, 900] : [400] } };
  }
  site.theme = { mode: val('t-mode'), primary: val('t-primary'), background: val('t-background'), foreground: val('t-foreground'), muted: val('t-muted'), border: val('t-border'), accent: val('t-accent') };
  site.font = JSON.stringify(fontConfig);
  await api('/api/site', { method: 'POST', body: JSON.stringify(site), headers: { 'Content-Type': 'application/json' } });
  await loadAll(); show('theme');
}

async function renderMedia() {
  await loadMedia();
  content.innerHTML = `<h2>رسانه</h2><p class="sub">فایل‌های آپلود شده.</p>
    <div class="card"><input type="file" id="media-upload"><button class="btn" onclick="uploadMedia()">آپلود</button></div>
    <div class="grid2" style="margin-top:16px">${media.map((m) => `<div class="list-item"><div class="row"><img src="${m.path}" class="preview"><div><strong>${m.name}</strong><br><span style="color:#9ba6b5">${Math.round(m.size / 1024)} کیلوبایت</span></div></div><button class="btn danger" onclick="deleteMedia('${m.path}')">حذف</button></div>`).join('')}</div>`;
}
async function uploadMedia() { const file = document.getElementById('media-upload').files[0]; if (!file) return; const buffer = await file.arrayBuffer(); await fetch('/api/media?name=' + encodeURIComponent(file.name), { method: 'POST', body: buffer }); renderMedia(); }
async function deleteMedia(p) { await api('/api/media', { method: 'DELETE', body: JSON.stringify({ path: p }), headers: { 'Content-Type': 'application/json' } }); renderMedia(); }

async function startDev() { const r = await api('/api/dev', { method: 'POST' }); alert(r.message || 'شروع شد'); }

function openPreview() { window.open('http://localhost:3000', '_blank'); }

async function runBuild() {
  if (!confirm('آیا مطمئن هستید که می‌خواهید سایت استاتیک را تولید کنید؟')) return;
  content.innerHTML = '<h2>در حال ساخت...</h2><p class="sub">لطفاً صبر کنید.</p>';
  const r = await api('/api/build', { method: 'POST' });
  content.innerHTML = `<h2>ساخت ${r.ok ? 'موفق' : 'ناموفق'}</h2><pre style="background:#111a27;padding:16px;border-radius:8px;overflow:auto;max-height:400px">${r.output || ''}</pre>`;
}

async function publishToGitHub() {
  if (!confirm('تغییرات به گیت‌هاب منتشر شود؟')) return;
  content.innerHTML = '<h2>در حال انتشار...</h2><p class="sub">لطفاً صبر کنید.</p>';
  const r = await api('/api/publish', { method: 'POST' });
  let html = `<h2>انتشار ${r.ok ? 'موفق' : 'ناموفق'}</h2>`;
  if (r.steps) {
    html += r.steps.map((s) => `<div class="card"><h3>${s.step} — ${s.ok ? 'موفق' : 'ناموفق'}</h3><pre style="background:#111a27;padding:12px;border-radius:8px;overflow:auto;max-height:200px;font-size:.8rem">${s.output || ''}</pre></div>`).join('');
  }
  content.innerHTML = html;
}

function val(id) { return document.getElementById(id).value; }
loadAll();
