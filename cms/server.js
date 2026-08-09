import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import matter from 'gray-matter';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req) => new Promise((resolve) => { let data = ''; req.on('data', (c) => (data += c)); req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } }); });
const readRawBody = (req) => new Promise((resolve) => { const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => resolve(Buffer.concat(chunks))); });

let devProcess = null;
let buildProcess = null;

const MIME = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf', '.otf':'font/otf', '.ico':'image/x-icon' };

function projectToMarkdown(data) {
  const fm = {
    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    cover: data.cover || '',
    year: data.year || '',
    client: data.client || '',
    role: data.role || '',
    technologies: data.technologies || [],
    categories: data.categories || [],
    videoMode: data.videoMode || 'none',
    videoUrl: data.videoUrl || '',
  };
  return matter.stringify(data.content || '', fm);
}

function runCommand(cmd, args, label, res) {
  const proc = spawn(cmd, args, { cwd: root, shell: true });
  let output = '';
  proc.stdout.on('data', (d) => (output += d.toString()));
  proc.stderr.on('data', (d) => (output += d.toString()));
  proc.on('close', (code) => {
    if (res && !res.writableEnded) send(res, code === 0 ? 200 : 500, { ok: code === 0, output, code });
  });
  return proc;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const method = req.method;
  const pathname = url.pathname;

  if (method === 'OPTIONS') return send(res, 200, '');

  // API routes
  if (pathname.startsWith('/api')) {
    try {
      if (pathname === '/api/site' && method === 'GET') return send(res, 200, readJson('content/site.json'));
      if (pathname === '/api/site' && method === 'POST') { const d = await readBody(req); writeJson('content/site.json', d); return send(res, 200, { ok: true }); }
      if (pathname === '/api/categories' && method === 'GET') return send(res, 200, readJson('content/categories.json'));
      if (pathname === '/api/categories' && method === 'POST') { const d = await readBody(req); writeJson('content/categories.json', d); return send(res, 200, { ok: true }); }
      if (pathname === '/api/resume' && method === 'GET') return send(res, 200, readJson('content/resume.json'));
      if (pathname === '/api/resume' && method === 'POST') { const d = await readBody(req); writeJson('content/resume.json', d); return send(res, 200, { ok: true }); }
      if (pathname === '/api/projects' && method === 'GET') {
        const dir = path.join(root, 'content/projects');
        const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
        const projects = files.map((f) => { const parsed = matter(fs.readFileSync(path.join(dir, f), 'utf8')); return { ...parsed.data, content: parsed.content }; });
        return send(res, 200, projects);
      }
      if (pathname === '/api/projects' && method === 'POST') {
        const d = await readBody(req);
        if (!d.slug) return send(res, 400, { error: 'slug is required' });
        const file = path.join(root, 'content/projects', `${d.slug}.md`);
        fs.writeFileSync(file, projectToMarkdown(d));
        return send(res, 200, { ok: true });
      }
      if (pathname === '/api/projects' && method === 'DELETE') {
        const d = await readBody(req);
        const file = path.join(root, 'content/projects', `${d.slug}.md`);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        return send(res, 200, { ok: true });
      }

      // Media API
      if (pathname === '/api/media' && method === 'GET') {
        const dir = url.searchParams.get('dir') || '';
        const mediaPath = path.join(root, 'public/media', dir);
        if (!fs.existsSync(mediaPath)) return send(res, 200, []);
        return send(res, 200, fs.readdirSync(mediaPath).filter((f) => !f.startsWith('.')).map((f) => { const stat = fs.statSync(path.join(mediaPath, f)); return { name: f, size: stat.size, path: `/media/${dir ? dir + '/' : ''}${f}` }; }));
      }
      if (pathname === '/api/media' && method === 'POST') {
        const dir = url.searchParams.get('dir') || '';
        const name = url.searchParams.get('name') || 'upload.bin';
        const mediaPath = path.join(root, 'public/media', dir);
        if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath, { recursive: true });
        const buffer = await readRawBody(req);
        fs.writeFileSync(path.join(mediaPath, name), buffer);
        return send(res, 200, { ok: true, path: `/media/${dir ? dir + '/' : ''}${name}` });
      }
      if (pathname === '/api/media' && method === 'DELETE') {
        const d = await readBody(req);
        const file = path.join(root, 'public/media', d.path.replace('/media/', ''));
        if (fs.existsSync(file)) fs.unlinkSync(file);
        return send(res, 200, { ok: true });
      }

      // Font API
      if (pathname === '/api/fonts' && method === 'GET') {
        const fontDir = path.join(root, 'public/fonts');
        if (!fs.existsSync(fontDir)) return send(res, 200, []);
        const fonts = [];
        for (const f of fs.readdirSync(fontDir)) {
          const ext = path.extname(f).toLowerCase();
          if (!['.woff2','.woff','.ttf','.otf'].includes(ext)) continue;
          const stat = fs.statSync(path.join(fontDir, f));
          fonts.push({ name: f, path: `/fonts/${f}`, size: stat.size, format: ext.slice(1) });
        }
        return send(res, 200, fonts);
      }
      if (pathname === '/api/fonts' && method === 'POST') {
        const name = url.searchParams.get('name') || 'font.bin';
        const fontDir = path.join(root, 'public/fonts');
        if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });
        const buffer = await readRawBody(req);
        fs.writeFileSync(path.join(fontDir, name), buffer);
        return send(res, 200, { ok: true, path: `/fonts/${name}` });
      }
      if (pathname === '/api/fonts' && method === 'DELETE') {
        const d = await readBody(req);
        const file = path.join(root, 'public/fonts', path.basename(d.path));
        if (fs.existsSync(file)) fs.unlinkSync(file);
        return send(res, 200, { ok: true });
      }

      // Dev server
      if (pathname === '/api/dev' && method === 'POST') {
        if (devProcess && !devProcess.killed) return send(res, 200, { ok: true, message: 'already running' });
        devProcess = spawn('npm', ['run', 'dev'], { cwd: root, shell: true, stdio: 'ignore' });
        return send(res, 200, { ok: true, message: 'started' });
      }

      // Build
      if (pathname === '/api/build' && method === 'POST') {
        if (buildProcess && !buildProcess.killed) return send(res, 200, { ok: false, message: 'build already running' });
        buildProcess = runCommand('npm', ['run', 'build'], 'build', res);
        return;
      }

      // Publish to GitHub
      if (pathname === '/api/publish' && method === 'POST') {
        const steps = [];
        const gitAdd = spawn('git', ['add', '-A'], { cwd: root, shell: true });
        let output = '';
        gitAdd.stdout.on('data', (d) => (output += d.toString()));
        gitAdd.stderr.on('data', (d) => (output += d.toString()));
        gitAdd.on('close', (code1) => {
          steps.push({ step: 'git add', ok: code1 === 0, output });
          const commit = spawn('git', ['commit', '-m', 'Update site content via CMS'], { cwd: root, shell: true });
          let out2 = '';
          commit.stdout.on('data', (d) => (out2 += d.toString()));
          commit.stderr.on('data', (d) => (out2 += d.toString()));
          commit.on('close', (code2) => {
            steps.push({ step: 'git commit', ok: code2 === 0, output: out2 });
            const push = spawn('git', ['push'], { cwd: root, shell: true });
            let out3 = '';
            push.stdout.on('data', (d) => (out3 += d.toString()));
            push.stderr.on('data', (d) => (out3 += d.toString()));
            push.on('close', (code3) => {
              steps.push({ step: 'git push', ok: code3 === 0, output: out3 });
              const allOk = steps.every((s) => s.ok);
              return send(res, allOk ? 200 : 500, { ok: allOk, steps });
            });
          });
        });
        return;
      }

      return send(res, 404, { error: 'not found' });
    } catch (e) {
      return send(res, 500, { error: String(e) });
    }
  }

  // Serve static files from public/ (media, fonts) then cms/public/
  if (pathname !== '/') {
    const publicFile = path.join(root, 'public', pathname);
    if (fs.existsSync(publicFile) && fs.statSync(publicFile).isFile()) {
      const type = MIME[path.extname(publicFile)] || 'application/octet-stream';
      return send(res, 200, fs.readFileSync(publicFile), type);
    }
  }

  // Serve CMS static files
  const filePath = path.join(root, 'cms/public', pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const type = MIME[path.extname(filePath)] || 'text/plain';
    return send(res, 200, fs.readFileSync(filePath), type);
  }
  return send(res, 404, 'not found');
});

server.listen(3100, () => console.log('CMS running at http://localhost:3100'));
