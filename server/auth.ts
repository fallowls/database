import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "./db";
import { users, authSessions } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";

const SALT_ROUNDS = 10;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

// ── Register ──────────────────────────────────────────────
export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, message: "Email already registered" };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    })
    .returning();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(authSessions).values({
    userId: user.id,
    token,
    expiresAt,
  });

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

// ── Login ─────────────────────────────────────────────────
export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  if (!user.isActive) {
    return { success: false, message: "Account is disabled" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, message: "Invalid email or password" };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(authSessions).values({
    userId: user.id,
    token,
    expiresAt,
  });

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

// ── Validate session token ────────────────────────────────
export async function validateSession(token: string) {
  if (!token) return { valid: false, user: null };

  const [session] = await db
    .select()
    .from(authSessions)
    .where(
      and(
        eq(authSessions.token, token),
        gt(authSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) return { valid: false, user: null };

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || !user.isActive) return { valid: false, user: null };

  return {
    valid: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

// ── Logout ────────────────────────────────────────────────
export async function invalidateSession(token: string) {
  await db.delete(authSessions).where(eq(authSessions.token, token));
}

// ── Express middleware ────────────────────────────────────
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    (req.query.token as string);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const { valid, user } = await validateSession(token);

  if (!valid || !user) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  (req as any).user = user;
  next();
}

// ── Helpers ───────────────────────────────────────────────
export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function initializeDefaultUser(): Promise<void> {
  // Create a default admin user if none exists
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", SALT_ROUNDS);
    await db.insert(users).values({
      name: "Admin",
      email: "admin@closo.com",
      passwordHash,
      role: "admin",
    });
    console.log("Default admin user created: admin@closo.com / admin123");
  }
}
