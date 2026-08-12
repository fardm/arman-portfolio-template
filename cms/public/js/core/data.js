import { state } from './state.js';
import { api } from './api.js';
import { show, render } from './router.js';

export async function loadAll() {
  const [siteData, categoriesData, resumeData, projectsData, pagesData, menuData, postsData, postCategoriesData] = await Promise.all([
    api('/api/site'),
    api('/api/categories'),
    api('/api/resume'),
    api('/api/projects'),
    api('/api/pages').catch(()=>[]),
    api('/api/menu').catch(()=>[]),
    api('/api/posts').catch(()=>[]),
    api('/api/post_categories').catch(()=>[])
  ]);

  state.site = siteData;
  state.categories = categoriesData;
  state.resume = resumeData;
  state.projects = projectsData;
  state.pagesList = pagesData;
  state.siteMenu = menuData;
  state.posts = postsData;
  state.postCategories = postCategoriesData;

  const hash = window.location.hash.slice(1);
  if (hash) {
    show(hash, false);
  } else {
    render();
  }
}

export async function loadFonts() {
  state.fonts = await api('/api/fonts');
}

export async function loadMedia() {
  state.media = await api('/api/media');
}
