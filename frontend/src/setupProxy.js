const { createProxyMiddleware } = require('http-proxy-middleware');
const FLASK_API = 'http://localhost:5001'

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: FLASK_API,
      changeOrigin: true,
    })
  );
  app.use(
    '/auth',
    createProxyMiddleware({
      target: FLASK_API,
      changeOrigin: true,
    })
  );
};