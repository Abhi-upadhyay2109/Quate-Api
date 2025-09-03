const request = require("supertest");
const app = require("./app");

describe("Quote API Server", () => {
  let agent;

  beforeEach(() => {
    
    agent = request.agent(app);
  });

  test("GET /api-docs should return swagger docs page", async () => {
    const res = await request(app).get("/api-docs/").redirects(1);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });

  test("GET /unknown should return 404 handler", async () => {
    const res = await request(app).get("/unknown");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Not Found");
  });

  describe("POST /api/login", () => {
    test("should login successfully", async () => {
      const res = await agent.post("/api/login").send({ username: "test" });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Login successful");
    });

    test("should return 400 if already logged in", async () => {
      await agent.post("/api/login").send({ username: "test" });
      const res = await agent.post("/api/login").send({ username: "test" });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Already logged in");
    });

    test("should return 429 if too many login attempts", async () => {
      await agent.post("/api/login").send({ username: "test" });
      await agent.post("/api/login").send({ username: "test" });
      await agent.post("/api/login").send({ username: "test" });
      const res = await agent.post("/api/login").send({ username: "test" });
      expect(res.statusCode).toBe(429);
      expect(res.body.error).toContain("Too many login attempts");
    });
  });

  describe("GET /api/quote", () => {
    test("should return 401 if not logged in", async () => {
      const res = await request(app).get("/api/quote"); 
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe("Unauthorized. Please login first.");
    });

    test("should return a random quote if logged in", async () => {
      await agent.post("/api/login").send({ username: "test" }); 
      const res = await agent.get("/api/quote");
      expect(res.statusCode).toBe(200);
      expect(res.body.quote).toBeDefined();
    });

    test("should return 429 if quote rate limit exceeded", async () => {
      await agent.post("/api/login").send({ username: "test" }); 
      for (let i = 0; i < 5; i++) {
        await agent.get("/api/quote");
      }
      const res = await agent.get("/api/quote"); 
      expect(res.statusCode).toBe(429);
      expect(res.body.error).toMatch(/^Rate limit exceeded\. Try again in \d+ seconds\.$/);
    });
  });
});
