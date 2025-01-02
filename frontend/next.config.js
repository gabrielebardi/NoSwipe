/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/static/:path*',
        destination: 'http://localhost:8000/static/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://localhost:8000/media/:path*',
      },
    ]
  },
}

module.exports = nextConfig