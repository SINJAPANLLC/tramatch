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
});

export const cargoListings = pgTable("cargo_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  companyName: text("company_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("active"),
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, role: true, approved: true });
export const insertCargoListingSchema = createInsertSchema(cargoListings).omit({ id: true, createdAt: true, status: true, userId: true, viewCount: true });
export const insertTruckListingSchema = createInsertSchema(truckListings).omit({ id: true, createdAt: true, status: true, userId: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });

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
