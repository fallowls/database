import { sql } from "drizzle-orm";
import {
  pgTable,
  pgSchema,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  uuid,
  date,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

/**
 * IMPORTANT
 * This schema mirrors the EXISTING Neon core schema.
 * Core tables live under the `core` schema:
 * - core.companies
 * - core.leads
 */

const core = pgSchema("core");

// =====================
// Canonical companies
// =====================
export const companies = core.table(
  "companies",
  {
    companyId: uuid("company_id").primaryKey().default(sql`gen_random_uuid()`),

    companyDomain: text("company_domain"),
    companyName: text("company_name"),
    companyWebsite: text("company_website"),
    companyLinkedinUrl: text("company_linkedin_url"),

    industry: text("industry"),
    subIndustry: text("sub_industry"),
    technologies: text("technologies").array(),
    specialties: text("specialties"),

    employeeCount: integer("employee_count"),
    revenue: bigint("revenue", { mode: "number" }),
    yearFounded: integer("year_founded"),

    companyCity: text("company_city"),
    companyState: text("company_state"),
    companyCountry: text("company_country"),

    totalFunding: bigint("total_funding", { mode: "number" }),
    latestFunding: bigint("latest_funding", { mode: "number" }),
    lastRaisedAt: date("last_raised_at"),
    ipoStatus: boolean("ipo_status"),
    ipoDate: date("ipo_date"),

    source: text("source"),
    batchId: text("batch_id"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),

    // Canonicalization
    companyWebsiteNormalized: text("company_website_normalized"),
    companyLinkedinUrlNormalized: text("company_linkedin_url_normalized"),
    companyDomainNormalized: text("company_domain_normalized"),

    countryIso2: text("country_iso2"),
    stateRegion: text("state_region"),

    isActive: boolean("is_active"),
    validationFlags: jsonb("validation_flags"),

    mergedInto: uuid("merged_into"),
    mergeReason: text("merge_reason"),
    mergeConfidence: numeric("merge_confidence"),
    isCanonical: boolean("is_canonical"),


    // Apollo enrichment fields added during account imports
    facebookUrl: text("facebook_url"),
    twitterUrl: text("twitter_url"),
    logoUrl: text("logo_url"),
    sicCodes: text("sic_codes"),
    naicsCodes: text("naics_codes"),
    apolloAccountId: text("apollo_account_id"),
    retailLocations: integer("retail_locations"),

    intentPrimaryTopic: text("intent_primary_topic"),
    intentPrimaryScore: integer("intent_primary_score"),
    intentSecondaryTopic: text("intent_secondary_topic"),
    intentSecondaryScore: integer("intent_secondary_score"),

    accountStage: text("account_stage"),
    accountOwner: text("account_owner"),
    lists: text("lists"),
    subsidiaryOf: text("subsidiary_of"),

    companyDescription: text("company_description"),
    companyPhone: text("company_phone"),
    companyAddress: text("company_address"),
  },
  (t) => [
    // only the most obvious / low-risk indexes
    index("companies_domain_norm_idx").on(t.companyDomainNormalized),
    index("companies_linkedin_norm_idx").on(t.companyLinkedinUrlNormalized),
  ]
);

// Backwards-compat alias
export const company = companies;

// =====================
// Leads (wide)
// =====================
export const leads = core.table(
  "leads",
  {
    leadId: uuid("lead_id").primaryKey().default(sql`gen_random_uuid()`),

    companyId: uuid("company_id"),

    firstName: text("first_name"),
    lastName: text("last_name"),
    nameNormalized: text("name_normalized"),

    titleRaw: text("title_raw"),
    titleNormalized: text("title_normalized"),
    seniorityLevel: text("seniority_level"),
    departmentPrimary: text("department_primary"),

    linkedinPersonUrl: text("linkedin_person_url"),

    emailPrimary: text("email_primary"),
    emailSecondary: text("email_secondary"),
    emailSecondary2: text("email_secondary_2"),
    emailIsValid: boolean("email_is_valid"),
    emailVerified: boolean("email_verified"),
    emailConfidence: integer("email_confidence"),

    phoneMobile: text("phone_mobile"),
    phoneWork: text("phone_work"),
    phoneOther: text("phone_other"),

    phoneMobileSecondary: text("phone_mobile_secondary"),
    phoneWorkSecondary: text("phone_work_secondary"),
    phoneOtherSecondary: text("phone_other_secondary"),

    personCity: text("person_city"),
    personState: text("person_state"),
    personCountry: text("person_country"),
    personCountryIso2: text("person_country_iso2"),

    companyName: text("company_name"),
    companyDomain: text("company_domain"),
    companyWebsite: text("company_website"),
    companyLinkedinUrl: text("company_linkedin_url"),

    industry: text("industry"),
    companyCountry: text("company_country"),
    companyCountryIso2: text("company_country_iso2"),

    dedupeKey: text("dedupe_key"),
    isIncomplete: boolean("is_incomplete"),
    validationFlags: jsonb("validation_flags"),

    source: text("source"),
    batchId: text("batch_id"),
    fieldSources: jsonb("field_sources"),

    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [
    index("leads_dedupe_key_idx").on(t.dedupeKey),
    index("leads_company_id_idx").on(t.companyId),
    index("leads_email_primary_idx").on(t.emailPrimary),
    index("leads_linkedin_person_idx").on(t.linkedinPersonUrl),
  ]
);

// Backwards-compat alias (treat leads as contacts)
export const contacts = leads;

// =====================
// Aliases (for name/domain merges)
// =====================
export const accountAliases = pgTable(
  "account_aliases",
  {
    aliasId: uuid("alias_id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: uuid("company_id"),
    aliasType: text("alias_type"),
    aliasValue: text("alias_value"),
    aliasValueNormalized: text("alias_value_normalized"),
    confidence: numeric("confidence"),
    source: text("source"),
    batchId: text("batch_id"),
    createdAt: timestamp("created_at"),
  },
  (t) => [
    index("account_aliases_company_id_idx").on(t.companyId),
    index("account_aliases_value_norm_idx").on(t.aliasValueNormalized),
  ]
);

// =====================
// Staging tables (minimal typing)
// =====================
export const stagingApollo = pgTable("staging_apollo", {
  // staging tables are ephemeral; keep minimal columns used by pipeline
  batchId: text("batch_id"),
  rawJson: jsonb("raw_json"),
});

export const stagingLusha = pgTable("staging_lusha", {
  batchId: text("batch_id"),
  rawJson: jsonb("raw_json"),
});

export const stagingCompanyApolloAccounts = pgTable("staging_company_apollo_accounts", {
  batchId: text("batch_id"),
  rawJson: jsonb("raw_json"),
});

// =====================
// Users & Auth
// =====================
export const users = core.table("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'admin' | 'user'
  planId: text("plan_id").default("free"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const authSessions = core.table("auth_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================
// Insert schemas (basic)
// =====================
export const insertCompanySchema = createInsertSchema(companies);
export const insertLeadSchema = createInsertSchema(leads);
export const insertContactSchema = createInsertSchema(contacts);
export const insertUserSchema = createInsertSchema(users);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof insertCompanySchema._type;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof insertLeadSchema._type;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof insertContactSchema._type;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema._type;

export type AuthSession = typeof authSessions.$inferSelect;

// =====================
// Zod schemas for auth forms
// =====================
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
