import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

function validate() {
  // site.json
  const site = readJson('content/site.json');
  if (!site.name) fail('site.json: name is required');
  if (!site.title) fail('site.json: title is required');
  if (!site.theme) fail('site.json: theme is required');
  if (site.theme && !['light', 'dark', 'system'].includes(site.theme.mode)) fail('site.json: theme.mode must be light, dark, or system');

  // categories.json
  const categoriesRaw = readJson('content/categories.json');
  const categories = [...(categoriesRaw.projects || []), ...(categoriesRaw.posts || [])];
  const catSlugs = new Set();
  for (const cat of categories) {
    if (!cat.slug) fail('category missing slug');
    if (catSlugs.has(cat.slug)) fail(`duplicate category slug: ${cat.slug}`);
    catSlugs.add(cat.slug);
    if (cat.parent && !catSlugs.has(cat.parent) && !categories.find((c) => c.slug === cat.parent)) fail(`category "${cat.slug}" has invalid parent "${cat.parent}"`);
  }
  // circular check
  for (const cat of categories) {
    let current = cat;
    const seen = new Set();
    while (current && current.parent) {
      if (seen.has(current.slug)) { fail(`circular category reference: ${cat.slug}`); break; }
      seen.add(current.slug);
      current = categories.find((c) => c.slug === current.parent);
    }
  }

  // projects
  const dir = path.join(root, 'content/projects');
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const parsed = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const d = parsed.data;
      if (!d.slug) fail(`${file}: slug is required`);
      if (!d.title) fail(`${file}: title is required`);
      if (d.categories) for (const c of d.categories) if (!catSlugs.has(c)) fail(`${file}: invalid category "${c}"`);
      if (d.videoMode && !['youtube', 'embed', 'none'].includes(d.videoMode)) fail(`${file}: invalid videoMode`);
      if (d.cover && !fs.existsSync(path.join(root, 'public', d.cover.replace(/^\//, '')))) fail(`${file}: cover image not found: ${d.cover}`);
    }
  }

  // resume.json
  const resume = readJson('content/resume.json');
  if (!resume.summary) fail('resume.json: summary is required');

  if (errors.length) { console.error('\n❌ Validation failed:'); for (const e of errors) console.error('  - ' + e); process.exit(1); }
  console.log('✅ Content is valid.');
}

validate();
