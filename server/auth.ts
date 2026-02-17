/**
 * Auth is intentionally disabled.
 *
 * The previous CRM schema relied on users/sessions tables which do not exist
 * in the Neon DB instance we are aligning to.
 */
import type { Request, Response, NextFunction } from "express";

export async function initializeDefaultUser(): Promise<void> {
  // no-op
}

export async function authenticateUser(_email: string, _password: string) {
  return { success: true, user: { id: "local", email: "local" }, token: "local" };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  (req as any).user = { id: "local", email: "local" };
  next();
}

export function validateAuthToken(_token?: string) {
  return { valid: true, user: { id: "local", email: "local" } };
}
