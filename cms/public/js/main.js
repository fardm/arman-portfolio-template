import { state, dom } from './core/state.js';
import { api } from './core/api.js';
import { loadAll, loadFonts, loadMedia } from './core/data.js';
import { show, render, toggleGroup } from './core/router.js';
import { openMediaModal, closeMediaModal, selectMediaFromModal, uploadMediaFromModal, toggleMediaModalGalleryMode, confirmMediaSelection } from './components/media-modal.js';
import { newProject, editProject, duplicateProject, deleteProject, toggleCat, saveProject, onTemplateChange, onVideoSourceChange, openCoverPickerModal, uploadCoverFromModal, selectCover } from './views/projects.js';
import { openPostCatModal, savePostCat, deletePostCat } from './views/post-categories.js';
import { newPost, editPost, duplicatePost, deletePost, savePost } from './views/posts.js';
import { openCatModal, saveCat, deleteCat } from './views/categories.js';
import { addExp, renderExp, addEdu, renderEdu, addLink, renderLinks, saveResume, cancelResume } from './views/resume.js';
import { uploadMedia, deleteMedia, openLightbox } from './views/media.js';
import { saveSettings } from './views/settings.js';
import { saveTheme, onThemeModeSelect, onAutoBaseColorChange, copyToManualAndSwitch, syncCustomColors } from './views/theme.js';
import { openFontModal, toggleFontSourceModal, onFontFileSelected, handleFontDrop, saveFontModal, deleteSiteFont, updateTypoAuto } from './views/typography.js';
import { startPublish, renderPublish, startLocalTest } from './views/publish.js';
import { newPage, editPage, deletePage, savePage } from './views/pages.js';
import { addMenuItem, deleteMenuItem, saveMenu, saveMenuAuto, handleDragStartMenu, handleDragOverMenu, handleDropMenu, handleDragEndMenu } from './views/menu.js';
import { saveHero, cancelHero } from './views/hero.js';

// Expose router functions for inline HTML handlers
window.show = show;
window.render = render;
window.toggleGroup = toggleGroup;

// Expose preview handler
window.openPreview = async function openPreview() {
  const win = window.open('about:blank', '_blank');
  try {
    await api('/api/dev', { method: 'POST' });

    // wait for preview helper
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
};

// Expose other components needed in HTML or dynamically generated strings
window.openMediaModal = openMediaModal;
window.toggleMediaModalGalleryMode = toggleMediaModalGalleryMode;
window.confirmMediaSelection = confirmMediaSelection;
window.closeMediaModal = closeMediaModal;
window.selectMediaFromModal = selectMediaFromModal;
window.uploadMediaFromModal = uploadMediaFromModal;

window.newProject = newProject;
window.editProject = editProject;
window.duplicateProject = duplicateProject;
window.deleteProject = deleteProject;
window.toggleCat = toggleCat;
window.saveProject = saveProject;
window.onTemplateChange = onTemplateChange;
window.onVideoSourceChange = onVideoSourceChange;
window.openCoverPickerModal = openCoverPickerModal;
window.uploadCoverFromModal = uploadCoverFromModal;
window.selectCover = selectCover;

window.openPostCatModal = openPostCatModal;
window.savePostCat = savePostCat;
window.deletePostCat = deletePostCat;

window.newPost = newPost;
window.editPost = editPost;
window.duplicatePost = duplicatePost;
window.deletePost = deletePost;
window.savePost = savePost;

window.openCatModal = openCatModal;
window.saveCat = saveCat;
window.deleteCat = deleteCat;

window.addExp = addExp;
window.renderExp = renderExp;
window.addEdu = addEdu;
window.renderEdu = renderEdu;
window.addLink = addLink;
window.renderLinks = renderLinks;
window.saveResume = saveResume;
window.cancelResume = cancelResume;

window.uploadMedia = uploadMedia;
window.deleteMedia = deleteMedia;
window.openLightbox = openLightbox;

window.saveSettings = saveSettings;

window.saveTheme = saveTheme;
window.onThemeModeSelect = onThemeModeSelect;
window.onAutoBaseColorChange = onAutoBaseColorChange;
window.copyToManualAndSwitch = copyToManualAndSwitch;
window.syncCustomColors = syncCustomColors;

window.openFontModal = openFontModal;
window.toggleFontSourceModal = toggleFontSourceModal;
window.onFontFileSelected = onFontFileSelected;
window.handleFontDrop = handleFontDrop;
window.saveFontModal = saveFontModal;
window.deleteSiteFont = deleteSiteFont;
window.updateTypoAuto = updateTypoAuto;

window.startPublish = startPublish;
window.renderPublish = renderPublish;
window.startLocalTest = startLocalTest;

window.newPage = newPage;
window.editPage = editPage;
window.deletePage = deletePage;
window.savePage = savePage;

window.addMenuItem = addMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.handleDragStartMenu = handleDragStartMenu;
window.handleDragOverMenu = handleDragOverMenu;
window.handleDropMenu = handleDropMenu;
window.handleDragEndMenu = handleDragEndMenu;

window.saveHero = saveHero;
window.cancelHero = cancelHero;

window.state = state; // Useful for debugging

// Initialize the app
loadAll();
window.saveMenu = saveMenu;
window.saveMenuAuto = saveMenuAuto;
window.toggleAdminTheme = window.toggleAdminTheme || function() {};
