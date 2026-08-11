import { state, dom } from '../core/state.js';
import { api } from '../core/api.js';
import { loadAll } from '../core/data.js';
import { show } from '../core/router.js';
import { val } from '../utils/helpers.js';

export function renderHero() {
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
