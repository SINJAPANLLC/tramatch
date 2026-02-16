import {
  type User, type InsertUser,
  type CargoListing, type InsertCargoListing,
  type TruckListing, type InsertTruckListing,
  users, cargoListings, truckListings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  getCargoListings(): Promise<CargoListing[]>;
  getCargoListing(id: string): Promise<CargoListing | undefined>;
  createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing>;

  getTruckListings(): Promise<TruckListing[]>;
  getTruckListing(id: string): Promise<TruckListing | undefined>;
  createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing>;

  deleteCargoListing(id: string): Promise<boolean>;
  deleteTruckListing(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getCargoListings(): Promise<CargoListing[]> {
    return db.select().from(cargoListings).orderBy(desc(cargoListings.createdAt));
  }

  async getCargoListing(id: string): Promise<CargoListing | undefined> {
    const [listing] = await db.select().from(cargoListings).where(eq(cargoListings.id, id));
    return listing;
  }

  async createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing> {
    const [created] = await db.insert(cargoListings).values({ ...listing, userId: userId || null }).returning();
    return created;
  }

  async getTruckListings(): Promise<TruckListing[]> {
    return db.select().from(truckListings).orderBy(desc(truckListings.createdAt));
  }

  async getTruckListing(id: string): Promise<TruckListing | undefined> {
    const [listing] = await db.select().from(truckListings).where(eq(truckListings.id, id));
    return listing;
  }

  async createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing> {
    const [created] = await db.insert(truckListings).values({ ...listing, userId: userId || null }).returning();
    return created;
  }

  async deleteCargoListing(id: string): Promise<boolean> {
    const result = await db.delete(cargoListings).where(eq(cargoListings.id, id)).returning();
    return result.length > 0;
  }

  async deleteTruckListing(id: string): Promise<boolean> {
    const result = await db.delete(truckListings).where(eq(truckListings.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
