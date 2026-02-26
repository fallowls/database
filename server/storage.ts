import { db } from "./db";
import { company, contacts, users, type Company, type Contact, type User } from "@shared/schema";
import { asc, desc, eq, ilike, or, and, isNotNull, sql, ne } from "drizzle-orm";

export class Storage {
  // ═══════════════════════════════════════════════════════
  // Dashboard Stats
  // ═══════════════════════════════════════════════════════
  async getDashboardStats() {
    const [totalProspects, totalCompanies, withEmail, withPhone, withLinkedin] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(contacts).then(r => Number(r[0]?.c ?? 0)),
      db.select({ c: sql<number>`count(*)` }).from(company).then(r => Number(r[0]?.c ?? 0)),
      db.select({ c: sql<number>`count(*)` }).from(contacts)
        .where(and(isNotNull(contacts.emailPrimary), ne(contacts.emailPrimary, '')))
        .then(r => Number(r[0]?.c ?? 0)),
      db.select({ c: sql<number>`count(*)` }).from(contacts)
        .where(and(isNotNull(contacts.phoneMobile), ne(contacts.phoneMobile, '')))
        .then(r => Number(r[0]?.c ?? 0)),
      db.select({ c: sql<number>`count(*)` }).from(contacts)
        .where(and(isNotNull(contacts.linkedinPersonUrl), ne(contacts.linkedinPersonUrl, '')))
        .then(r => Number(r[0]?.c ?? 0)),
    ]);

    // Top industries
    const topIndustries = await db
      .select({ industry: contacts.industry, count: sql<number>`count(*)` })
      .from(contacts)
      .where(isNotNull(contacts.industry))
      .groupBy(contacts.industry)
      .orderBy(desc(sql`count(*)`))
      .limit(8);

    // Seniority breakdown
    const seniorityBreakdown = await db
      .select({ level: contacts.seniorityLevel, count: sql<number>`count(*)` })
      .from(contacts)
      .where(isNotNull(contacts.seniorityLevel))
      .groupBy(contacts.seniorityLevel)
      .orderBy(desc(sql`count(*)`))
      .limit(6);

    // Top sources
    const topSources = await db
      .select({ source: contacts.source, count: sql<number>`count(*)` })
      .from(contacts)
      .where(isNotNull(contacts.source))
      .groupBy(contacts.source)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return {
      totalProspects,
      totalCompanies,
      withEmail,
      withPhone,
      withLinkedin,
      topIndustries: topIndustries.map(r => ({ name: r.industry!, count: Number(r.count) })),
      seniorityBreakdown: seniorityBreakdown.map(r => ({ level: r.level!, count: Number(r.count) })),
      topSources: topSources.map(r => ({ source: r.source!, count: Number(r.count) })),
    };
  }

  // ═══════════════════════════════════════════════════════
  // Prospects (core.leads)
  // ═══════════════════════════════════════════════════════
  async getProspects(params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    seniority?: string;
    source?: string;
    hasEmail?: boolean;
    hasPhone?: boolean;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (params.search) {
      conditions.push(
        or(
          ilike(contacts.firstName, `%${params.search}%`),
          ilike(contacts.lastName, `%${params.search}%`),
          ilike(contacts.emailPrimary, `%${params.search}%`),
          ilike(contacts.companyName, `%${params.search}%`),
          ilike(contacts.titleRaw, `%${params.search}%`),
          ilike(contacts.linkedinPersonUrl, `%${params.search}%`)
        )
      );
    }

    if (params.industry) {
      conditions.push(ilike(contacts.industry, `%${params.industry}%`));
    }
    if (params.seniority) {
      conditions.push(ilike(contacts.seniorityLevel, params.seniority));
    }
    if (params.source) {
      conditions.push(eq(contacts.source, params.source));
    }
    if (params.hasEmail) {
      conditions.push(and(isNotNull(contacts.emailPrimary), ne(contacts.emailPrimary, '')));
    }
    if (params.hasPhone) {
      conditions.push(and(isNotNull(contacts.phoneMobile), ne(contacts.phoneMobile, '')));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db.select().from(contacts).where(where)
        .orderBy(desc(contacts.updatedAt), asc(contacts.lastName))
        .limit(limit).offset(offset),
      db.select({ c: sql<number>`count(*)` }).from(contacts).where(where)
        .then(r => Number(r[0]?.c ?? 0)),
    ]);

    return { prospects: rows, total: totalResult, page, limit };
  }

  async getProspect(id: string) {
    const [row] = await db.select().from(contacts).where(eq(contacts.leadId, id)).limit(1);
    return row ?? null;
  }

  // ═══════════════════════════════════════════════════════
  // Companies (core.companies)
  // ═══════════════════════════════════════════════════════
  async getCompanies(params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (params.search) {
      conditions.push(
        or(
          ilike(company.companyName, `%${params.search}%`),
          ilike(company.companyDomain, `%${params.search}%`),
          ilike(company.companyWebsite, `%${params.search}%`),
          ilike(company.companyLinkedinUrl, `%${params.search}%`),
          ilike(company.industry, `%${params.search}%`)
        )
      );
    }

    if (params.industry) {
      conditions.push(ilike(company.industry, `%${params.industry}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      db.select().from(company).where(where)
        .orderBy(desc(company.updatedAt), asc(company.companyName))
        .limit(limit).offset(offset),
      db.select({ c: sql<number>`count(*)` }).from(company).where(where)
        .then(r => Number(r[0]?.c ?? 0)),
    ]);

    return { companies: rows, total: totalResult, page, limit };
  }

  async getCompany(id: string) {
    const [row] = await db.select().from(company).where(eq(company.companyId, id)).limit(1);
    return row ?? null;
  }

  async getCompanyProspects(companyId: string, limit = 20) {
    return db.select().from(contacts)
      .where(eq(contacts.companyId, companyId))
      .orderBy(asc(contacts.lastName))
      .limit(limit);
  }

  // ═══════════════════════════════════════════════════════
  // Contacts (alias for backward compat)
  // ═══════════════════════════════════════════════════════
  async getContacts(params: { page?: number; limit?: number; search?: string }) {
    const result = await this.getProspects(params);
    return { contacts: result.prospects, total: result.total };
  }

  async getContact(id: string) {
    return this.getProspect(id);
  }

  // ═══════════════════════════════════════════════════════
  // Users / Auth helpers
  // ═══════════════════════════════════════════════════════
  async getUserById(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user || null;
  }

  async listUsers() {
    return db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      planId: users.planId,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(userId: string, data: { name?: string; role?: string; isActive?: boolean; planId?: string }) {
    const [updated] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated || null;
  }

  async deleteUser(userId: string) {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getSubscriptionPlan(planId: string) {
    const plans: Record<string, { name: string; displayName: string }> = {
      free: { name: "free", displayName: "Free" },
      pro: { name: "pro", displayName: "Pro" },
      enterprise: { name: "enterprise", displayName: "Enterprise" },
    };
    return plans[planId] || plans.free;
  }

  async findContactByLinkedInUrls(linkedinUrl?: string, _salesNavigatorUrl?: string) {
    if (!linkedinUrl) return null;
    const slug = linkedinUrl.replace(/\/$/, "").split("/in/")[1];
    if (!slug) return null;

    const [row] = await db.select().from(contacts)
      .where(ilike(contacts.linkedinPersonUrl, `%${slug}%`))
      .limit(1);

    if (!row) return null;

    return {
      id: row.leadId,
      fullName: `${row.firstName || ""} ${row.lastName || ""}`.trim() || "Unknown",
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.emailPrimary,
      mobilePhone: row.phoneMobile,
      otherPhone: row.phoneWork,
      title: row.titleRaw,
      company: row.companyName,
      industry: row.industry,
      website: row.companyWebsite,
      city: row.personCity,
      state: row.personState,
      country: row.personCountry,
      leadScore: null,
      personLinkedIn: row.linkedinPersonUrl,
      salesNavigatorUrl: null,
    };
  }

  async createProspect(data: any) {
    const [row] = await db.insert(contacts).values({
      firstName: data.firstName,
      lastName: data.lastName,
      emailPrimary: data.email || null,
      linkedinPersonUrl: data.personLinkedIn || null,
      titleRaw: data.title || null,
      companyName: data.company || null,
      source: "chrome_extension",
    }).returning();

    return {
      id: row.leadId,
      fullName: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
      email: row.emailPrimary,
      personLinkedIn: row.linkedinPersonUrl,
      salesNavigatorUrl: null,
    };
  }
}

export const storage = new Storage();
