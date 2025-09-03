const isTest = process.env.NODE_ENV === "test";

function logger(req, res, next) {
  if (!isTest) {
    console.log(`[${new Date().toISOString()}] IP: ${req.ip} - ${req.method} ${req.url}`);
  }
  next();
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not Found" });
}

module.exports = { logger, notFoundHandler };
