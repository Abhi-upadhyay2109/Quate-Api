const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const quotes = require("./quotes");
const { logger, notFoundHandler } = require("./middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(logger); 

// Session setup    
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true, 
    cookie: {
      maxAge: 60 * 1000, 
      httpOnly: true,
      secure: false, 
    },
  })
);

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  handler: (req, res) => {
    const retrySecs = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: `Too many login attempts. Try again in ${retrySecs} seconds.`,
      retrySecs,
    });
  },
});

const quoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  handler: (req, res) => {
    const retrySecs = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${retrySecs} seconds.`,
      retrySecs,
    });
  },
});

// Swagger setup (unchanged)
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quote API",
      version: "1.0.0",
      description: "Simple API with session-based login and rate limiting",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./app.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login with session
 *     description: Logs in the user and starts a session. Limited to 3 attempts per minute.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Already logged in
 *       429:
 *         description: Too many login attempts
 */
app.post("/api/login", loginLimiter, (req, res) => {
  if (req.session.isLoggedIn) {
    return res.status(400).json({ error: "Already logged in" });
  }
  req.session.isLoggedIn = true;
  req.session.username = req.body.username || "guest";
  res.json({ message: "Login successful" });
});

/**
 * @swagger
 * /api/quote:
 *   get:
 *     summary: Get a random quote
 *     description: Returns a random inspirational quote. Requires login and allows 5 requests per minute.
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: Random quote returned
 *       401:
 *         description: Unauthorized (login required)
 *       429:
 *         description: Too many quote requests
 */
app.get("/api/quote", quoteLimiter, (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ error: "Unauthorized. Please login first." });
  }

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: randomQuote });
});

app.use(notFoundHandler);

module.exports = app;
