import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Companies
  app.get("/api/companies", requireAuth, async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await storage.getCompanies({ page, limit, search });
    res.json(result);
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    const row = await storage.getCompany(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // Contacts
  app.get("/api/contacts", requireAuth, async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await storage.getContacts({ page, limit, search });
    res.json(result);
  });

  app.get("/api/contacts/:id", requireAuth, async (req, res) => {
    const row = await storage.getContact(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // Back-compat endpoints used by old client (minimal)
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    res.json((req as any).user);
  });

  app.post("/api/login", async (_req, res) => {
    res.json({ success: true, user: { id: "local" }, token: "local" });
  });

  return server;
}
