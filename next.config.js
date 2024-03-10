module.exports = {
  swcMinify: false,
  trailingSlash: true,
  env: {
    // HOST
    HOST_API_KEY: 'http://localhost:8001',
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACK_URL}/api/:path*`,
      },
    ]
  },
  env: {
    BACK_URL: process.env.BACK_URL,
    API_URL: process.env.API_URL,
    SOCKET_URL: process.env.SOCKET_URL,
    DEVELOPER_USER_NAME: process.env.DEVELOPER_USER_NAME,
    DEVELOPER_USER_PW: process.env.DEVELOPER_USER_PW,
    FRONT_URL: process.env.FRONT_URL,
  }
};
