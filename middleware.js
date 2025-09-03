const logger = (req, res, next) => {
  const clientIp = req.ip;
  console.log(`[${new Date().toISOString()}] IP: ${clientIp} - ${req.method} ${req.url}`);
  next();
};

// 404 handler middleware (last me use karna hai)
const notFoundHandler = (req, res) => {
  console.log(`Response to IP ${req.ip}: 404 Not Found`);
  res.status(404).json({ error: "Not Found" });
};

module.exports = { logger, notFoundHandler };