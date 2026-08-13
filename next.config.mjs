
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let basePath;
try {
  const siteConfigPath = path.join(process.cwd(), 'content', 'site.json');
  if (fs.existsSync(siteConfigPath)) {
    const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
    if (siteConfig.urlType === 'github') {
      try {
        const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
        const match = remoteUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
        if (match) {
          const [, username, repo] = match;
          if (repo !== `${username}.github.io`) {
            basePath = `/${repo}`;
          }
        }
      } catch (e) {
        console.warn('Failed to get remote origin url for base path generation');
      }
    }
  }
} catch (e) {
  console.error('Error computing basePath:', e);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );
    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
          use: ['@svgr/webpack'],
        }
      );
      fileLoaderRule.exclude = /\.svg$/i;
    } else {
       config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
       });
    }
    return config;
  },
};
export default nextConfig;
