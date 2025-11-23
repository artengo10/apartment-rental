/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем SWC минификацию (по умолчанию в Next.js 16)
  swcMinify: true,
  // Экспериментальные фичи для лучшей совместимости
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "jsonwebtoken"],
  },
};

module.exports = nextConfig;
