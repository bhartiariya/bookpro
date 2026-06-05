const http    = require('http');
const app     = require('./app');
const db      = require('./config/db');
const redis   = require('./config/redis');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Both connections verified in their config files on import
    // Connect redis explicitly (lazyConnect was true)
    await redis.connect();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown — don't kill in-flight requests
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    db.end();
    redis.quit();
    process.exit(0);
  });
});

startServer();
