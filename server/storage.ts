import {
  type User, type InsertUser,
  type CargoListing, type InsertCargoListing,
  type TruckListing, type InsertTruckListing,
  type Notification, type InsertNotification,
  type Announcement, type InsertAnnouncement,
  users, cargoListings, truckListings, notifications, announcements
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteSessionsByUserId(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  approveUser(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getCargoListings(): Promise<CargoListing[]>;
  getCargoListing(id: string): Promise<CargoListing | undefined>;
  createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing>;

  getTruckListings(): Promise<TruckListing[]>;
  getTruckListing(id: string): Promise<TruckListing | undefined>;
  createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing>;

  updateUserProfile(id: string, data: Partial<Pick<User, "companyName" | "address" | "contactName" | "phone" | "fax" | "email">>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;

  deleteCargoListing(id: string): Promise<boolean>;
  deleteTruckListing(id: string): Promise<boolean>;
  incrementCargoViewCount(id: string): Promise<void>;
  updateCargoStatus(id: string, status: string): Promise<CargoListing | undefined>;
  updateCargoListing(id: string, data: Partial<CargoListing>): Promise<CargoListing | undefined>;

  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement & { isPublished: boolean }>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await db.execute(
      `DELETE FROM "session" WHERE sess::text LIKE '%"userId":"${userId}"%'`
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async approveUser(id: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ approved: true }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<Pick<User, "companyName" | "address" | "contactName" | "phone" | "fax" | "email">>): Promise<User | undefined> {
    const updateData: Record<string, string | null> = {};
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.contactName !== undefined) updateData.contactName = data.contactName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.fax !== undefined) updateData.fax = data.fax;
    if (data.email !== undefined) {
      updateData.email = data.email;
      updateData.username = data.email;
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return user;
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

  async incrementCargoViewCount(id: string): Promise<void> {
    await db.update(cargoListings)
      .set({ viewCount: sql`${cargoListings.viewCount} + 1` })
      .where(eq(cargoListings.id, id));
  }

  async updateCargoStatus(id: string, status: string): Promise<CargoListing | undefined> {
    const [updated] = await db.update(cargoListings)
      .set({ status })
      .where(eq(cargoListings.id, id))
      .returning();
    return updated;
  }

  async updateCargoListing(id: string, data: Partial<CargoListing>): Promise<CargoListing | undefined> {
    const { id: _id, createdAt: _createdAt, userId: _userId, ...safeData } = data as any;
    const [updated] = await db.update(cargoListings)
      .set(safeData)
      .where(eq(cargoListings.id, id))
      .returning();
    return updated;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const unread = await db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return unread.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return result.length > 0;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [item] = await db.select().from(announcements).where(eq(announcements.id, id));
    return item;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement & { isPublished: boolean }>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
