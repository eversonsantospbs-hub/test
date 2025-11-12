/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para funcionar no ambiente Lasy
  assetPrefix: "",
  basePath: "",
  
  // Configurações para melhor compatibilidade de deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Configurações para Vercel
  output: 'standalone',
  
  // Configurações experimentais para melhor performance
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

module.exports = nextConfig;