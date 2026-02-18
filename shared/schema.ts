import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  address: text("address"),
  contactName: text("contact_name"),
  phone: text("phone").notNull(),
  fax: text("fax"),
  email: text("email").notNull().unique(),
  truckCount: text("truck_count"),
  permitFile: text("permit_file"),
  userType: text("user_type").notNull(),
  role: text("role").notNull().default("user"),
  approved: boolean("approved").notNull().default(false),
  paymentTerms: text("payment_terms"),
  businessDescription: text("business_description"),
  companyNameKana: text("company_name_kana"),
  postalCode: text("postal_code"),
  websiteUrl: text("website_url"),
  invoiceRegistrationNumber: text("invoice_registration_number"),
  registrationDate: text("registration_date"),
  representative: text("representative"),
  establishedDate: text("established_date"),
  capital: text("capital"),
  employeeCount: text("employee_count"),
  officeLocations: text("office_locations"),
  annualRevenue: text("annual_revenue"),
  bankInfo: text("bank_info"),
  majorClients: text("major_clients"),
  closingDay: text("closing_day"),
  paymentMonth: text("payment_month"),
  businessArea: text("business_area"),
  autoInvoiceAcceptance: text("auto_invoice_acceptance"),
  memberOrganization: text("member_organization"),
  transportLicenseNumber: text("transport_license_number"),
  digitalTachographCount: text("digital_tachograph_count"),
  gpsCount: text("gps_count"),
  safetyExcellenceCert: text("safety_excellence_cert"),
  greenManagementCert: text("green_management_cert"),
  iso9000: text("iso9000"),
  iso14000: text("iso14000"),
  iso39001: text("iso39001"),
  cargoInsurance: text("cargo_insurance"),
  plan: text("plan").notNull().default("free"),
});

export const cargoListings = pgTable("cargo_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cargoNumber: integer("cargo_number"),
  title: text("title").notNull(),
  departureArea: text("departure_area").notNull(),
  departureAddress: text("departure_address"),
  departureTime: text("departure_time"),
  arrivalArea: text("arrival_area").notNull(),
  arrivalAddress: text("arrival_address"),
  arrivalTime: text("arrival_time"),
  cargoType: text("cargo_type").notNull(),
  weight: text("weight").notNull(),
  desiredDate: text("desired_date").notNull(),
  arrivalDate: text("arrival_date"),
  vehicleType: text("vehicle_type").notNull(),
  bodyType: text("body_type"),
  temperatureControl: text("temperature_control"),
  price: text("price"),
  highwayFee: text("highway_fee"),
  transportType: text("transport_type"),
  consolidation: text("consolidation"),
  driverWork: text("driver_work"),
  packageCount: text("package_count"),
  loadingMethod: text("loading_method"),
  description: text("description"),
  urgency: text("urgency"),
  movingJob: text("moving_job"),
  vehicleSpec: text("vehicle_spec"),
  equipment: text("equipment"),
  loadingTime: text("loading_time"),
  unloadingTime: text("unloading_time"),
  paymentDate: text("payment_date"),
  contactPerson: text("contact_person"),
  taxType: text("tax_type"),
  companyName: text("company_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("active"),
  listingType: text("listing_type").notNull().default("own"),
  userId: varchar("user_id"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const truckListings = pgTable("truck_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  currentArea: text("current_area").notNull(),
  destinationArea: text("destination_area").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  bodyType: text("body_type"),
  maxWeight: text("max_weight").notNull(),
  availableDate: text("available_date").notNull(),
  price: text("price"),
  description: text("description"),
  companyName: text("company_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("active"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: varchar("related_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dispatchRequests = pgTable("dispatch_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cargoId: varchar("cargo_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("draft"),
  transportCompany: text("transport_company"),
  shipperCompany: text("shipper_company"),
  contactPerson: text("contact_person"),
  loadingDate: text("loading_date"),
  loadingTime: text("loading_time"),
  loadingPlace: text("loading_place"),
  unloadingDate: text("unloading_date"),
  unloadingTime: text("unloading_time"),
  unloadingPlace: text("unloading_place"),
  cargoType: text("cargo_type"),
  totalWeight: text("total_weight"),
  weightVehicle: text("weight_vehicle"),
  notes: text("notes"),
  vehicleEquipment: text("vehicle_equipment"),
  fare: text("fare"),
  highwayFee: text("highway_fee"),
  waitingFee: text("waiting_fee"),
  additionalWorkFee: text("additional_work_fee"),
  exportFee: text("export_fee"),
  parkingFee: text("parking_fee"),
  customsFee: text("customs_fee"),
  fuelSurcharge: text("fuel_surcharge"),
  totalAmount: text("total_amount"),
  tax: text("tax"),
  paymentMethod: text("payment_method"),
  paymentDueDate: text("payment_due_date"),
  primeContractorName: text("prime_contractor_name"),
  primeContractorPhone: text("prime_contractor_phone"),
  primeContractorContact: text("prime_contractor_contact"),
  contractLevel: text("contract_level"),
  actualShipperName: text("actual_shipper_name"),
  actualTransportCompany: text("actual_transport_company"),
  vehicleNumber: text("vehicle_number"),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  transportCompanyNotes: text("transport_company_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyName: text("company_name").notNull(),
  companyNameKana: text("company_name_kana"),
  representative: text("representative"),
  contactName: text("contact_name"),
  phone: text("phone"),
  fax: text("fax"),
  email: text("email"),
  postalCode: text("postal_code"),
  address: text("address"),
  businessType: text("business_type"),
  truckCount: text("truck_count"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transportRecords = pgTable("transport_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cargoId: varchar("cargo_id"),
  transportCompany: text("transport_company").notNull(),
  shipperName: text("shipper_name"),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  vehicleNumber: text("vehicle_number"),
  vehicleType: text("vehicle_type"),
  departureArea: text("departure_area"),
  arrivalArea: text("arrival_area"),
  transportDate: text("transport_date"),
  cargoDescription: text("cargo_description"),
  fare: text("fare"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seoArticles = pgTable("seo_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  keywords: text("keywords"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, role: true, approved: true });
export const insertCargoListingSchema = createInsertSchema(cargoListings).omit({ id: true, cargoNumber: true, createdAt: true, status: true, userId: true, viewCount: true });
export const insertTruckListingSchema = createInsertSchema(truckListings).omit({ id: true, createdAt: true, status: true, userId: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDispatchRequestSchema = createInsertSchema(dispatchRequests).omit({ id: true, createdAt: true, sentAt: true });
export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true });
export const insertTransportRecordSchema = createInsertSchema(transportRecords).omit({ id: true, createdAt: true });
export const insertSeoArticleSchema = createInsertSchema(seoArticles).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCargoListing = z.infer<typeof insertCargoListingSchema>;
export type CargoListing = typeof cargoListings.$inferSelect;
export type InsertTruckListing = z.infer<typeof insertTruckListingSchema>;
export type TruckListing = typeof truckListings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertDispatchRequest = z.infer<typeof insertDispatchRequestSchema>;
export type DispatchRequest = typeof dispatchRequests.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertTransportRecord = z.infer<typeof insertTransportRecordSchema>;
export type TransportRecord = typeof transportRecords.$inferSelect;
export type InsertSeoArticle = z.infer<typeof insertSeoArticleSchema>;
export type SeoArticle = typeof seoArticles.$inferSelect;
export type AdminSetting = typeof adminSettings.$inferSelect;
