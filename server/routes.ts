import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  requireAuth,
  authenticateUser,
  registerUser,
  validateSession,
  invalidateSession,
  initializeDefaultUser,
} from "./auth";
import { extensionRouter } from "./extension-routes";

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  await initializeDefaultUser();

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ── Auth ────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields required" });
      const result = await registerUser(name, email, password);
      if (!result.success) return res.status(409).json(result);
      res.json(result);
    } catch (e) { console.error("Register:", e); res.status(500).json({ success: false, message: "Server error" }); }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
      const result = await authenticateUser(email, password);
      if (!result.success) return res.status(401).json(result);
      res.json(result);
    } catch (e) { console.error("Login:", e); res.status(500).json({ success: false, message: "Server error" }); }
  });

  app.get("/api/auth/user", requireAuth, (req, res) => res.json({ user: (req as any).user }));

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) await invalidateSession(token);
    res.json({ success: true });
  });

  app.get("/api/auth/validate", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ valid: false });
    const result = await validateSession(token);
    if (!result.valid) return res.status(401).json({ valid: false });
    res.json({ valid: true, user: result.user });
  });

  // ── Dashboard Stats ─────────────────────────────────────
  app.get("/api/stats", requireAuth, async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (e) { console.error("Stats:", e); res.status(500).json({ message: "Failed to load stats" }); }
  });

  // ── User Management (admin only) ───────────────────────
  app.get("/api/users", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const usersList = await storage.listUsers();
      res.json({ users: usersList });
    } catch (e) { console.error("List users:", e); res.status(500).json({ message: "Failed to load users" }); }
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email, password required" });
      const result = await registerUser(name, email, password);
      if (!result.success) return res.status(409).json(result);
      // Update role if specified
      if (role && result.user) {
        await storage.updateUser(result.user.id, { role });
      }
      res.json(result);
    } catch (e) { console.error("Create user:", e); res.status(500).json({ success: false, message: "Server error" }); }
  });

  app.patch("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, role, isActive, planId } = req.body;
      const updated = await storage.updateUser(req.params.id, { name, role, isActive, planId });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, user: updated });
    } catch (e) { console.error("Update user:", e); res.status(500).json({ message: "Failed to update user" }); }
  });

  app.delete("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Prevent deleting yourself
      if ((req as any).user?.id === req.params.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (e) { console.error("Delete user:", e); res.status(500).json({ message: "Failed to delete user" }); }
  });

  // ── Prospects (core.leads) ──────────────────────────────
  app.get("/api/prospects", requireAuth, async (req, res) => {
    try {
      const result = await storage.getProspects({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 25,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        industry: typeof req.query.industry === "string" ? req.query.industry : undefined,
        seniority: typeof req.query.seniority === "string" ? req.query.seniority : undefined,
        source: typeof req.query.source === "string" ? req.query.source : undefined,
        hasEmail: req.query.hasEmail === "true",
        hasPhone: req.query.hasPhone === "true",
      });
      res.json(result);
    } catch (e) { console.error("Prospects:", e); res.status(500).json({ message: "Failed to load prospects" }); }
  });

  app.get("/api/prospects/:id", requireAuth, async (req, res) => {
    const row = await storage.getProspect(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  // ── Companies (core.companies) ──────────────────────────
  app.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const result = await storage.getCompanies({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 25,
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        industry: typeof req.query.industry === "string" ? req.query.industry : undefined,
      });
      res.json(result);
    } catch (e) { console.error("Companies:", e); res.status(500).json({ message: "Failed to load companies" }); }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    const row = await storage.getCompany(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });
    res.json(row);
  });

  app.get("/api/companies/:id/prospects", requireAuth, async (req, res) => {
    const prospects = await storage.getCompanyProspects(req.params.id);
    res.json({ prospects });
  });

  // ── Backward compat ─────────────────────────────────────
  app.get("/api/contacts", requireAuth, async (req, res) => {
    const result = await storage.getContacts({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 25,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
    });
    res.json(result);
  });

  // ── Chrome Extension ────────────────────────────────────
  app.use("/api/extension", extensionRouter);
  app.get("/extension-auth", (_req, res) => res.redirect("/"));

  return server;
}
