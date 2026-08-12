
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
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
