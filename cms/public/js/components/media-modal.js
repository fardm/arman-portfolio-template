import { state } from '../core/state.js';
import { api } from '../core/api.js';
import { loadMedia } from '../core/data.js';

export async function openMediaModal(callback) {
  state.mediaModalCallback = callback;
  const modal = document.getElementById('media-modal');
  if (modal) {
      modal.style.display = 'flex';
  }
  await loadMedia();
  renderMediaModalGrid();
}

export function closeMediaModal() {
  const modal = document.getElementById('media-modal');
  if (modal) {
      modal.style.display = 'none';
  }
  state.mediaModalCallback = null;
}

export function renderMediaModalGrid() {
  const grid = document.getElementById('media-modal-grid');
  if (!grid) return;
  if (!state.media.length) {
    grid.innerHTML = '<p style="color:#9ba6b5">هیچ رسانه‌ای موجود نیست.</p>';
    return;
  }
  grid.innerHTML = state.media.map((m) => `<div class="list-item" style="cursor:pointer" onclick="selectMediaFromModal('${m.path}')"><div class="row"><img src="${m.path}" class="preview"><strong>${m.name}</strong></div></div>`).join('');
}

export function selectMediaFromModal(path) {
  if (state.mediaModalCallback) state.mediaModalCallback(path);
  closeMediaModal();
}

export async function uploadMediaFromModal() {
  const fileInput = document.getElementById('media-modal-upload');
  const file = fileInput.files[0];
  if (!file) return alert('لطفاً یک فایل انتخاب کنید.');
  const buf = await file.arrayBuffer();
  const res = await api('/api/media?name=' + encodeURIComponent(file.name), {
    method: 'POST',
    body: buf,
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  if (res.ok) {
    fileInput.value = ''; // Reset input
    await loadMedia();
    selectMediaFromModal(res.path);
  } else {
    alert('خطا در آپلود');
  }
}
