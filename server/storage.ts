import { db } from "./db";
import { company, contacts, type Company, type Contact } from "@shared/schema";
import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  getCompanies(params: { page?: number; limit?: number; search?: string }): Promise<{ companies: Company[]; total: number }>;
  getCompany(companyId: string): Promise<Company | undefined>;

  getContacts(params: { page?: number; limit?: number; search?: string }): Promise<{ contacts: Contact[]; total: number }>;
  getContact(contactId: string): Promise<Contact | undefined>;
}

export class Storage implements IStorage {
  async getCompanies(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(200, Math.max(1, params.limit ?? 50));
    const offset = (page - 1) * limit;

    const where = params.search
      ? or(
          ilike(company.companyName, `%${params.search}%`),
          ilike(company.companyDomainNormalized, `%${params.search}%`),
          ilike(company.companyWebsite, `%${params.search}%`),
          ilike(company.companyLinkedinUrl, `%${params.search}%`)
        )
      : undefined;

    const rows = await db
      .select()
      .from(company)
      .where(where)
      .orderBy(desc(company.updatedAt), asc(company.companyName))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ c: sql<number>`count(*)` })
      .from(company)
      .where(where)
      .then((r) => Number(r[0]?.c ?? 0));

    return { companies: rows, total };
  }

  async getCompany(companyId: string) {
    const rows = await db.select().from(company).where(eq(company.companyId, companyId as any)).limit(1);
    return rows[0];
  }

  async getContacts(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(200, Math.max(1, params.limit ?? 50));
    const offset = (page - 1) * limit;

    const where = params.search
      ? or(
          ilike(contacts.firstName, `%${params.search}%`),
          ilike(contacts.lastName, `%${params.search}%`),
          ilike(contacts.emailPrimary, `%${params.search}%`),
          ilike(contacts.linkedinPersonUrl, `%${params.search}%`),
          ilike(contacts.companyName, `%${params.search}%`),
          ilike(contacts.companyDomain, `%${params.search}%`)
        )
      : undefined;

    const rows = await db
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.updatedAt), asc(contacts.lastName))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ c: sql<number>`count(*)` })
      .from(contacts)
      .where(where)
      .then((r) => Number(r[0]?.c ?? 0));

    return { contacts: rows, total };
  }

  async getContact(contactId: string) {
    const rows = await db.select().from(contacts).where(eq(contacts.contactId, contactId as any)).limit(1);
    return rows[0];
  }
}

export const storage = new Storage();
