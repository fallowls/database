import { sql } from "drizzle-orm";
import {
  pgTable,
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
 * This schema mirrors the EXISTING Neon database schema used by Ansh.
 * It intentionally replaces the old CRM schema entirely.
 *
 * Tables present in Neon (public):
 * - company
 * - leads
 * - contacts
 * - account_aliases
 * - staging_apollo
 * - staging_lusha
 * - staging_company_apollo_accounts
 */

// =====================
// Canonical accounts
// =====================
export const company = pgTable(
  "company",
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
    companyNameCanonical: text("company_name_canonical"),
    companyNameNormalized: text("company_name_normalized"),
    companyWebsiteNormalized: text("company_website_normalized"),
    companyLinkedinUrlNormalized: text("company_linkedin_url_normalized"),
    companyDomainNormalized: text("company_domain_normalized"),

    industryCategory: text("industry_category"),
    countryIso2: text("country_iso2"),
    stateRegion: text("state_region"),

    isActive: boolean("is_active"),
    validationFlags: jsonb("validation_flags"),

    mergedInto: uuid("merged_into"),
    mergeReason: text("merge_reason"),
    mergeConfidence: numeric("merge_confidence"),
    isCanonical: boolean("is_canonical"),
    companyNameDerived: text("company_name_derived"),

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
    index("company_domain_norm_idx").on(t.companyDomainNormalized),
    index("company_linkedin_norm_idx").on(t.companyLinkedinUrlNormalized),
  ]
);

// =====================
// Raw leads (wide)
// =====================
export const leads = pgTable(
  "leads",
  {
    leadId: uuid("lead_id").primaryKey().default(sql`gen_random_uuid()`),

    firstName: text("first_name"),
    lastName: text("last_name"),
    title: text("title"),
    titleSecondary: text("title_secondary"),

    seniority: text("seniority"),
    departments: text("departments").array(),

    linkedinPersonUrl: text("linkedin_person_url"),

    emailPrimary: text("email_primary"),
    emailSecondary: text("email_secondary"),
    emailSecondary2: text("email_secondary_2"),
    emailConfidence: integer("email_confidence"),
    emailVerified: boolean("email_verified"),

    phoneMobile: text("phone_mobile"),
    phoneWork: text("phone_work"),
    phoneOther: text("phone_other"),

    phoneMobileSecondary: text("phone_mobile_secondary"),
    phoneWorkSecondary: text("phone_work_secondary"),
    phoneOtherSecondary: text("phone_other_secondary"),

    personCity: text("person_city"),
    personState: text("person_state"),
    personCountry: text("person_country"),

    companyName: text("company_name"),
    companyNameForEmails: text("company_name_for_emails"),
    companyNameNormalized: text("company_name_normalized"),

    companyDomain: text("company_domain"),
    companyWebsite: text("company_website"),
    companyLinkedinUrl: text("company_linkedin_url"),

    industry: text("industry"),
    companyDescription: text("company_description"),

    keywords: text("keywords").array(),
    technologies: text("technologies").array(),

    employeeCount: integer("employee_count"),
    revenue: bigint("revenue", { mode: "number" }),
    yearFounded: integer("year_founded"),

    companyPhone: text("company_phone"),
    companyAddress: text("company_address"),
    companyCity: text("company_city"),
    companyState: text("company_state"),
    companyCountry: text("company_country"),

    totalFunding: bigint("total_funding", { mode: "number" }),
    latestFunding: bigint("latest_funding", { mode: "number" }),
    lastRaisedAt: date("last_raised_at"),
    ipoStatus: boolean("ipo_status"),
    ipoDate: date("ipo_date"),

    source: text("source"),
    sourcePersonId: text("source_person_id"),
    sourceCompanyId: text("source_company_id"),

    stage: text("stage"),
    lastContacted: date("last_contacted"),
    emailSent: boolean("email_sent"),
    emailOpen: boolean("email_open"),
    emailBounced: boolean("email_bounced"),
    replied: boolean("replied"),
    demoed: boolean("demoed"),

    lists: text("lists").array(),

    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    lastUpdatedSource: text("last_updated_source"),
    batchId: text("batch_id"),
    fieldSources: jsonb("field_sources"),

    companyId: uuid("company_id"),

    // normalization/validation
    titleNormalized: text("title_normalized"),
    seniorityLevel: text("seniority_level"),
    departmentPrimary: text("department_primary"),
    personCountryIso2: text("person_country_iso2"),
    companyCountryIso2: text("company_country_iso2"),

    emailIsValid: boolean("email_is_valid"),
    phoneMobileIsValid: boolean("phone_mobile_is_valid"),
    phoneWorkIsValid: boolean("phone_work_is_valid"),
    phoneOtherIsValid: boolean("phone_other_is_valid"),

    isIncomplete: boolean("is_incomplete"),
    validationFlags: jsonb("validation_flags"),

    // dedupe
    dedupeKey: text("dedupe_key"),
    isDuplicate: boolean("is_duplicate"),
    duplicateOf: uuid("duplicate_of"),

    nameNormalized: text("name_normalized"),
  },
  (t) => [
    index("leads_dedupe_key_idx").on(t.dedupeKey),
    index("leads_company_id_idx").on(t.companyId),
    index("leads_email_primary_idx").on(t.emailPrimary),
    index("leads_linkedin_person_idx").on(t.linkedinPersonUrl),
  ]
);

// =====================
// Canonical contacts (1 per dedupe_key)
// =====================
export const contacts = pgTable(
  "contacts",
  {
    contactId: uuid("contact_id").primaryKey().default(sql`gen_random_uuid()`),
    companyId: uuid("company_id"),
    sourceLeadId: uuid("source_lead_id"),
    dedupeKey: text("dedupe_key"),

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

    isIncomplete: boolean("is_incomplete"),
    validationFlags: jsonb("validation_flags"),

    source: text("source"),
    batchId: text("batch_id"),
    fieldSources: jsonb("field_sources"),

    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [
    index("contacts_dedupe_key_idx").on(t.dedupeKey),
    index("contacts_company_id_idx").on(t.companyId),
    index("contacts_email_primary_idx").on(t.emailPrimary),
    index("contacts_linkedin_person_idx").on(t.linkedinPersonUrl),
  ]
);

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
// Insert schemas (basic)
// =====================
export const insertCompanySchema = createInsertSchema(company);
export const insertLeadSchema = createInsertSchema(leads);
export const insertContactSchema = createInsertSchema(contacts);

export type Company = typeof company.$inferSelect;
export type InsertCompany = typeof insertCompanySchema._type;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof insertLeadSchema._type;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof insertContactSchema._type;
