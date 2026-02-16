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
  arrivalArea: text("arrival_area").notNull(),
  cargoType: text("cargo_type").notNull(),
  weight: text("weight").notNull(),
  desiredDate: text("desired_date").notNull(),
  arrivalDate: text("arrival_date"),
  vehicleType: text("vehicle_type").notNull(),
  price: text("price"),
  description: text("description"),
  companyName: text("company_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("active"),
  userId: varchar("user_id"),
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, role: true, approved: true });
export const insertCargoListingSchema = createInsertSchema(cargoListings).omit({ id: true, createdAt: true, status: true, userId: true });
export const insertTruckListingSchema = createInsertSchema(truckListings).omit({ id: true, createdAt: true, status: true, userId: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCargoListing = z.infer<typeof insertCargoListingSchema>;
export type CargoListing = typeof cargoListings.$inferSelect;
export type InsertTruckListing = z.infer<typeof insertTruckListingSchema>;
export type TruckListing = typeof truckListings.$inferSelect;
