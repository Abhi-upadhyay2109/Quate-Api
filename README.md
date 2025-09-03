#  Quote API

A simple Express.js API that provides **session-based authentication**, **rate limiting**, and **Swagger API documentation**.  
Users can log in, fetch random quotes, and are protected by per-endpoint rate limits.

---

##  Features
- **Session-based login** (using `express-session`)
- **Rate limiting** for login (3 per minute) and quote requests (5 per minute)
- **Swagger UI** API docs at `/api-docs`
- **Random quotes** served from a local dataset
- **Custom middleware** for logging and 404 handling
- **Supertest + Jest** tests included

---

##  Tech Stack
- [Express.js](https://expressjs.com/)
- [express-session](https://www.npmjs.com/package/express-session)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)
- [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)
- [Jest](https://jestjs.io/) + [Supertest](https://www.npmjs.com/package/supertest) (for testing)

---

##  Project Structure
├── app.js # Main application (routes, swagger, session, rate limiters)
├── server.js # Server entry point
├── quotes.js # Array of quotes
├── middleware.js # Logger + 404 handler
├── server.test.js # Jest + Supertest tests
├── package.json
└── README.md


---

##  Installation & Setup

```bash
# Clone repo
git clone https://github.com/Abhi-upadhyay2109/Quate-Api.git
cd quote-api

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Or run normally
npm start
API Documentation

After starting the server, visit:
 http://localhost:5000/api-docs

Endpoints
POST /api/login

Starts a new session

Rate limited: 3 requests per minute

Responses

200 OK → { "message": "Login successful" }

400 Bad Request → { "error": "Already logged in" }

429 Too Many Requests → { "error": "Too many login attempts" }

GET /api/quote

Returns a random quote

Requires login

Rate limited: 5 requests per minute

Responses

200 OK → { "quote": "Some inspirational quote" }

401 Unauthorized → { "error": "Unauthorized. Please login first." }

429 Too Many Requests → { "error": "Too many quote requests" }

 Running Tests

We use Jest + Supertest for API testing
